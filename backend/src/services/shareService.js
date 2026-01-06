const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const config = require('../../config/config');
const logger = require('../utils/logger');
const validator = require('../utils/validator');
const noteService = require('./noteService');
const userService = require('./userService');

/**
 * Service de partage de notes avec gestion des permissions et verrouillage
 */
class ShareService {
  constructor() {
    this.sharesFile = config.storage.sharesFile;
    this.ensureShareStorage();
  }

  /**
   * Crée les répertoires de stockage
   */
  ensureShareStorage() {
    const dir = path.dirname(this.sharesFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (!fs.existsSync(this.sharesFile)) {
      this.saveShares([]);
    }
  }

  /**
   * Charge les partages
   */
  loadShares() {
    try {
      if (!fs.existsSync(this.sharesFile)) {
        return [];
      }

      const data = fs.readFileSync(this.sharesFile, 'utf8');
      if (!data.trim()) {
        return [];
      }

      return JSON.parse(data);
    } catch (error) {
      logger.error('Failed to load shares', { error: error.message });
      return [];
    }
  }

  /**
   * Sauvegarde les partages
   */
  saveShares(shares) {
    try {
      fs.writeFileSync(
        this.sharesFile,
        JSON.stringify(shares, null, 2),
        'utf8'
      );
    } catch (error) {
      logger.error('Failed to save shares', { error: error.message });
      throw new Error('Failed to save share data');
    }
  }

  /**
   * Partage une note avec un autre utilisateur
   */
  async shareNote(ownerId, noteId, targetUsername, permission) {
    // Validation
    const idValidation = validator.validateUUID(noteId);
    if (!idValidation.valid) {
      throw new Error(idValidation.error);
    }

    const usernameValidation = validator.validateUsername(targetUsername);
    if (!usernameValidation.valid) {
      throw new Error(usernameValidation.error);
    }

    const permissionValidation = validator.validatePermission(permission);
    if (!permissionValidation.valid) {
      throw new Error(permissionValidation.error);
    }

    // Vérifie que la note existe et appartient à l'utilisateur
    if (!noteService.noteExists(ownerId, noteId)) {
      throw new Error('Note not found or you do not have permission');
    }

    // Récupère l'utilisateur cible
    const users = userService.loadUsers();
    const targetUser = users.find(u => u.username === targetUsername);

    if (!targetUser) {
      throw new Error('Target user not found');
    }

    if (targetUser.id === ownerId) {
      throw new Error('Cannot share note with yourself');
    }

    // Vérifie si le partage existe déjà
    const shares = this.loadShares();
    const existingShare = shares.find(
      s => s.noteId === noteId && s.sharedWith === targetUser.id
    );

    if (existingShare) {
      // Met à jour la permission
      existingShare.permission = permission;
      existingShare.updatedAt = new Date().toISOString();
      this.saveShares(shares);

      logger.info('Share updated', { 
        ownerId, 
        noteId, 
        sharedWith: targetUser.id, 
        permission 
      });

      return existingShare;
    }

    // Crée le partage
    const share = {
      id: uuidv4(),
      noteId,
      owner: ownerId,
      sharedWith: targetUser.id,
      sharedWithUsername: targetUser.username,
      permission, // 'read' ou 'write'
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    shares.push(share);
    this.saveShares(shares);

    logger.info('Note shared', { 
      ownerId, 
      noteId, 
      sharedWith: targetUser.id, 
      permission 
    });

    return share;
  }

  /**
   * Récupère un partage spécifique pour un utilisateur
   */
  getShareForUser(userId, noteId) {
    const shares = this.loadShares();
    return shares.find(s => s.sharedWith === userId && s.noteId === noteId);
  }

  /**
   * Récupère les informations du propriétaire
   */
  async getOwner(ownerId) {
    const users = userService.loadUsers();
    const owner = users.find(u => u.id === ownerId);
    if (!owner) {
      throw new Error('Owner not found');
    }
    return owner;
  }

  /**
   * Récupère les notes partagées avec un utilisateur
   */
  getSharedWithMe(userId) {
    const shares = this.loadShares();
    const myShares = shares.filter(s => s.sharedWith === userId);

    // Enrichit avec les métadonnées des notes
    return myShares.map(share => {
      const noteMetadata = noteService.getNoteMetadata(share.owner, share.noteId);
      
      return {
        shareId: share.id,
        noteId: share.noteId,
        owner: share.owner,
        permission: share.permission,
        title: noteMetadata ? noteMetadata.title : 'Unknown',
        createdAt: share.createdAt,
        locked: noteMetadata ? noteMetadata.locked : false,
        lockedBy: noteMetadata ? noteMetadata.lockedBy : null
      };
    });
  }

  /**
   * Liste les notes que j'ai partagées
   */
  getSharedByMe(userId) {
    const shares = this.loadShares();
    return shares.filter(s => s.owner === userId).map(share => ({
      shareId: share.id,
      noteId: share.noteId,
      sharedWith: share.sharedWith,
      sharedWithUsername: share.sharedWithUsername,
      permission: share.permission,
      createdAt: share.createdAt
    }));
  }

  /**
   * Vérifie si un utilisateur a accès à une note
   */
  hasAccess(userId, noteId, requiredPermission = 'read') {
    // Si c'est le propriétaire, il a tous les droits
    if (noteService.noteExists(userId, noteId)) {
      return { hasAccess: true, isOwner: true };
    }

    // Vérifie les partages
    const shares = this.loadShares();
    const share = shares.find(
      s => s.noteId === noteId && s.sharedWith === userId
    );

    if (!share) {
      return { hasAccess: false, isOwner: false };
    }

    // Vérifie la permission
    if (requiredPermission === 'write' && share.permission !== 'write') {
      return { hasAccess: false, isOwner: false, insufficientPermission: true };
    }

    return { 
      hasAccess: true, 
      isOwner: false, 
      ownerId: share.owner,
      permission: share.permission 
    };
  }

  /**
   * Révoque un partage
   */
  async revokeShare(userId, shareId) {
    const idValidation = validator.validateUUID(shareId);
    if (!idValidation.valid) {
      throw new Error(idValidation.error);
    }

    const shares = this.loadShares();
    const shareIndex = shares.findIndex(s => s.id === shareId);

    if (shareIndex === -1) {
      throw new Error('Share not found');
    }

    const share = shares[shareIndex];

    // Seul le propriétaire peut révoquer
    if (share.owner !== userId) {
      throw new Error('Only the owner can revoke a share');
    }

    shares.splice(shareIndex, 1);
    this.saveShares(shares);

    logger.info('Share revoked', { userId, shareId, noteId: share.noteId });

    return { success: true, message: 'Share revoked successfully' };
  }

  /**
   * Verrouille une note pour écriture exclusive
   */
  async lockNote(userId, noteId) {
    const idValidation = validator.validateUUID(noteId);
    if (!idValidation.valid) {
      throw new Error(idValidation.error);
    }

    // Vérifie l'accès en écriture
    const access = this.hasAccess(userId, noteId, 'write');
    
    if (!access.hasAccess) {
      throw new Error('You do not have write access to this note');
    }

    // Récupère la note (du propriétaire)
    const ownerId = access.isOwner ? userId : access.ownerId;
    const noteMetadata = noteService.getNoteMetadata(ownerId, noteId);

    if (!noteMetadata) {
      throw new Error('Note not found');
    }

    // Vérifie si déjà verrouillée
    if (noteMetadata.locked && noteMetadata.lockedBy !== userId) {
      throw new Error(`Note is already locked by user ${noteMetadata.lockedBy}`);
    }

    // Verrouille
    noteMetadata.locked = true;
    noteMetadata.lockedBy = userId;
    noteMetadata.lockedAt = new Date().toISOString();

    const metadata = noteService.loadUserMetadata(ownerId);
    const noteIndex = metadata.findIndex(n => n.id === noteId);
    metadata[noteIndex] = noteMetadata;
    noteService.saveUserMetadata(ownerId, metadata);

    logger.info('Note locked', { userId, noteId, ownerId });

    return noteMetadata;
  }

  /**
   * Déverrouille une note
   */
  async unlockNote(userId, noteId) {
    const idValidation = validator.validateUUID(noteId);
    if (!idValidation.valid) {
      throw new Error(idValidation.error);
    }

    const access = this.hasAccess(userId, noteId, 'write');
    
    if (!access.hasAccess) {
      throw new Error('You do not have access to this note');
    }

    const ownerId = access.isOwner ? userId : access.ownerId;
    const noteMetadata = noteService.getNoteMetadata(ownerId, noteId);

    if (!noteMetadata) {
      throw new Error('Note not found');
    }

    if (!noteMetadata.locked) {
      throw new Error('Note is not locked');
    }

    if (noteMetadata.lockedBy !== userId && ownerId !== userId) {
      throw new Error('Only the user who locked the note or the owner can unlock it');
    }

    // Déverrouille
    noteMetadata.locked = false;
    noteMetadata.lockedBy = null;
    delete noteMetadata.lockedAt;

    const metadata = noteService.loadUserMetadata(ownerId);
    const noteIndex = metadata.findIndex(n => n.id === noteId);
    metadata[noteIndex] = noteMetadata;
    noteService.saveUserMetadata(ownerId, metadata);

    logger.info('Note unlocked', { userId, noteId, ownerId });

    return noteMetadata;
  }

  /**
   * Lit une note partagée
   */
  async readSharedNote(userId, noteId, userKey) {
    const access = this.hasAccess(userId, noteId, 'read');
    
    if (!access.hasAccess) {
      throw new Error('You do not have access to this note');
    }

    const ownerId = access.isOwner ? userId : access.ownerId;

    // Si c'est le propriétaire, utilise sa propre clé
    if (access.isOwner) {
      return await noteService.readNote(ownerId, noteId, userKey);
    }

    // Sinon, récupère la clé du propriétaire
    const owner = await this.getOwner(ownerId);
    return await noteService.readSharedNote(ownerId, owner.username, noteId, userId);
  }

  /**
   * Met à jour une note partagée
   */
  async updateSharedNote(userId, noteId, title, content, userKey) {
    const access = this.hasAccess(userId, noteId, 'write');
    
    if (!access.hasAccess) {
      if (access.insufficientPermission) {
        throw new Error('You only have read permission for this note');
      }
      throw new Error('You do not have access to this note');
    }

    const ownerId = access.isOwner ? userId : access.ownerId;

    // Si c'est le propriétaire, utilise sa propre clé
    if (access.isOwner) {
      return await noteService.updateNote(ownerId, noteId, title, content, userKey);
    }

    // Sinon, récupère la clé du propriétaire
    const owner = await this.getOwner(ownerId);
    return await noteService.updateSharedNote(ownerId, owner.username, noteId, title, content, userId);
  }
}

module.exports = new ShareService();
