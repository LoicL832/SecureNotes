const config = require('../../config/config');

/**
 * Validation et sanitization des entrées utilisateur
 */

/**
 * Valide un email
 */
function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email is required' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email format' };
  }
  
  if (email.length > 255) {
    return { valid: false, error: 'Email too long' };
  }
  
  return { valid: true };
}

/**
 * Valide un mot de passe
 */
function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Password is required' };
  }
  
  if (password.length < config.security.passwordMinLength) {
    return { 
      valid: false, 
      error: `Password must be at least ${config.security.passwordMinLength} characters` 
    };
  }
  
  if (password.length > 128) {
    return { valid: false, error: 'Password too long' };
  }
  
  // Vérifie la complexité
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  if (!(hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar)) {
    return { 
      valid: false, 
      error: 'Password must contain uppercase, lowercase, number and special character' 
    };
  }
  
  return { valid: true };
}

/**
 * Valide un username
 */
function validateUsername(username) {
  if (!username || typeof username !== 'string') {
    return { valid: false, error: 'Username is required' };
  }
  
  if (username.length < 3 || username.length > 50) {
    return { valid: false, error: 'Username must be between 3 and 50 characters' };
  }
  
  // Seulement alphanumerique et underscore
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  if (!usernameRegex.test(username)) {
    return { valid: false, error: 'Username can only contain letters, numbers and underscore' };
  }
  
  return { valid: true };
}

/**
 * Valide le contenu d'une note
 */
function validateNoteContent(content) {
  if (content === undefined || content === null) {
    return { valid: false, error: 'Note content is required' };
  }
  
  if (typeof content !== 'string') {
    return { valid: false, error: 'Note content must be a string' };
  }
  
  if (content.length > 1000000) { // 1MB max
    return { valid: false, error: 'Note content too large (max 1MB)' };
  }
  
  return { valid: true };
}

/**
 * Valide un titre de note
 */
function validateNoteTitle(title) {
  if (!title || typeof title !== 'string') {
    return { valid: false, error: 'Note title is required' };
  }
  
  if (title.length < 1 || title.length > 200) {
    return { valid: false, error: 'Note title must be between 1 and 200 characters' };
  }
  
  return { valid: true };
}

/**
 * Valide un UUID
 */
function validateUUID(uuid) {
  if (!uuid || typeof uuid !== 'string') {
    return { valid: false, error: 'Invalid UUID' };
  }
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(uuid)) {
    return { valid: false, error: 'Invalid UUID format' };
  }
  
  return { valid: true };
}

/**
 * Sanitize une string (enlève les caractères dangereux)
 */
function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  
  // Enlève les caractères de contrôle
  return str.replace(/[\x00-\x1F\x7F]/g, '');
}

/**
 * Valide un type de permission
 */
function validatePermission(permission) {
  const validPermissions = ['read', 'write'];
  
  if (!validPermissions.includes(permission)) {
    return { 
      valid: false, 
      error: 'Invalid permission type. Must be "read" or "write"' 
    };
  }
  
  return { valid: true };
}

/**
 * Vérifie si une string contient des tentatives d'injection
 */
function detectInjection(input) {
  if (typeof input !== 'string') return false;
  
  // Patterns d'injection courants
  const injectionPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i, // onclick=, onerror=, etc.
    /\.\.\//,      // Path traversal
    /\.\.\\/,
    /__proto__/,
    /constructor/i
  ];
  
  return injectionPatterns.some(pattern => pattern.test(input));
}

module.exports = {
  validateEmail,
  validatePassword,
  validateUsername,
  validateNoteContent,
  validateNoteTitle,
  validateUUID,
  validatePermission,
  sanitizeString,
  detectInjection
};
