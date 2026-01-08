const logger = require('../utils/logger');
const validator = require('../utils/validator');

/**
 * Middleware de sécurité pour détecter les attaques courantes
 */

/**
 * Détecte les tentatives d'injection dans les paramètres
 */
function detectInjectionAttempts(req, res, next) {
  const checkData = (data, path = '') => {
    if (typeof data === 'string') {
      if (validator.detectInjection(data)) {
        logger.security('Injection attempt detected', {
          ip: req.ip,
          path: req.path,
          field: path,
          userId: req.user?.id
        });
        return true;
      }
    } else if (typeof data === 'object' && data !== null) {
      for (const key in data) {
        if (checkData(data[key], `${path}.${key}`)) {
          return true;
        }
      }
    }
    return false;
  };

  // Vérifie body, query et params
  if (checkData(req.body, 'body') || 
      checkData(req.query, 'query') || 
      checkData(req.params, 'params')) {
    return res.status(400).json({ 
      error: 'Invalid input detected. Potential security threat.' 
    });
  }

  next();
}

/**
 * Protection contre le path traversal
 */
function preventPathTraversal(req, res, next) {
  const checkPath = (value) => {
    if (typeof value === 'string') {
      // Décode l'URL pour détecter les tentatives encodées
      const decoded = decodeURIComponent(value);

      // Vérifie les patterns de traversal (normal et encodé)
      if (value.includes('..') || value.includes('~') ||
          decoded.includes('..') || decoded.includes('~') ||
          value.match(/%2e%2e/i) || value.match(/%2f/i)) {
        return true;
      }
    }
    return false;
  };

  const allParams = { ...req.body, ...req.query, ...req.params };

  for (const key in allParams) {
    if (checkPath(allParams[key])) {
      logger.security('Path traversal attempt detected', {
        ip: req.ip,
        path: req.path,
        field: key,
        value: allParams[key],
        userId: req.user?.id
      });
      return res.status(400).json({ 
        error: 'Invalid path detected' 
      });
    }
  }

  next();
}

/**
 * Limite la taille des requêtes
 */
function limitRequestSize(maxSize = 1024 * 1024) { // 1MB par défaut
  return (req, res, next) => {
    const contentLength = req.headers['content-length'];

    if (contentLength && parseInt(contentLength) > maxSize) {
      logger.security('Request too large', {
        ip: req.ip,
        path: req.path,
        size: contentLength,
        maxSize,
        userId: req.user?.id
      });
      return res.status(413).json({ 
        error: 'Request entity too large' 
      });
    }

    next();
  };
}

/**
 * Vérifie la présence de headers de sécurité dans la requête
 */
function validateSecurityHeaders(req, res, next) {
  // Vérifie que le Content-Type est approprié pour les requêtes POST/PUT
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.headers['content-type'];
    
    if (!contentType || !contentType.includes('application/json')) {
      logger.warn('Invalid content type', {
        ip: req.ip,
        path: req.path,
        contentType,
        userId: req.user?.id
      });
      return res.status(415).json({ 
        error: 'Unsupported media type. Use application/json' 
      });
    }
  }

  next();
}

/**
 * Sanitize les paramètres d'entrée
 */
function sanitizeInputs(req, res, next) {
  const sanitizeObject = (obj) => {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    const sanitized = Array.isArray(obj) ? [] : {};

    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        sanitized[key] = validator.sanitizeString(obj[key]);
      } else if (typeof obj[key] === 'object') {
        sanitized[key] = sanitizeObject(obj[key]);
      } else {
        sanitized[key] = obj[key];
      }
    }

    return sanitized;
  };

  req.body = sanitizeObject(req.body);
  req.query = sanitizeObject(req.query);

  next();
}

/**
 * Empêche les attaques par timing
 */
function preventTimingAttacks(req, res, next) {
  const start = Date.now();

  // Ajoute un délai aléatoire minimal pour masquer les temps de réponse
  const originalSend = res.send;
  res.send = function(data) {
    const elapsed = Date.now() - start;
    const minDelay = 10; // 10ms minimum
    const randomDelay = Math.random() * 20; // 0-20ms aléatoire
    const delay = Math.max(0, minDelay + randomDelay - elapsed);

    setTimeout(() => {
      originalSend.call(this, data);
    }, delay);
  };

  next();
}

module.exports = {
  detectInjectionAttempts,
  preventPathTraversal,
  limitRequestSize,
  validateSecurityHeaders,
  sanitizeInputs,
  preventTimingAttacks
};
