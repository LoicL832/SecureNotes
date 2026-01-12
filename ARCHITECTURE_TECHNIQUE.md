# ARCHITECTURE TECHNIQUE - SecureNotes

## Système de Notes Sécurisé avec Réplication Active-Active

**Groupe 6 : Stockage Fichiers**  
**Architecture : API REST + Système de Fichiers**

---

## VUE D'ENSEMBLE

### Architecture Globale

```
┌─────────────────────────────────────────────────┐
│                    FRONTEND (HTTP)              │
│                   Port 8080                      │
│    - Interface utilisateur                       │
│    - Gestion des notes                           │
│    - Authentification                            │
└─────────────────────────────────────────────────┘
                 │
                 │ HTTPS
                 │
    ┌────────────┴────────────┐
    │                         │
┌───▼────────────┐    ┌──────▼──────────┐
│   SERVER 1     │◄──►│   SERVER 2      │
│   Port 3001    │    │   Port 3002     │
│   (HTTPS)      │    │   (HTTPS)       │
└───┬────────────┘    └──────┬──────────┘
    │    Sync HTTPS          │
    │                        │
    └────────┬───────────────┘
             │
    ┌────────▼────────┐
    │   FILESYSTEM    │
    │   data/notes/   │
    │   data/users/   │
    │   data/shares/  │
    └─────────────────┘
```

---

## RÉPLICATION ACTIVE-ACTIVE

### Caractéristiques

**2 Serveurs Backend Actifs Simultanément :**
- Server 1 (port 3001) - Principal
- Server 2 (port 3002) - Réplica

**Avantages :**
- Haute disponibilité (failover automatique)
- Synchronisation bidirectionnelle temps réel
- Pas de point unique de défaillance
- Load balancing possible

### Communication Inter-Serveurs

```
// Configuration
Server 1 : https://localhost:3001
  ↓ peer: https://localhost:3002
Server 2 : https://localhost:3002
  ↓ peer: https://localhost:3001
```

**Protocole :**
- Communication : HTTPS (TLS)
- Authentification : Header `X-Internal-Secret`
- Détection boucles : Header `x-replication-source`

### Flux de Réplication

```
1. Client crée/modifie une note
2. Server 1 enregistre localement
3. Server 1 réplique vers Server 2 (POST https://localhost:3002/internal)
4. Server 2 reçoit et enregistre
5. Server 2 confirme
6. Synchronisation complète
```

### Code Clé

**Fichier :** `backend/src/services/replicationService.js`

```
// Agent HTTPS pour certificats auto-signés
const httpsAgent = new https.Agent({
  rejectUnauthorized: false  // Tests locaux uniquement
});

// Synchronisation
async syncWithPeer() {
  const localState = this.getLocalState();
  
  const response = await axios.post(
    `${this.peerUrl}/api/internal/sync`,
    {
      serverName: this.serverName,
      timestamp: new Date().toISOString(),
      state: localState
    },
    {
      httpsAgent: httpsAgent,
      headers: {
        'X-Internal-Secret': config.jwt.secret
      }
    }
  );
  
  const peerState = response.data.state;
  this.mergeState(peerState);
}
```

### Tests de Réplication

**Vérifier dans les logs :**
```
[server1] Note created: {noteId}
[server1] Replicating to peer: https://localhost:3002
[server1] Sync successful

[server2] Received replication from server1
[server2] Note replicated successfully
```

---

## STRUCTURE DU STOCKAGE

### Organisation des Fichiers

```
backend/data/
├── notes/
│   ├── [userId-uuid]/              # Répertoire par utilisateur (700)
│   │   ├── metadata.json           # Métadonnées des notes (600)
│   │   ├── [noteId-uuid].enc       # Note chiffrée (600)
│   │   └── [noteId-uuid].lock      # Verrouillage (600)
├── users/
│   └── users.json                  # Base utilisateurs (600)
├── shares/
│   └── shares.json                 # Partages de notes (600)
└── logs/
    └── audit.log                   # Logs d'audit (600)
```

### Permissions Unix

| Type | Permissions | Signification |
|------|-------------|---------------|
| Répertoires | `700` (rwx------) | Propriétaire uniquement |
| Fichiers | `600` (rw-------) | Propriétaire uniquement |

**Code :**
```
// Création répertoire
fs.mkdirSync(userDir, { mode: 0o700 });

// Création fichier
fs.writeFileSync(noteFile, data, { mode: 0o600 });

// Sécurisation post-création
fs.chmodSync(noteFile, 0o600);
```

### Métadonnées de Note

**Fichier :** `metadata.json`

```
[
  {
    "id": "uuid-note",
    "title": "Titre chiffré",
    "owner": "uuid-user",
    "createdAt": "2026-01-10T10:00:00Z",
    "updatedAt": "2026-01-10T11:00:00Z",
    "locked": false,
    "lockedBy": null,
    "lockedAt": null,
    "tags": ["tag1", "tag2"],
    "sharedWith": []
  }
]
```

---

## SÉCURITÉ

### Chiffrement

**Algorithme :** AES-256-GCM (Galois/Counter Mode)

**Processus :**
```
// Chiffrement
const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
const encrypted = Buffer.concat([
  cipher.update(JSON.stringify(data), 'utf8'),
  cipher.final()
]);
const authTag = cipher.getAuthTag();

// Déchiffrement
const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
decipher.setAuthTag(authTag);
const decrypted = Buffer.concat([
  decipher.update(encrypted),
  decipher.final()
]);
```

### Authentification

**JWT (JSON Web Tokens)**

```
// Génération token
const token = jwt.sign(
  { 
    id: user.id,
    username: user.username,
    role: user.role
  },
  config.jwt.secret,
  { expiresIn: config.jwt.expiresIn }
);

// Vérification token
const decoded = jwt.verify(token, config.jwt.secret);
```

### Protection Path Traversal

**Double validation :**

```
// 1. Middleware
function preventPathTraversal(req, res, next) {
  const params = [...req.params, ...Object.values(req.query)];
  
  for (const value of params) {
    if (value.includes('..') || value.includes('/')) {
      return res.status(400).json({ 
        error: 'Invalid path detected' 
      });
    }
  }
  next();
}

// 2. Service
const uuidValidation = validator.validateUUID(userId);
if (!uuidValidation.valid) {
  throw new Error('Invalid user ID format');
}
```

---

## API REST

### Endpoints Principaux

#### Authentification
```
POST   /api/auth/register    - Créer compte
POST   /api/auth/login       - Connexion
POST   /api/auth/logout      - Déconnexion
GET    /api/auth/verify      - Vérifier token
```

#### Notes
```
GET    /api/notes            - Liste des notes
POST   /api/notes            - Créer note
GET    /api/notes/:id        - Lire note
PUT    /api/notes/:id        - Modifier note
DELETE /api/notes/:id        - Supprimer note
GET    /api/notes/search     - Rechercher notes
```

#### Partage
```
POST   /api/shares           - Partager note
GET    /api/shares/:noteId   - Infos partage
DELETE /api/shares/:noteId   - Annuler partage
```

#### Verrouillage
```
POST   /api/notes/:id/lock   - Verrouiller note
POST   /api/notes/:id/unlock - Déverrouiller note
```

#### Interne (Réplication)
```
POST   /api/internal/sync    - Synchronisation
GET    /api/internal/health  - Santé du serveur
```

### Middlewares

**Ordre d'exécution :**
```javascript
1. helmet()                    // Headers sécurité
2. cors()                      // CORS restrictif
3. rateLimit()                 // Limitation requêtes
4. express.json()              // Parse JSON
5. preventTimingAttacks()      // Timing constant
6. preventPathTraversal()      // Path Traversal
7. authenticate()              // JWT vérifié
8. checkNoteOwnership()        // Propriété vérifiée
9. Route handler               // Logique métier
```

---

## TECHNOLOGIES

### Backend

| Technologie | Version | Usage |
|-------------|---------|-------|
| **Node.js** | 18+ | Runtime JavaScript |
| **Express** | 4.18 | Framework web |
| **bcryptjs** | 2.4 | Hash mots de passe |
| **jsonwebtoken** | 9.0 | Authentification JWT |
| **helmet** | 7.1 | Headers sécurité |
| **cors** | 2.8 | CORS management |
| **axios** | 1.6 | Requêtes HTTP |

### Frontend

| Technologie | Usage |
|-------------|-------|
| **HTML5** | Structure |
| **CSS3** | Styles |
| **JavaScript** | Logique client |
| **Fetch API** | Requêtes AJAX |

### Sécurité

- **HTTPS/TLS** : Chiffrement transport
- **AES-256-GCM** : Chiffrement données
- **JWT** : Authentification
- **HMAC-SHA256** : Intégrité
- **bcrypt** : Hash mots de passe (10 rounds)

---

## CONFIGURATION

### Fichier : `backend/config/config.js`

```javascript
module.exports = {
  // Serveur
  server: {
    port: process.env.PORT || 3001,
    name: process.env.SERVER_NAME || 'server1',
    peerUrl: process.env.PEER_URL || null,
    https: {
      enabled: true,
      keyPath: './certs/private-key.pem',
      certPath: './certs/certificate.pem'
    }
  },
  
  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'change-this-secret',
    expiresIn: '24h'
  },
  
  // Rate Limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000,  // 15 minutes
    max: 100                     // 100 requêtes max
  },
  
  // CORS
  cors: {
    origin: ['http://localhost:8080', 'https://localhost:8080'],
    credentials: true
  },
  
  // Réplication
  replication: {
    syncInterval: 30000  // 30 secondes
  }
};
```

---

## PERFORMANCE

### Optimisations

**Fichiers :**
- Lecture/écriture asynchrone
- Cache des métadonnées
- Index par utilisateur

**Réseau :**
- Compression gzip (Helmet)
- Keep-Alive HTTP
- Réplication asynchrone

**Sécurité :**
- bcrypt rounds optimisés (10)
- JWT légers (payload minimal)
- Rate limiting adaptatif

---

## TESTS

### Tests Automatisés

**Fichier :** `./test-security.sh`

**Catégories :**
1. Sécurité Canal (4 tests)
2. Contrôle Accès (3 tests)
3. Sécurité Stockage (5 tests)
4. Prévention Fuites (4 tests)
5. Intégrité/Concurrence (4 tests)

**Total : 20 tests**

### Tests Manuels

**Postman/Insomnia :**
- Collection d'endpoints
- Tests de charge
- Scénarios utilisateurs

---

## LOGS & AUDIT

### Structure Logs

```javascript
{
  timestamp: "2026-01-10T10:00:00.000Z",
  level: "info|warn|error|security",
  message: "Action description",
  userId: "uuid",
  noteId: "uuid",
  ip: "127.0.0.1",
  // Données sensibles: [REDACTED]
}
```

### Événements Loggés

**Sécurité :**
- Tentatives connexion échouées
- Accès non autorisés
- Violations de propriété
- Path Traversal détectés

**Audit :**
- Création/modification/suppression notes
- Partages de notes
- Verrouillages
- Réplications

---

## CONFORMITÉ

### UMLsec (100%)
- <<**secure links**>> 
- <<**encrypted**>> 
- <<**secrecy**>> 
- <<**integrity**>> 
- <<**critical**>> 
- <<**no down-flow**>>
- <<**data security**>> 

### Groupe 6
- Stockage fichiers 
- Pas de SQL 
- Path Traversal protection 
- Permissions restrictives 
- Réplication Active-Active 

---

**Architecture validée et prête pour évaluation !**
