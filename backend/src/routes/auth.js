const express = require('express');
const rateLimit = require('express-rate-limit');
const config = require('../../config/config');
const userService = require('../services/userService');
const logger = require('../utils/logger');

const router = express.Router();

// Rate limiting désactivé pour tests
// const authLimiter = rateLimit(config.authRateLimit);

/**
 * POST /api/auth/register
 * Inscription d'un nouvel utilisateur
 */
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ 
        error: 'Username, email and password are required' 
      });
    }

    const user = await userService.register(username, email, password);

    res.status(201).json({
      message: 'User registered successfully',
      user
    });
  } catch (error) {
    logger.error('Registration error', { 
      error: error.message,
      ip: req.ip
    });
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/auth/login
 * Connexion d'un utilisateur
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        error: 'Username and password are required' 
      });
    }

    const result = await userService.login(username, password, req.ip);

    res.json({
      message: 'Login successful',
      ...result
    });
  } catch (error) {
    logger.error('Login error', { 
      error: error.message,
      ip: req.ip
    });
    res.status(401).json({ error: error.message });
  }
});

/**
 * POST /api/auth/refresh
 * Rafraîchit un access token
 */
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ 
        error: 'Refresh token is required' 
      });
    }

    const accessToken = userService.refreshAccessToken(refreshToken);

    res.json({
      message: 'Token refreshed successfully',
      accessToken
    });
  } catch (error) {
    logger.error('Token refresh error', { 
      error: error.message,
      ip: req.ip
    });
    res.status(401).json({ error: error.message });
  }
});

/**
 * POST /api/auth/logout
 * Déconnexion (côté client, invalide le token)
 */
router.post('/logout', (req, res) => {
  // Dans une vraie application, on pourrait ajouter le token à une blacklist
  logger.info('User logout', { ip: req.ip });
  
  res.json({
    message: 'Logout successful'
  });
});

/**
 * GET /api/auth/verify
 * Vérifie un token (pour le frontend)
 */
router.get('/verify', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ valid: false });
    }

    const token = authHeader.substring(7);
    const decoded = userService.verifyToken(token);

    res.json({
      valid: true,
      user: {
        id: decoded.id,
        username: decoded.username,
        role: decoded.role
      }
    });
  } catch (error) {
    res.status(401).json({ valid: false });
  }
});

module.exports = router;
