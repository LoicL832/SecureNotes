const fs = require('fs');
const path = require('path');
const config = require('../../config/config');

/**
 * Logger de sécurité pour audit trail
 */
class SecurityLogger {
  constructor() {
    this.logsDir = config.storage.logsDir;
    this.ensureLogDirectory();
  }

  ensureLogDirectory() {
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }
  }

  /**
   * Format un message de log avec timestamp
   * Filtre les données sensibles avant le logging
   */
  formatLogMessage(level, event, details) {
    const timestamp = new Date().toISOString();

    // Liste des champs sensibles à ne JAMAIS logger
    const sensitiveFields = ['content', 'password', 'token', 'key', 'secret', 'encryptedData'];

    // Filtre les données sensibles
    const sanitizedDetails = this.sanitizeLogData(details, sensitiveFields);

    return JSON.stringify({
      timestamp,
      level,
      event,
      ...sanitizedDetails
    }) + '\n';
  }

  /**
   * Sanitize les données de log pour retirer les informations sensibles
   */
  sanitizeLogData(obj, sensitiveFields) {
    if (!obj || typeof obj !== 'object') {
      return obj;
    }

    const sanitized = Array.isArray(obj) ? [] : {};

    for (const key in obj) {
      // Vérifie si c'est un champ sensible
      if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        // Récursion pour les objets imbriqués
        sanitized[key] = this.sanitizeLogData(obj[key], sensitiveFields);
      } else if (typeof obj[key] === 'string' && obj[key].length > 200) {
        // Tronque les longues chaînes (potentiellement du contenu)
        sanitized[key] = obj[key].substring(0, 50) + '... [TRUNCATED]';
      } else {
        sanitized[key] = obj[key];
      }
    }

    return sanitized;
  }

  /**
   * Écrit un log dans le fichier
   */
  writeLog(level, event, details) {
    const logFile = path.join(this.logsDir, 'audit.log');
    const message = this.formatLogMessage(level, event, details);
    
    try {
      fs.appendFileSync(logFile, message, 'utf8');
    } catch (error) {
      console.error('Failed to write log:', error);
    }
  }

  /**
   * Log d'information
   */
  info(event, details = {}) {
    this.writeLog('INFO', event, details);
    console.log(`[INFO] ${event}`, details);
  }

  /**
   * Log d'avertissement
   */
  warn(event, details = {}) {
    this.writeLog('WARN', event, details);
    console.warn(`[WARN] ${event}`, details);
  }

  /**
   * Log d'erreur
   */
  error(event, details = {}) {
    this.writeLog('ERROR', event, details);
    console.error(`[ERROR] ${event}`, details);
  }

  /**
   * Log de sécurité critique
   */
  security(event, details = {}) {
    this.writeLog('SECURITY', event, details);
    console.error(`[SECURITY] ${event}`, details);
  }

  /**
   * Log d'authentification
   */
  auth(success, userId, ip, details = {}) {
    this.writeLog('AUTH', success ? 'LOGIN_SUCCESS' : 'LOGIN_FAILED', {
      userId,
      ip,
      success,
      ...details
    });
  }

  /**
   * Log d'accès aux ressources
   */
  access(userId, resource, action, granted, ip) {
    this.writeLog('ACCESS', action, {
      userId,
      resource,
      action,
      granted,
      ip
    });
  }

  /**
   * Log de réplication
   */
  replication(event, details = {}) {
    this.writeLog('REPLICATION', event, details);
  }
}

module.exports = new SecurityLogger();
