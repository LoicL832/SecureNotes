const express = require('express');
const replicationService = require('../services/replicationService');
const config = require('../../config/config');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * Middleware d'authentification inter-serveurs
 */
function authenticateInternal(req, res, next) {
  const secret = req.headers['x-internal-secret'];

  if (!secret || secret !== config.jwt.secret) {
    logger.security('Unauthorized internal request', { 
      ip: req.ip,
      path: req.path
    });
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
}

/**
 * POST /api/internal/sync
 * Endpoint de synchronisation inter-serveurs
 */
router.post('/sync', authenticateInternal, async (req, res) => {
  try {
    const { serverName, state } = req.body;

    if (!serverName || !state) {
      return res.status(400).json({ 
        error: 'serverName and state are required' 
      });
    }

    // Traite la synchronisation
    const localState = await req.app.replicationService.handleSyncRequest(
      serverName, 
      state
    );

    res.json({
      serverName: config.server.name,
      timestamp: new Date().toISOString(),
      state: localState
    });

  } catch (error) {
    logger.error('Sync request handler error', { error: error.message });
    res.status(500).json({ error: 'Sync failed' });
  }
});

/**
 * GET /api/internal/health
 * Endpoint de vérification de santé
 */
router.get('/health', (req, res) => {
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();

  res.json({
    status: 'healthy',
    serverName: config.server.name,
    uptime: Math.floor(uptime),
    timestamp: new Date().toISOString(),
    memory: {
      heapUsed: Math.floor(memoryUsage.heapUsed / 1024 / 1024) + 'MB',
      heapTotal: Math.floor(memoryUsage.heapTotal / 1024 / 1024) + 'MB'
    },
    replication: {
      isRunning: req.app.replicationService?.isRunning || false,
      lastSyncTime: req.app.replicationService?.lastSyncTime || null,
      peerUrl: req.app.replicationService?.peerUrl || null
    }
  });
});

/**
 * GET /api/internal/peer-status
 * Vérifie la santé du serveur pair
 */
router.get('/peer-status', authenticateInternal, async (req, res) => {
  try {
    const peerHealth = await req.app.replicationService.checkPeerHealth();
    res.json(peerHealth);
  } catch (error) {
    logger.error('Peer status check error', { error: error.message });
    res.status(500).json({ error: 'Failed to check peer status' });
  }
});

module.exports = router;
