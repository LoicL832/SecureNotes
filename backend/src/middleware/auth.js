const userService = require('../services/userService');
const logger = require('../utils/logger');

/**
 * Middleware d'authentification JWT
 */
function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.security('Missing or invalid authorization header', { 
        ip: req.ip,
        path: req.path
      });
      return res.status(401).json({ 
        error: 'Authentication required. Please provide a valid token.' 
      });
    }

    const token = authHeader.substring(7); // Enlève "Bearer "

    try {
      const decoded = userService.verifyToken(token);
      
      // Ajoute les infos utilisateur à la requête
      req.user = {
        id: decoded.id,
        username: decoded.username,
        role: decoded.role
      };

      next();
    } catch (error) {
      logger.security('Invalid token', { 
        ip: req.ip,
        path: req.path,
        error: error.message
      });
      return res.status(401).json({ 
        error: 'Invalid or expired token. Please login again.' 
      });
    }
  } catch (error) {
    logger.error('Authentication middleware error', { 
      error: error.message,
      ip: req.ip
    });
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Middleware d'autorisation par rôle
 */
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      logger.security('Authorization failed', {
        userId: req.user.id,
        role: req.user.role,
        requiredRoles: roles,
        path: req.path,
        ip: req.ip
      });
      return res.status(403).json({ 
        error: 'You do not have permission to access this resource' 
      });
    }

    next();
  };
}

/**
 * Middleware de vérification de propriété
 * Vérifie que l'utilisateur accède à ses propres ressources
 */
function checkOwnership(req, res, next) {
  const userId = req.params.userId || req.body.userId;

  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Admin peut accéder à tout
  if (req.user.role === 'admin') {
    return next();
  }

  // Vérifie que l'utilisateur accède à ses propres données
  if (userId && userId !== req.user.id) {
    logger.security('Ownership check failed', {
      userId: req.user.id,
      attemptedAccess: userId,
      path: req.path,
      ip: req.ip
    });
    return res.status(403).json({
      error: 'You can only access your own resources' 
    });
  }

  next();
}

/**
 * Middleware de vérification stricte de propriété de note
 * Utilisé pour les opérations sensibles (lecture, modification, suppression)
 */
function checkNoteOwnership(noteService) {
  return async (req, res, next) => {
    try {
      const noteId = req.params.id;
      const userId = req.user.id;

      if (!noteId) {
        return res.status(400).json({ error: 'Note ID is required' });
      }

      // Vérifie que la note existe et appartient à l'utilisateur
      const noteMetadata = noteService.getNoteMetadata(userId, noteId);

      if (!noteMetadata) {
        logger.security('Unauthorized note access attempt', {
          userId,
          noteId,
          path: req.path,
          ip: req.ip
        });
        return res.status(403).json({
          error: 'Forbidden: Note not found or you do not own this note'
        });
      }

      // Vérifie explicitement que l'owner correspond
      if (noteMetadata.owner !== userId) {
        logger.security('Note ownership violation detected', {
          userId,
          noteId,
          actualOwner: noteMetadata.owner,
          path: req.path,
          ip: req.ip
        });
        return res.status(403).json({
          error: 'Forbidden: You do not have permission to access this note'
        });
      }

      // Attache les métadonnées à la requête pour éviter une double lecture
      req.noteMetadata = noteMetadata;
      next();
    } catch (error) {
      logger.error('Ownership check error', {
        error: error.message,
        userId: req.user?.id,
        noteId: req.params.id
      });
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
}

module.exports = {
  authenticate,
  authorize,
  checkOwnership,
  checkNoteOwnership
};
