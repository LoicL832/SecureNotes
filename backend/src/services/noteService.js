const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const config = require('../../config/config');
const logger = require('../utils/logger');
const validator = require('../utils/validator');
const { encrypt, decrypt } = require('../utils/crypto');
const userService = require('./userService');

/**
 * Service de gestion des notes avec chiffrement AES-256-GCM
 */
class NoteService {
  constructor() {
    this.notesDir = config.storage.notesDir;
    this.ensureNoteStorage();
  }

  /**
   * Crée les répertoires de stockage
   */
  ensureNoteStorage() {
    if (!fs.existsSync(this.notesDir)) {
      fs.mkdirSync(this.notesDir, { recursive: true });
    }
  }

  /**
   * Crée le répertoire d'un utilisateur
   */
  ensureUserDirectory(userId) {
    const userDir = path.join(this.notesDir, userId);
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }
    return userDir;
  }

  /**
   * Charge les métadonnées des notes d'un utilisateur
   */
  loadUserMetadata(userId) {
    const userDir = this.ensureUserDirectory(userId);
    const metadataFile = path.join(userDir, 'metadata.json');

    try {
      if (!fs.existsSync(metadataFile)) {
        return [];
      }

      const data = fs.readFileSync(metadataFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      logger.error('Failed to load metadata', { userId, error: error.message });
      return [];
    }
  }

  /**
   * Sauvegarde les métadonnées
   */
  saveUserMetadata(userId, metadata) {
    const userDir = this.ensureUserDirectory(userId);
    const metadataFile = path.join(userDir, 'metadata.json');

    try {
      fs.writeFileSync(
        metadataFile,
        JSON.stringify(metadata, null, 2),
        'utf8'
      );
    } catch (error) {
      logger.error('Failed to save metadata', { userId, error: error.message });
      throw new Error('Failed to save note metadata');
    }
  }

  /**
   * Crée une nouvelle note
   */
  async createNote(userId, title, content, userKey) {
    // Validation
    const titleValidation = validator.validateNoteTitle(title);
    if (!titleValidation.valid) {
      throw new Error(titleValidation.error);
    }

    const contentValidation = validator.validateNoteContent(content);
    if (!contentValidation.valid) {
      throw new Error(contentValidation.error);
    }

    // Génère l'ID de la note
    const noteId = uuidv4();
    const userDir = this.ensureUserDirectory(userId);
    const noteFile = path.join(userDir, `${noteId}.enc`);

    // Chiffre le contenu
    const encryptedData = encrypt(content, userKey);

    // Sauvegarde le fichier chiffré
    try {
      fs.writeFileSync(noteFile, JSON.stringify(encryptedData), 'utf8');
    } catch (error) {
      logger.error('Failed to save note file', { userId, noteId, error: error.message });
      throw new Error('Failed to save note');
    }

    // Crée les métadonnées
    const metadata = this.loadUserMetadata(userId);
    const noteMetadata = {
      id: noteId,
      title: validator.sanitizeString(title),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      owner: userId,
      locked: false,
      lockedBy: null
    };

    metadata.push(noteMetadata);
    this.saveUserMetadata(userId, metadata);

    logger.info('Note created', { userId, noteId, title });

    return noteMetadata;
  }

  /**
   * Liste les notes d'un utilisateur
   */
  listNotes(userId) {
    const metadata = this.loadUserMetadata(userId);
    
    // Retourne seulement les métadonnées (pas le contenu)
    return metadata.map(note => ({
      id: note.id,
      title: note.title,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
      locked: note.locked,
      lockedBy: note.lockedBy
    }));
  }

  /**
   * Lit une note (propriétaire ou partagée)
   */
  async readNote(userId, noteId, userKey) {
    // Validation
    const idValidation = validator.validateUUID(noteId);
    if (!idValidation.valid) {
      throw new Error(idValidation.error);
    }

    const metadata = this.loadUserMetadata(userId);
    const noteMetadata = metadata.find(n => n.id === noteId);

    if (!noteMetadata) {
      throw new Error('Note not found');
    }

    // Charge le fichier chiffré
    const userDir = path.join(this.notesDir, userId);
    const noteFile = path.join(userDir, `${noteId}.enc`);

    if (!fs.existsSync(noteFile)) {
      logger.error('Note file not found', { userId, noteId });
      throw new Error('Note file not found');
    }

    try {
      const encryptedData = JSON.parse(fs.readFileSync(noteFile, 'utf8'));
      const content = decrypt(encryptedData, userKey);

      logger.info('Note read', { userId, noteId });

      return {
        ...noteMetadata,
        content
      };
    } catch (error) {
      logger.error('Failed to decrypt note', { userId, noteId, error: error.message });
      throw new Error('Failed to decrypt note. Invalid key or corrupted data.');
    }
  }

  /**
   * Lit une note partagée avec la clé du propriétaire
   */
  async readSharedNote(ownerId, ownerKey, noteId, requesterId) {
    // Validation
    const idValidation = validator.validateUUID(noteId);
    if (!idValidation.valid) {
      throw new Error(idValidation.error);
    }

    const metadata = this.loadUserMetadata(ownerId);
    const noteMetadata = metadata.find(n => n.id === noteId);

    if (!noteMetadata) {
      throw new Error('Note not found');
    }

    // Charge le fichier chiffré depuis le répertoire du propriétaire
    const ownerDir = path.join(this.notesDir, ownerId);
    const noteFile = path.join(ownerDir, `${noteId}.enc`);

    if (!fs.existsSync(noteFile)) {
      logger.error('Note file not found', { ownerId, noteId });
      throw new Error('Note file not found');
    }

    try {
      const encryptedData = JSON.parse(fs.readFileSync(noteFile, 'utf8'));
      const content = decrypt(encryptedData, ownerKey);

      logger.info('Shared note read', { ownerId, noteId, requesterId });

      return {
        ...noteMetadata,
        content,
        owner: ownerId
      };
    } catch (error) {
      logger.error('Failed to decrypt shared note', { ownerId, noteId, requesterId, error: error.message });
      throw new Error('Failed to decrypt note. Invalid key or corrupted data.');
    }
  }

  /**
   * Met à jour une note
   */
  async updateNote(userId, noteId, title, content, userKey) {
    // Validation
    const idValidation = validator.validateUUID(noteId);
    if (!idValidation.valid) {
      throw new Error(idValidation.error);
    }

    if (title) {
      const titleValidation = validator.validateNoteTitle(title);
      if (!titleValidation.valid) {
        throw new Error(titleValidation.error);
      }
    }

    if (content !== undefined) {
      const contentValidation = validator.validateNoteContent(content);
      if (!contentValidation.valid) {
        throw new Error(contentValidation.error);
      }
    }

    const metadata = this.loadUserMetadata(userId);
    const noteIndex = metadata.findIndex(n => n.id === noteId);

    if (noteIndex === -1) {
      throw new Error('Note not found');
    }

    const noteMetadata = metadata[noteIndex];

    // Vérifie le verrouillage
    if (noteMetadata.locked && noteMetadata.lockedBy !== userId) {
      throw new Error('Note is locked by another user');
    }

    // Met à jour le titre si fourni
    if (title) {
      noteMetadata.title = validator.sanitizeString(title);
    }

    // Met à jour le contenu si fourni
    if (content !== undefined) {
      const userDir = path.join(this.notesDir, userId);
      const noteFile = path.join(userDir, `${noteId}.enc`);

      const encryptedData = encrypt(content, userKey);

      try {
        fs.writeFileSync(noteFile, JSON.stringify(encryptedData), 'utf8');
      } catch (error) {
        logger.error('Failed to update note file', { userId, noteId, error: error.message });
        throw new Error('Failed to update note');
      }
    }

    noteMetadata.updatedAt = new Date().toISOString();
    metadata[noteIndex] = noteMetadata;
    this.saveUserMetadata(userId, metadata);

    logger.info('Note updated', { userId, noteId });

    return noteMetadata;
  }

  /**
   * Met à jour une note partagée (avec la clé du propriétaire)
   */
  async updateSharedNote(ownerId, ownerKey, noteId, title, content, requesterId) {
    // Validation
    const idValidation = validator.validateUUID(noteId);
    if (!idValidation.valid) {
      throw new Error(idValidation.error);
    }

    if (title) {
      const titleValidation = validator.validateNoteTitle(title);
      if (!titleValidation.valid) {
        throw new Error(titleValidation.error);
      }
    }

    if (content !== undefined) {
      const contentValidation = validator.validateNoteContent(content);
      if (!contentValidation.valid) {
        throw new Error(contentValidation.error);
      }
    }

    const metadata = this.loadUserMetadata(ownerId);
    const noteIndex = metadata.findIndex(n => n.id === noteId);

    if (noteIndex === -1) {
      throw new Error('Note not found');
    }

    const noteMetadata = metadata[noteIndex];

    // Vérifie le verrouillage
    if (noteMetadata.locked && noteMetadata.lockedBy !== requesterId) {
      throw new Error('Note is locked by another user');
    }

    // Met à jour le titre si fourni
    if (title) {
      noteMetadata.title = validator.sanitizeString(title);
    }

    // Met à jour le contenu si fourni (chiffré avec la clé du propriétaire)
    if (content !== undefined) {
      const ownerDir = path.join(this.notesDir, ownerId);
      const noteFile = path.join(ownerDir, `${noteId}.enc`);

      const encryptedData = encrypt(content, ownerKey);

      try {
        fs.writeFileSync(noteFile, JSON.stringify(encryptedData), 'utf8');
      } catch (error) {
        logger.error('Failed to update shared note file', { ownerId, noteId, requesterId, error: error.message });
        throw new Error('Failed to update note');
      }
    }

    noteMetadata.updatedAt = new Date().toISOString();
    metadata[noteIndex] = noteMetadata;
    this.saveUserMetadata(ownerId, metadata);

    logger.info('Shared note updated', { ownerId, noteId, requesterId });

    return noteMetadata;
  }

  /**
   * Supprime une note
   */
  async deleteNote(userId, noteId) {
    // Validation
    const idValidation = validator.validateUUID(noteId);
    if (!idValidation.valid) {
      throw new Error(idValidation.error);
    }

    const metadata = this.loadUserMetadata(userId);
    const noteIndex = metadata.findIndex(n => n.id === noteId);

    if (noteIndex === -1) {
      throw new Error('Note not found');
    }

    const noteMetadata = metadata[noteIndex];

    // Vérifie le verrouillage
    if (noteMetadata.locked && noteMetadata.lockedBy !== userId) {
      throw new Error('Cannot delete a note locked by another user');
    }

    // Supprime le fichier
    const userDir = path.join(this.notesDir, userId);
    const noteFile = path.join(userDir, `${noteId}.enc`);

    try {
      if (fs.existsSync(noteFile)) {
        fs.unlinkSync(noteFile);
      }
    } catch (error) {
      logger.error('Failed to delete note file', { userId, noteId, error: error.message });
      throw new Error('Failed to delete note file');
    }

    // Supprime des métadonnées
    metadata.splice(noteIndex, 1);
    this.saveUserMetadata(userId, metadata);

    logger.info('Note deleted', { userId, noteId });

    return { success: true, message: 'Note deleted successfully' };
  }

  /**
   * Vérifie si une note existe et appartient à l'utilisateur
   */
  noteExists(userId, noteId) {
    const metadata = this.loadUserMetadata(userId);
    return metadata.some(n => n.id === noteId);
  }

  /**
   * Récupère les métadonnées d'une note
   */
  getNoteMetadata(userId, noteId) {
    const metadata = this.loadUserMetadata(userId);
    return metadata.find(n => n.id === noteId);
  }
}

module.exports = new NoteService();
