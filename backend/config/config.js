module.exports = {
  // Configuration JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'CHANGE_THIS_IN_PRODUCTION_USE_ENV_VAR',
    expiresIn: '1h',
    refreshExpiresIn: '7d'
  },

  // Configuration bcrypt
  bcrypt: {
    saltRounds: 12
  },

  // Configuration serveur
  server: {
    port: process.env.PORT || 3001,
    name: process.env.SERVER_NAME || 'server1',
    peerUrl: process.env.PEER_URL || null
  },

  // Configuration CORS
  cors: {
    origin: function (origin, callback) {
      // Liste des origines autorisées
      const allowedOrigins = [
        'http://localhost:8080',
        'http://127.0.0.1:8080',
        'http://localhost:3001',
        'http://127.0.0.1:3001'
      ];

      // Permet les requêtes sans origine (comme curl, Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  },

  // Rate limiting
  rateLimit: {
    windowMs: process.env.NODE_ENV === 'test' ? 10 * 1000 : 15 * 60 * 1000, // 10 seconds in test, 15 minutes in production
    max: process.env.NODE_ENV === 'test' ? 200 : 100, // Balanced for tests
    standardHeaders: true,
    legacyHeaders: false
  },

  // Rate limiting authentification (plus strict)
  authRateLimit: {
    windowMs: process.env.NODE_ENV === 'test' ? 10 * 1000 : 15 * 60 * 1000, // 10 seconds in test, 15 minutes in production
    max: process.env.NODE_ENV === 'test' ? 100 : 5, // Balanced for tests
    skipSuccessfulRequests: true
  },

  // Configuration chiffrement
  encryption: {
    algorithm: 'aes-256-gcm',
    keyLength: 32,
    ivLength: 16,
    saltLength: 64,
    tagLength: 16
  },

  // Chemins de stockage
  storage: {
    dataDir: './data',
    usersFile: './data/users/users.json',
    notesDir: './data/notes',
    sharesFile: './data/shares/shares.json',
    logsDir: './data/logs'
  },

  // Configuration réplication
  replication: {
    syncInterval: 30000, // 30 secondes
    retryAttempts: 3,
    retryDelay: 5000 // 5 secondes
  },

  // Sécurité
  security: {
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes
    passwordMinLength: 8,
    sessionTimeout: 3600000 // 1 heure
  }
};
