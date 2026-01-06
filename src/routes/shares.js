const express = require('express');
const shareService = require('../services/shareService');
const logger = require('../utils/logger');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Toutes les routes nécessitent l'authentification
router.use(authenticate);

/**
 * POST /api/shares
 * Partage une note avec un autre utilisateur
 */
router.post('/', async (req, res) => {
  try {
    const { noteId, targetUsername, permission } = req.body;
    const userId = req.user.id;

    if (!noteId || !targetUsername || !permission) {
      return res.status(400).json({ 
        error: 'noteId, targetUsername and permission are required' 
      });
    }

    const share = await shareService.shareNote(
      userId, 
      noteId, 
      targetUsername, 
      permission
    );

    logger.access(userId, `share:${share.id}`, 'CREATE', true, req.ip);

    res.status(201).json({
      message: 'Note shared successfully',
      share
    });
  } catch (error) {
    logger.error('Share creation error', { 
      userId: req.user.id,
      error: error.message 
    });
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/shares/received
 * Liste les notes partagées avec moi
 */
router.get('/received', async (req, res) => {
  try {
    const userId = req.user.id;
    const shares = shareService.getSharedWithMe(userId);

    logger.access(userId, 'shares:received', 'LIST', true, req.ip);

    res.json({
      shares,
      count: shares.length
    });
  } catch (error) {
    logger.error('Shares list error', { 
      userId: req.user.id,
      error: error.message 
    });
    res.status(500).json({ error: 'Failed to list shared notes' });
  }
});

/**
 * GET /api/shares/sent
 * Liste les notes que j'ai partagées
 */
router.get('/sent', async (req, res) => {
  try {
    const userId = req.user.id;
    const shares = shareService.getSharedByMe(userId);

    logger.access(userId, 'shares:sent', 'LIST', true, req.ip);

    res.json({
      shares,
      count: shares.length
    });
  } catch (error) {
    logger.error('Sent shares list error', { 
      userId: req.user.id,
      error: error.message 
    });
    res.status(500).json({ error: 'Failed to list sent shares' });
  }
});

/**
 * DELETE /api/shares/:id
 * Révoque un partage
 */
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const shareId = req.params.id;

    const result = await shareService.revokeShare(userId, shareId);

    logger.access(userId, `share:${shareId}`, 'DELETE', true, req.ip);

    res.json(result);
  } catch (error) {
    logger.error('Share revocation error', { 
      userId: req.user.id,
      shareId: req.params.id,
      error: error.message 
    });
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/shares/lock/:noteId
 * Verrouille une note partagée pour écriture exclusive
 */
router.post('/lock/:noteId', async (req, res) => {
  try {
    const userId = req.user.id;
    const noteId = req.params.noteId;

    const note = await shareService.lockNote(userId, noteId);

    logger.access(userId, `note:${noteId}`, 'LOCK', true, req.ip);

    res.json({
      message: 'Note locked successfully',
      note
    });
  } catch (error) {
    logger.error('Note lock error', { 
      userId: req.user.id,
      noteId: req.params.noteId,
      error: error.message 
    });
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/shares/unlock/:noteId
 * Déverrouille une note partagée
 */
router.post('/unlock/:noteId', async (req, res) => {
  try {
    const userId = req.user.id;
    const noteId = req.params.noteId;

    const note = await shareService.unlockNote(userId, noteId);

    logger.access(userId, `note:${noteId}`, 'UNLOCK', true, req.ip);

    res.json({
      message: 'Note unlocked successfully',
      note
    });
  } catch (error) {
    logger.error('Note unlock error', { 
      userId: req.user.id,
      noteId: req.params.noteId,
      error: error.message 
    });
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/shares/notes/:noteId
 * Lit une note partagée
 */
router.get('/notes/:noteId', async (req, res) => {
  try {
    const userId = req.user.id;
    const noteId = req.params.noteId;
    const userKey = req.user.username;

    const note = await shareService.readSharedNote(userId, noteId, userKey);

    logger.access(userId, `shared-note:${noteId}`, 'READ', true, req.ip);

    res.json({ note });
  } catch (error) {
    logger.access(req.user.id, `shared-note:${req.params.noteId}`, 'READ', false, req.ip);
    logger.error('Shared note read error', { 
      userId: req.user.id,
      noteId: req.params.noteId,
      error: error.message 
    });
    res.status(404).json({ error: error.message });
  }
});

/**
 * PUT /api/shares/notes/:noteId
 * Met à jour une note partagée
 */
router.put('/notes/:noteId', async (req, res) => {
  try {
    const userId = req.user.id;
    const noteId = req.params.noteId;
    const { title, content } = req.body;
    const userKey = req.user.username;

    const note = await shareService.updateSharedNote(
      userId, 
      noteId, 
      title, 
      content, 
      userKey
    );

    logger.access(userId, `shared-note:${noteId}`, 'UPDATE', true, req.ip);

    res.json({
      message: 'Shared note updated successfully',
      note
    });
  } catch (error) {
    logger.access(req.user.id, `shared-note:${req.params.noteId}`, 'UPDATE', false, req.ip);
    logger.error('Shared note update error', { 
      userId: req.user.id,
      noteId: req.params.noteId,
      error: error.message 
    });
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
