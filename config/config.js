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
    origin: process.env.CORS_ORIGIN || 'http://localhost:8080',
    credentials: true
  },

  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limite par IP
    standardHeaders: true,
    legacyHeaders: false
  },

  // Rate limiting authentification (plus strict)
  authRateLimit: {
    windowMs: 15 * 60 * 1000,
    max: 5, // 5 tentatives par 15 minutes
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
