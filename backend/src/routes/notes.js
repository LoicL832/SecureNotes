const express = require('express');
const noteService = require('../services/noteService');
const shareService = require('../services/shareService');
const logger = require('../utils/logger');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Toutes les routes nécessitent l'authentification
router.use(authenticate);

/**
 * POST /api/notes
 * Crée une nouvelle note
 */
router.post('/', async (req, res) => {
  try {
    const { title, content } = req.body;
    const userId = req.user.id;
    const userKey = req.user.username; // Utilise username comme clé de chiffrement

    if (!title || content === undefined) {
      return res.status(400).json({ 
        error: 'Title and content are required' 
      });
    }

    const note = await noteService.createNote(userId, title, content, userKey);

    logger.access(userId, `note:${note.id}`, 'CREATE', true, req.ip);

    res.status(201).json({
      message: 'Note created successfully',
      note
    });
  } catch (error) {
    logger.error('Note creation error', { 
      userId: req.user.id,
      error: error.message 
    });
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/notes
 * Liste toutes les notes de l'utilisateur
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Log de débogage
    console.log('=== GET /api/notes ===');
    console.log('User ID:', userId);
    console.log('Username:', req.user.username);
    
    const notes = noteService.listNotes(userId);

    logger.access(userId, 'notes:list', 'LIST', true, req.ip);

    res.json({
      notes,
      count: notes.length
    });
  } catch (error) {
    logger.error('Notes list error', { 
      userId: req.user.id,
      error: error.message 
    });
    res.status(500).json({ error: 'Failed to list notes' });
  }
});

/**
 * GET /api/notes/:id
 * Récupère une note spécifique (propre ou partagée)
 */
router.get('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const noteId = req.params.id;
    const userKey = req.user.username;

    // Vérifie d'abord si c'est une note propre
    if (noteService.noteExists(userId, noteId)) {
      const note = await noteService.readNote(userId, noteId, userKey);
      logger.access(userId, `note:${noteId}`, 'READ', true, req.ip);
      return res.json({ note });
    }

    // Sinon, vérifie si c'est une note partagée
    const share = shareService.getShareForUser(userId, noteId);
    if (share) {
      // Récupère le propriétaire et sa clé (username)
      const owner = await shareService.getOwner(share.owner);
      const note = await noteService.readSharedNote(share.owner, owner.username, noteId, userId);
      
      // Ajoute les infos de partage
      note.sharedBy = owner.username;
      note.permission = share.permission;
      note.isShared = true;
      
      logger.access(userId, `note:${noteId}`, 'READ_SHARED', true, req.ip);
      return res.json({ note });
    }

    // Note non trouvée
    throw new Error('Note not found');

  } catch (error) {
    logger.access(req.user.id, `note:${req.params.id}`, 'READ', false, req.ip);
    logger.error('Note read error', { 
      userId: req.user.id,
      noteId: req.params.id,
      error: error.message 
    });
    res.status(404).json({ error: error.message });
  }
});

/**
 * PUT /api/notes/:id
 * Met à jour une note (propre ou partagée)
 * Vérifie automatiquement le verrouillage
 */
router.put('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const noteId = req.params.id;
    const { title, content } = req.body;
    const userKey = req.user.username;

    // Vérifie d'abord si c'est une note propre
    if (noteService.noteExists(userId, noteId)) {
      // Vérifie le verrouillage
      const lockInfo = noteService.isNoteLocked(userId, noteId);
      if (lockInfo && lockInfo.lockedBy !== userId) {
        return res.status(423).json({ 
          error: `Note is currently being edited by another user`,
          lockedBy: lockInfo.lockedBy,
          lockedAt: lockInfo.lockedAt
        });
      }

      const note = await noteService.updateNote(
        userId, 
        noteId, 
        title, 
        content, 
        userKey
      );

      logger.access(userId, `note:${noteId}`, 'UPDATE', true, req.ip);

      return res.json({
        message: 'Note updated successfully',
        note
      });
    }

    // Sinon, vérifie si c'est une note partagée avec permission 'write'
    const share = shareService.getShareForUser(userId, noteId);
    if (share && share.permission === 'write') {
      // Vérifie le verrouillage sur la note du propriétaire
      const lockInfo = noteService.isNoteLocked(share.owner, noteId);
      if (lockInfo && lockInfo.lockedBy !== userId) {
        return res.status(423).json({ 
          error: `Note is currently being edited by another user`,
          lockedBy: lockInfo.lockedBy,
          lockedAt: lockInfo.lockedAt
        });
      }

      // Récupère le propriétaire et sa clé
      const owner = await shareService.getOwner(share.owner);
      const note = await noteService.updateSharedNote(
        share.owner,
        owner.username,
        noteId,
        title,
        content,
        userId
      );

      logger.access(userId, `note:${noteId}`, 'UPDATE_SHARED', true, req.ip);

      return res.json({
        message: 'Note updated successfully',
        note
      });
    }

    // Note non trouvée ou permission insuffisante
    throw new Error('Note not found or you do not have write permission');

  } catch (error) {
    logger.access(req.user.id, `note:${req.params.id}`, 'UPDATE', false, req.ip);
    logger.error('Note update error', { 
      userId: req.user.id,
      noteId: req.params.id,
      error: error.message 
    });
    res.status(400).json({ error: error.message });
  }
});

/**
 * DELETE /api/notes/:id
 * Supprime une note
 */
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const noteId = req.params.id;

    const result = await noteService.deleteNote(userId, noteId);

    logger.access(userId, `note:${noteId}`, 'DELETE', true, req.ip);

    res.json(result);
  } catch (error) {
    logger.access(req.user.id, `note:${req.params.id}`, 'DELETE', false, req.ip);
    logger.error('Note deletion error', { 
      userId: req.user.id,
      noteId: req.params.id,
      error: error.message 
    });
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/notes/:id/lock
 * Verrouille une note pour édition (propriétaire ou partagée)
 */
router.post('/:id/lock', async (req, res) => {
  try {
    const userId = req.user.id;
    const noteId = req.params.id;

    // Vérifie d'abord si c'est une note propre
    if (noteService.noteExists(userId, noteId)) {
      const result = await noteService.lockNoteForEditing(userId, noteId, userId);
      logger.access(userId, `note:${noteId}`, 'LOCK', true, req.ip);
      return res.json(result);
    }

    // Sinon, vérifie si c'est une note partagée avec permission 'write'
    const share = shareService.getShareForUser(userId, noteId);
    if (share && share.permission === 'write') {
      const result = await noteService.lockNoteForEditing(share.owner, noteId, userId);
      logger.access(userId, `note:${noteId}`, 'LOCK_SHARED', true, req.ip);
      return res.json(result);
    }

    throw new Error('Note not found or you do not have write permission');

  } catch (error) {
    logger.access(req.user.id, `note:${req.params.id}`, 'LOCK', false, req.ip);
    logger.error('Note lock error', { 
      userId: req.user.id,
      noteId: req.params.id,
      error: error.message 
    });
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/notes/:id/unlock
 * Déverrouille une note après édition
 */
router.post('/:id/unlock', async (req, res) => {
  try {
    const userId = req.user.id;
    const noteId = req.params.id;

    // Vérifie d'abord si c'est une note propre
    if (noteService.noteExists(userId, noteId)) {
      const result = await noteService.unlockNote(userId, noteId, userId);
      logger.access(userId, `note:${noteId}`, 'UNLOCK', true, req.ip);
      return res.json(result);
    }

    // Sinon, vérifie si c'est une note partagée avec permission 'write'
    const share = shareService.getShareForUser(userId, noteId);
    if (share && share.permission === 'write') {
      const result = await noteService.unlockNote(share.owner, noteId, userId);
      logger.access(userId, `note:${noteId}`, 'UNLOCK_SHARED', true, req.ip);
      return res.json(result);
    }

    throw new Error('Note not found or you do not have write permission');

  } catch (error) {
    logger.access(req.user.id, `note:${req.params.id}`, 'UNLOCK', false, req.ip);
    logger.error('Note unlock error', { 
      userId: req.user.id,
      noteId: req.params.id,
      error: error.message 
    });
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
