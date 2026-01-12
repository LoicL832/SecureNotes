const express = require('express');
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const config = require('../config/config');
const logger = require('./utils/logger');
const ReplicationService = require('./services/replicationService');

// Middlewares de sécurité
const { 
  detectInjectionAttempts,
  preventPathTraversal,
  limitRequestSize,
  validateSecurityHeaders,
  sanitizeInputs,
  preventTimingAttacks
} = require('./middleware/security');

// Routes
const authRoutes = require('./routes/auth');
const notesRoutes = require('./routes/notes');
const sharesRoutes = require('./routes/shares');
const internalRoutes = require('./routes/internal');

// Parse les arguments de ligne de commande
const args = process.argv.slice(2);
const portArg = args.find(arg => arg.startsWith('--port='));
const nameArg = args.find(arg => arg.startsWith('--name='));
const peerArg = args.find(arg => arg.startsWith('--peer='));

const PORT = portArg ? parseInt(portArg.split('=')[1]) : config.server.port;
const SERVER_NAME = nameArg ? nameArg.split('=')[1] : config.server.name;
const PEER_URL = peerArg ? peerArg.split('=')[1] : config.server.peerUrl;

// Crée l'application Express
const app = express();

// ============= CONFIGURATION SÉCURITÉ =============

// Helmet - Headers de sécurité HTTP
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // Permet inline scripts pour tests locaux
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "http://localhost:3001", "https://localhost:3001"], // Permet connexions au backend
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));

// CORS
app.use(cors(config.cors));

// Rate limiting global
const limiter = rateLimit(config.rateLimit);
app.use('/api/', limiter);

// Rate limiting spécifique pour l'authentification (plus strict)
const authLimiter = rateLimit(config.authRateLimit);

// Parse JSON avec limite de taille
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Middlewares de sécurité personnalisés
app.use(preventTimingAttacks);
app.use(sanitizeInputs);
app.use(detectInjectionAttempts);
app.use(preventPathTraversal);
app.use(limitRequestSize(1024 * 1024)); // 1MB max
app.use(validateSecurityHeaders);

// Logging des requêtes
app.use((req, res, next) => {
  logger.info('Request received', {
    method: req.method,
    path: req.path,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

// ============= ROUTES =============

// Route de santé publique
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    serverName: SERVER_NAME,
    timestamp: new Date().toISOString()
  });
});

// Routes API
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/shares', sharesRoutes);
app.use('/api/internal', internalRoutes);

// Serve le frontend statique
const frontendPath = path.join(__dirname, '../../frontend');
app.use(express.static(frontendPath));

// Route catch-all pour le frontend
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next();
  }
  res.sendFile('index.html', { root: frontendPath });
});

// ============= GESTION D'ERREURS =============

// 404 - Route non trouvée
app.use((req, res) => {
  logger.warn('Route not found', { 
    method: req.method,
    path: req.path,
    ip: req.ip
  });
  res.status(404).json({ 
    error: 'Route not found' 
  });
});

// Gestionnaire d'erreurs global
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  // Log complet de l'erreur (seulement côté serveur)
  logger.error('Unhandled error', {
    error: err.message,
    // Stack trace uniquement en développement dans les logs
    ...(process.env.NODE_ENV !== 'production' ? { stack: err.stack } : {}),
    path: req.path,
    method: req.method,
    ip: req.ip,
    userId: req.user?.id
  });

  // Détermine le code de statut
  const statusCode = err.status || err.statusCode || 500;

  // Réponse sécurisée au client (sans détails système)
  const errorResponse = {
    error: statusCode === 500
      ? 'Internal server error'
      : err.message || 'An error occurred',
    statusCode
  };

  // En développement uniquement, on peut ajouter plus de détails (mais jamais de stack trace)
  if (process.env.NODE_ENV === 'development' && statusCode !== 500) {
    errorResponse.details = err.message;
  }

  res.status(statusCode).json(errorResponse);
});

// ============= DÉMARRAGE =============

// Initialise le service de réplication
const replicationService = new ReplicationService(SERVER_NAME, PEER_URL);
app.replicationService = replicationService;

// Crée le serveur HTTPS ou HTTP selon la configuration
let server;
if (config.server.https.enabled) {
  try {
    const keyPath = path.resolve(__dirname, '..', config.server.https.keyPath);
    const certPath = path.resolve(__dirname, '..', config.server.https.certPath);

    // Vérifie que les certificats existent
    if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
      logger.warn('SSL certificates not found. Run: cd backend/certs && ./generate-cert.sh');
      logger.warn('Starting HTTP server instead...');
      server = http.createServer(app);
    } else {
      const httpsOptions = {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath)
      };
      server = https.createServer(httpsOptions, app);
      logger.info('HTTPS enabled', { keyPath, certPath });
    }
  } catch (error) {
    logger.error('Failed to load SSL certificates', { error: error.message });
    logger.warn('Starting HTTP server instead...');
    server = http.createServer(app);
  }
} else {
  server = http.createServer(app);
  logger.warn('HTTPS disabled - Running in HTTP mode (tests locaux uniquement)');
}

// Démarre le serveur
server.listen(PORT, () => {
  const protocol = server instanceof https.Server ? 'https' : 'http';
  logger.info('Server started', {
    serverName: SERVER_NAME,
    port: PORT,
    protocol,
    peerUrl: PEER_URL || 'Not configured',
    environment: process.env.NODE_ENV || 'development'
  });

  console.log(`
╔════════════════════════════════════════════╗
║       SecureNotes Server Started          ║
║          (Tests Locaux - UMLsec)          ║
╚════════════════════════════════════════════╝

Server Name: ${SERVER_NAME}
Port: ${PORT}
Protocol: ${protocol.toUpperCase()}
Peer: ${PEER_URL || 'Not configured'}

API Base URL: ${protocol}://localhost:${PORT}/api
Frontend URL: ${protocol}://localhost:${PORT}

Health Check: ${protocol}://localhost:${PORT}/health

Security Features (Conformité UMLsec) :
✓ JWT Authentication
✓ AES-256-GCM Encryption
${protocol === 'https' ? '✓ HTTPS/TLS Encryption (certificats auto-signés)' : '⚠ HTTPS DISABLED'}
✓ Rate Limiting
✓ Input Validation
✓ Injection Protection
✓ Path Traversal Protection
✓ File Permissions (600/700)
✓ Physical Locking (.lock files)
✓ Sanitized Logs ([REDACTED])
✓ Audit Logging
${PEER_URL ? '✓ Active-Active Replication' : '⚠ Replication disabled (no peer)'}

${protocol === 'https' ? '⚠️  Certificat auto-signé : Acceptez l\'avertissement du navigateur' : ''}

Press Ctrl+C to stop the server.
  `);

  // Démarre la réplication si un pair est configuré
  if (PEER_URL) {
    setTimeout(() => {
      replicationService.start();
    }, 5000); // Attend 5 secondes pour que les deux serveurs démarrent
  }
});

// Gestion de l'arrêt gracieux
process.on('SIGINT', () => {
  logger.info('Server shutting down...');
  replicationService.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Server shutting down...');
  replicationService.stop();
  process.exit(0);
});

module.exports = app;
