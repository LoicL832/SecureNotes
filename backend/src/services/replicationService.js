const axios = require('axios');
const fs = require('fs');
const path = require('path');
const config = require('../../config/config');
const logger = require('../utils/logger');

/**
 * Service de réplication active-active entre serveurs
 */
class ReplicationService {
  constructor(serverName, peerUrl) {
    this.serverName = serverName;
    this.peerUrl = peerUrl;
    this.syncInterval = null;
    this.isRunning = false;
    this.lastSyncTime = null;
  }

  /**
   * Démarre la synchronisation périodique
   */
  start() {
    if (this.isRunning || !this.peerUrl) {
      logger.warn('Replication not started', { 
        reason: this.isRunning ? 'Already running' : 'No peer URL configured'
      });
      return;
    }

    this.isRunning = true;
    logger.info('Starting replication service', { 
      serverName: this.serverName,
      peerUrl: this.peerUrl
    });

    // Synchronisation initiale
    this.syncWithPeer();

    // Synchronisation périodique
    this.syncInterval = setInterval(() => {
      this.syncWithPeer();
    }, config.replication.syncInterval);
  }

  /**
   * Arrête la synchronisation
   */
  stop() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    this.isRunning = false;
    logger.info('Replication service stopped', { serverName: this.serverName });
  }

  /**
   * Synchronise avec le serveur pair
   */
  async syncWithPeer() {
    try {
      // Récupère l'état local
      const localState = this.getLocalState();

      // Envoie au serveur pair
      const response = await axios.post(
        `${this.peerUrl}/api/internal/sync`,
        {
          serverName: this.serverName,
          timestamp: new Date().toISOString(),
          state: localState
        },
        {
          timeout: 10000,
          headers: {
            'X-Internal-Secret': config.jwt.secret // Authentification inter-serveurs
          }
        }
      );

      // Reçoit l'état du pair
      const peerState = response.data.state;

      // Merge les données
      this.mergeState(peerState);

      this.lastSyncTime = new Date().toISOString();
      logger.replication('Sync successful', { 
        serverName: this.serverName,
        peerUrl: this.peerUrl
      });

    } catch (error) {
      logger.error('Sync failed', { 
        serverName: this.serverName,
        peerUrl: this.peerUrl,
        error: error.message
      });
    }
  }

  /**
   * Récupère l'état local du serveur
   */
  getLocalState() {
    const state = {
      users: [],
      notes: {},
      shares: []
    };

    try {
      // Charge les utilisateurs
      const usersFile = config.storage.usersFile;
      if (fs.existsSync(usersFile)) {
        state.users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
      }

      // Charge toutes les notes
      const notesDir = config.storage.notesDir;
      if (fs.existsSync(notesDir)) {
        const userDirs = fs.readdirSync(notesDir);
        
        userDirs.forEach(userId => {
          const userDir = path.join(notesDir, userId);
          if (fs.statSync(userDir).isDirectory()) {
            const metadataFile = path.join(userDir, 'metadata.json');
            
            if (fs.existsSync(metadataFile)) {
              try {
                const metadataContent = fs.readFileSync(metadataFile, 'utf8');
                const metadata = JSON.parse(metadataContent || '[]');
                
                // Vérifie que c'est bien un tableau
                if (!Array.isArray(metadata)) {
                  logger.warn('Invalid metadata format, resetting to empty array', { userId });
                  fs.writeFileSync(metadataFile, '[]', 'utf8');
                  state.notes[userId] = { metadata: [], files: {} };
                  return;
                }
                
                state.notes[userId] = {
                  metadata,
                  files: {}
                };

                // Charge les fichiers de notes
                metadata.forEach(note => {
                  const noteFile = path.join(userDir, `${note.id}.enc`);
                  if (fs.existsSync(noteFile)) {
                    state.notes[userId].files[note.id] = fs.readFileSync(noteFile, 'utf8');
                  }
                });
              } catch (error) {
                logger.error('Failed to parse metadata', { userId, error: error.message });
              }
            }
          }
        });
      }

      // Charge les partages
      const sharesFile = config.storage.sharesFile;
      if (fs.existsSync(sharesFile)) {
        state.shares = JSON.parse(fs.readFileSync(sharesFile, 'utf8'));
      }

    } catch (error) {
      logger.error('Failed to get local state', { error: error.message });
    }

    return state;
  }

  /**
   * Merge l'état du pair avec l'état local
   */
  mergeState(peerState) {
    try {
      // Merge users (prend le plus récent)
      this.mergeUsers(peerState.users);

      // Merge notes
      this.mergeNotes(peerState.notes);

      // Merge shares
      this.mergeShares(peerState.shares);

      logger.replication('State merged successfully', { 
        serverName: this.serverName 
      });

    } catch (error) {
      logger.error('Failed to merge state', { error: error.message });
    }
  }

  /**
   * Merge les utilisateurs
   */
  mergeUsers(peerUsers) {
    if (!peerUsers || peerUsers.length === 0) return;

    const localUsers = this.loadLocalUsers();
    const mergedUsers = [...localUsers];

    peerUsers.forEach(peerUser => {
      const localUserIndex = mergedUsers.findIndex(u => u.id === peerUser.id);

      if (localUserIndex === -1) {
        // Nouvel utilisateur du pair
        mergedUsers.push(peerUser);
        logger.replication('User added from peer', { userId: peerUser.id });
      } else {
        // Utilisateur existant - prend le plus récent
        const localUser = mergedUsers[localUserIndex];
        if (new Date(peerUser.createdAt) > new Date(localUser.createdAt)) {
          mergedUsers[localUserIndex] = peerUser;
          logger.replication('User updated from peer', { userId: peerUser.id });
        }
      }
    });

    this.saveLocalUsers(mergedUsers);
  }

  /**
   * Merge les notes
   */
  mergeNotes(peerNotes) {
    if (!peerNotes) return;

    Object.keys(peerNotes).forEach(userId => {
      const peerUserNotes = peerNotes[userId];
      
      // Crée le répertoire utilisateur si nécessaire
      const userDir = path.join(config.storage.notesDir, userId);
      if (!fs.existsSync(userDir)) {
        fs.mkdirSync(userDir, { recursive: true });
      }

      // Charge les métadonnées locales
      const metadataFile = path.join(userDir, 'metadata.json');
      let localMetadata = [];
      if (fs.existsSync(metadataFile)) {
        localMetadata = JSON.parse(fs.readFileSync(metadataFile, 'utf8'));
      }

      // Merge les notes
      peerUserNotes.metadata.forEach(peerNote => {
        const localNoteIndex = localMetadata.findIndex(n => n.id === peerNote.id);

        if (localNoteIndex === -1) {
          // Nouvelle note
          localMetadata.push(peerNote);
          
          // Copie le fichier
          if (peerUserNotes.files[peerNote.id]) {
            const noteFile = path.join(userDir, `${peerNote.id}.enc`);
            fs.writeFileSync(noteFile, peerUserNotes.files[peerNote.id], 'utf8');
          }
          
          logger.replication('Note added from peer', { 
            userId, 
            noteId: peerNote.id 
          });
        } else {
          // Note existante - prend la plus récente
          const localNote = localMetadata[localNoteIndex];
          if (new Date(peerNote.updatedAt) > new Date(localNote.updatedAt)) {
            localMetadata[localNoteIndex] = peerNote;
            
            // Met à jour le fichier
            if (peerUserNotes.files[peerNote.id]) {
              const noteFile = path.join(userDir, `${peerNote.id}.enc`);
              fs.writeFileSync(noteFile, peerUserNotes.files[peerNote.id], 'utf8');
            }
            
            logger.replication('Note updated from peer', { 
              userId, 
              noteId: peerNote.id 
            });
          }
        }
      });

      // Sauvegarde les métadonnées
      fs.writeFileSync(metadataFile, JSON.stringify(localMetadata, null, 2), 'utf8');
    });
  }

  /**
   * Merge les partages
   */
  mergeShares(peerShares) {
    if (!peerShares || peerShares.length === 0) return;

    const localShares = this.loadLocalShares();
    const mergedShares = [...localShares];

    peerShares.forEach(peerShare => {
      const localShareIndex = mergedShares.findIndex(s => s.id === peerShare.id);

      if (localShareIndex === -1) {
        // Nouveau partage
        mergedShares.push(peerShare);
        logger.replication('Share added from peer', { shareId: peerShare.id });
      } else {
        // Partage existant - prend le plus récent
        const localShare = mergedShares[localShareIndex];
        if (new Date(peerShare.updatedAt) > new Date(localShare.updatedAt)) {
          mergedShares[localShareIndex] = peerShare;
          logger.replication('Share updated from peer', { shareId: peerShare.id });
        }
      }
    });

    this.saveLocalShares(mergedShares);
  }

  /**
   * Utilitaires de chargement/sauvegarde
   */
  loadLocalUsers() {
    try {
      if (fs.existsSync(config.storage.usersFile)) {
        return JSON.parse(fs.readFileSync(config.storage.usersFile, 'utf8'));
      }
    } catch (error) {
      logger.error('Failed to load local users', { error: error.message });
    }
    return [];
  }

  saveLocalUsers(users) {
    fs.writeFileSync(
      config.storage.usersFile,
      JSON.stringify(users, null, 2),
      'utf8'
    );
  }

  loadLocalShares() {
    try {
      if (fs.existsSync(config.storage.sharesFile)) {
        return JSON.parse(fs.readFileSync(config.storage.sharesFile, 'utf8'));
      }
    } catch (error) {
      logger.error('Failed to load local shares', { error: error.message });
    }
    return [];
  }

  saveLocalShares(shares) {
    fs.writeFileSync(
      config.storage.sharesFile,
      JSON.stringify(shares, null, 2),
      'utf8'
    );
  }

  /**
   * Endpoint pour recevoir la synchronisation d'un pair
   */
  async handleSyncRequest(peerServerName, peerState) {
    logger.replication('Received sync request', { 
      from: peerServerName 
    });

    // Merge l'état du pair
    this.mergeState(peerState);

    // Retourne notre état local
    return this.getLocalState();
  }

  /**
   * Vérifie la santé du serveur pair
   */
  async checkPeerHealth() {
    if (!this.peerUrl) return { healthy: false, reason: 'No peer configured' };

    try {
      const response = await axios.get(
        `${this.peerUrl}/api/internal/health`,
        { timeout: 5000 }
      );

      return { 
        healthy: response.status === 200,
        peerStatus: response.data
      };
    } catch (error) {
      return { 
        healthy: false, 
        reason: error.message 
      };
    }
  }
}

module.exports = ReplicationService;
