const crypto = require('crypto');
const config = require('../../config/config');

/**
 * Génère une clé de chiffrement dérivée du mot de passe utilisateur
 * @param {string} password - Mot de passe
 * @param {Buffer} salt - Salt
 * @returns {Buffer} Clé dérivée
 */
function deriveKey(password, salt) {
  return crypto.pbkdf2Sync(
    password,
    salt,
    100000, // Iterations
    config.encryption.keyLength,
    'sha512'
  );
}

/**
 * Chiffre des données avec AES-256-GCM
 * @param {string} plaintext - Texte en clair
 * @param {string} userKey - Clé utilisateur (dérivée du password)
 * @returns {Object} {encrypted, iv, tag, salt}
 */
function encrypt(plaintext, userKey) {
  try {
    // Génère un salt unique pour cette opération
    const salt = crypto.randomBytes(config.encryption.saltLength);
    
    // Dérive la clé de chiffrement
    const key = deriveKey(userKey, salt);
    
    // Génère un IV aléatoire
    const iv = crypto.randomBytes(config.encryption.ivLength);
    
    // Crée le cipher
    const cipher = crypto.createCipheriv(config.encryption.algorithm, key, iv);
    
    // Chiffre les données
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Récupère le tag d'authentification
    const tag = cipher.getAuthTag();
    
    return {
      encrypted: encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex'),
      salt: salt.toString('hex')
    };
  } catch (error) {
    throw new Error('Encryption failed: ' + error.message);
  }
}

/**
 * Déchiffre des données chiffrées avec AES-256-GCM
 * @param {Object} encryptedData - {encrypted, iv, tag, salt}
 * @param {string} userKey - Clé utilisateur
 * @returns {string} Texte déchiffré
 */
function decrypt(encryptedData, userKey) {
  try {
    // Convertit les buffers
    const salt = Buffer.from(encryptedData.salt, 'hex');
    const iv = Buffer.from(encryptedData.iv, 'hex');
    const tag = Buffer.from(encryptedData.tag, 'hex');
    
    // Dérive la clé
    const key = deriveKey(userKey, salt);
    
    // Crée le decipher
    const decipher = crypto.createDecipheriv(config.encryption.algorithm, key, iv);
    decipher.setAuthTag(tag);
    
    // Déchiffre
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    throw new Error('Decryption failed: ' + error.message);
  }
}

/**
 * Génère un hash HMAC pour l'intégrité
 * @param {string} data - Données
 * @param {string} secret - Secret
 * @returns {string} Hash HMAC
 */
function generateHMAC(data, secret) {
  return crypto.createHmac('sha256', secret)
    .update(data)
    .digest('hex');
}

/**
 * Vérifie un hash HMAC
 * @param {string} data - Données
 * @param {string} secret - Secret
 * @param {string} hash - Hash à vérifier
 * @returns {boolean}
 */
function verifyHMAC(data, secret, hash) {
  const expectedHash = generateHMAC(data, secret);
  return crypto.timingSafeEqual(
    Buffer.from(expectedHash),
    Buffer.from(hash)
  );
}

/**
 * Génère un token aléatoire sécurisé
 * @param {number} length - Longueur en bytes
 * @returns {string} Token hexadécimal
 */
function generateToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

module.exports = {
  encrypt,
  decrypt,
  generateHMAC,
  verifyHMAC,
  generateToken,
  deriveKey
};
