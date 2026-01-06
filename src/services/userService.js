const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const config = require('../../config/config');
const logger = require('../utils/logger');
const validator = require('../utils/validator');
const { encrypt, decrypt } = require('../utils/crypto');

/**
 * Service de gestion des utilisateurs avec chiffrement
 */
class UserService {
  constructor() {
    this.usersFile = config.storage.usersFile;
    this.ensureUserStorage();
    this.loginAttempts = new Map(); // userId -> {count, lastAttempt}
  }

  /**
   * Crée les répertoires de stockage
   */
  ensureUserStorage() {
    const dir = path.dirname(this.usersFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    if (!fs.existsSync(this.usersFile)) {
      this.saveUsers([]);
    }
  }

  /**
   * Charge les utilisateurs (déchiffrés)
   */
  loadUsers() {
    try {
      if (!fs.existsSync(this.usersFile)) {
        return [];
      }
      
      const data = fs.readFileSync(this.usersFile, 'utf8');
      if (!data.trim()) {
        return [];
      }
      
      return JSON.parse(data);
    } catch (error) {
      logger.error('Failed to load users', { error: error.message });
      return [];
    }
  }

  /**
   * Sauvegarde les utilisateurs
   */
  saveUsers(users) {
    try {
      fs.writeFileSync(
        this.usersFile,
        JSON.stringify(users, null, 2),
        'utf8'
      );
    } catch (error) {
      logger.error('Failed to save users', { error: error.message });
      throw new Error('Failed to save user data');
    }
  }

  /**
   * Enregistre un nouvel utilisateur
   */
  async register(username, email, password) {
    // Validation
    const usernameValidation = validator.validateUsername(username);
    if (!usernameValidation.valid) {
      throw new Error(usernameValidation.error);
    }

    const emailValidation = validator.validateEmail(email);
    if (!emailValidation.valid) {
      throw new Error(emailValidation.error);
    }

    const passwordValidation = validator.validatePassword(password);
    if (!passwordValidation.valid) {
      throw new Error(passwordValidation.error);
    }

    // Vérifie si l'utilisateur existe déjà
    const users = this.loadUsers();
    const existingUser = users.find(
      u => u.username === username || u.email === email
    );

    if (existingUser) {
      logger.security('Registration attempt with existing credentials', {
        username,
        email
      });
      throw new Error('Username or email already exists');
    }

    // Hash le mot de passe
    const salt = await bcrypt.genSalt(config.bcrypt.saltRounds);
    const passwordHash = await bcrypt.hash(password, salt);

    // Crée l'utilisateur
    const user = {
      id: uuidv4(),
      username: validator.sanitizeString(username),
      email: validator.sanitizeString(email),
      passwordHash,
      createdAt: new Date().toISOString(),
      role: 'user',
      locked: false,
      loginAttempts: 0
    };

    users.push(user);
    this.saveUsers(users);

    logger.info('User registered', { 
      userId: user.id, 
      username: user.username 
    });

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    };
  }

  /**
   * Authentifie un utilisateur
   */
  async login(username, password, ip) {
    const users = this.loadUsers();
    const user = users.find(u => u.username === username);

    if (!user) {
      logger.auth(false, username, ip, { reason: 'User not found' });
      throw new Error('Invalid credentials');
    }

    // Vérifie si le compte est verrouillé
    if (user.locked) {
      const lockoutEnd = new Date(user.lockedUntil);
      if (lockoutEnd > new Date()) {
        logger.security('Login attempt on locked account', {
          userId: user.id,
          ip
        });
        throw new Error('Account is locked. Try again later.');
      } else {
        // Déverrouille le compte
        user.locked = false;
        user.loginAttempts = 0;
        delete user.lockedUntil;
      }
    }

    // Vérifie le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      // Incrémente les tentatives échouées
      user.loginAttempts = (user.loginAttempts || 0) + 1;

      if (user.loginAttempts >= config.security.maxLoginAttempts) {
        user.locked = true;
        user.lockedUntil = new Date(
          Date.now() + config.security.lockoutDuration
        ).toISOString();
        
        logger.security('Account locked due to failed login attempts', {
          userId: user.id,
          ip,
          attempts: user.loginAttempts
        });
      }

      this.saveUsers(users);
      logger.auth(false, user.id, ip, { 
        reason: 'Invalid password',
        attempts: user.loginAttempts
      });
      
      throw new Error('Invalid credentials');
    }

    // Réinitialise les tentatives
    user.loginAttempts = 0;
    user.lastLogin = new Date().toISOString();
    this.saveUsers(users);

    // Génère les tokens
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    logger.auth(true, user.id, ip);

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      accessToken,
      refreshToken
    };
  }

  /**
   * Génère un access token JWT
   */
  generateAccessToken(user) {
    return jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
  }

  /**
   * Génère un refresh token JWT
   */
  generateRefreshToken(user) {
    return jwt.sign(
      {
        id: user.id,
        type: 'refresh'
      },
      config.jwt.secret,
      { expiresIn: config.jwt.refreshExpiresIn }
    );
  }

  /**
   * Vérifie un token JWT
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, config.jwt.secret);
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Refresh un access token
   */
  refreshAccessToken(refreshToken) {
    const decoded = this.verifyToken(refreshToken);

    if (decoded.type !== 'refresh') {
      throw new Error('Invalid refresh token');
    }

    const users = this.loadUsers();
    const user = users.find(u => u.id === decoded.id);

    if (!user) {
      throw new Error('User not found');
    }

    return this.generateAccessToken(user);
  }

  /**
   * Récupère un utilisateur par ID
   */
  getUserById(userId) {
    const users = this.loadUsers();
    const user = users.find(u => u.id === userId);

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    };
  }

  /**
   * Vérifie si un utilisateur existe
   */
  userExists(userId) {
    const users = this.loadUsers();
    return users.some(u => u.id === userId);
  }
}

module.exports = new UserService();
