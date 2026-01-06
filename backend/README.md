# SecureNotes - Backend 🔧

Serveur backend REST API pour le système de gestion de notes sécurisé SecureNotes.

## 📁 Structure

```
backend/
├── src/
│   ├── server.js                    # Serveur Express principal
│   ├── middleware/
│   │   ├── auth.js                  # Middleware d'authentification JWT
│   │   └── security.js              # Middlewares de sécurité
│   ├── routes/
│   │   ├── auth.js                  # Routes d'authentification
│   │   ├── notes.js                 # Routes CRUD des notes
│   │   ├── shares.js                # Routes de partage
│   │   └── internal.js              # Routes de réplication
│   ├── services/
│   │   ├── userService.js           # Logique métier utilisateurs
│   │   ├── noteService.js           # Logique métier notes
│   │   ├── shareService.js          # Logique métier partages
│   │   └── replicationService.js    # Logique de réplication
│   └── utils/
│       ├── crypto.js                # Chiffrement AES-256-GCM
│       ├── logger.js                # Système de logs
│       └── validator.js             # Validation des entrées
├── config/
│   └── config.js                    # Configuration globale
├── tests/
│   └── security-tests.js            # Tests de sécurité
├── data/                            # Données persistantes (gitignored)
│   ├── users/
│   ├── notes/
│   ├── shares/
│   └── logs/
├── init.js                          # Script d'initialisation
└── package.json
```

## 🚀 Installation

```bash
cd backend
npm install
```

## 🏃 Lancement

### Serveur unique

```bash
npm start
# ou
npm run dev
```

Serveur disponible sur `http://localhost:3001`

### Mode réplication (2 serveurs)

**Terminal 1 :**
```bash
npm run server1
```

**Terminal 2 :**
```bash
npm run server2
```

- Serveur 1 : `http://localhost:3001`
- Serveur 2 : `http://localhost:3002`

### Avec paramètres personnalisés

```bash
node src/server.js --port=3003 --name=server3 --peer=http://localhost:3001
```

## 🧪 Tests

```bash
npm test
```

Exécute la suite complète de tests de sécurité (12 tests).

## ⚙️ Configuration

### Fichier `config/config.js`

```javascript
module.exports = {
  jwtSecret: 'CHANGE_THIS_IN_PRODUCTION',  // ⚠️ À changer absolument !
  jwtExpiresIn: '1h',
  refreshTokenExpiresIn: '7d',
  bcryptRounds: 12,
  defaultPort: 3001,
  maxLoginAttempts: 5,
  lockoutDuration: 15 * 60 * 1000,  // 15 minutes
  rateLimitWindow: 15 * 60 * 1000,
  rateLimitMax: 100,
  syncInterval: 30000,  // 30 secondes
  cors: {
    origin: ['http://localhost:3001', 'http://localhost:3002', 'http://localhost:8080'],
    credentials: true
  }
};
```

## 📡 API REST

### Authentification

- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/refresh` - Rafraîchir le token
- `POST /api/auth/logout` - Déconnexion

### Notes (authentification requise)

- `GET /api/notes` - Liste des notes
- `POST /api/notes` - Créer une note
- `GET /api/notes/:id` - Lire une note
- `PUT /api/notes/:id` - Modifier une note
- `DELETE /api/notes/:id` - Supprimer une note

### Partage (authentification requise)

- `POST /api/shares` - Partager une note
- `GET /api/shares/received` - Notes reçues
- `GET /api/shares/sent` - Notes partagées
- `DELETE /api/shares/:shareId` - Révoquer un partage
- `POST /api/shares/lock/:noteId` - Verrouiller une note
- `POST /api/shares/unlock/:noteId` - Déverrouiller une note
- `GET /api/shares/notes/:noteId` - Lire une note partagée
- `PUT /api/shares/notes/:noteId` - Modifier une note partagée

### Interne (réplication)

- `POST /api/internal/sync` - Synchroniser les données
- `GET /api/internal/health` - État du serveur

## 🔒 Sécurité

### Chiffrement

- **Algorithme** : AES-256-GCM
- **Clé** : 256 bits (PBKDF2, 100 000 itérations)
- **IV** : 16 bytes uniques par note
- **Salt** : 64 bytes uniques
- **Tag** : 16 bytes (authentification)

### Hachage des mots de passe

- **Algorithme** : bcrypt
- **Rounds** : 12 (4096 itérations)
- **Salt** : Unique par utilisateur

### Authentification

- **JWT** : HMAC-SHA256
- **Access Token** : 1 heure
- **Refresh Token** : 7 jours

### Protection

- ✅ Brute force (5 tentatives max)
- ✅ Rate limiting (100 req / 15 min)
- ✅ Helmet.js (headers sécurisés)
- ✅ CORS configuré
- ✅ Validation stricte des entrées
- ✅ Path traversal prevention
- ✅ XSS protection
- ✅ Logs d'audit

## 📊 Logs

Les logs sont stockés dans `data/logs/audit.log`.

Format JSON :
```json
{
  "timestamp": "2026-01-06T10:30:00.000Z",
  "level": "info",
  "userId": "uuid",
  "action": "login",
  "ip": "127.0.0.1",
  "details": {}
}
```

## 🔄 Réplication

### Architecture

- **Type** : Active-Active
- **Synchronisation** : Toutes les 30 secondes
- **Conflits** : Last-Write-Wins (timestamp)
- **Tolérance aux pannes** : Oui

### Données répliquées

- Utilisateurs
- Notes (chiffrées)
- Partages
- Métadonnées

## 🛠️ Développement

### Ajouter une route

1. Créer le fichier dans `src/routes/`
2. Implémenter la logique dans `src/services/`
3. Ajouter le middleware d'authentification si nécessaire
4. Monter la route dans `src/server.js`

### Ajouter un test

Ajouter un test dans `tests/security-tests.js` :

```javascript
async function testNewFeature() {
  console.log('Test : Nouvelle fonctionnalité...');
  try {
    // Code du test
    console.log('✅ Test réussi');
    return true;
  } catch (error) {
    console.error('❌ Test échoué:', error.message);
    return false;
  }
}
```

## 📦 Dépendances

### Production

- **express** : Framework web
- **bcryptjs** : Hachage mots de passe
- **jsonwebtoken** : JWT
- **helmet** : Headers sécurisés
- **express-rate-limit** : Rate limiting
- **cors** : CORS
- **uuid** : Génération d'UUIDs

### Développement

- **axios** : Client HTTP (tests)

## 🚀 Production

### Checklist

- [ ] Changer `jwtSecret` dans `config/config.js`
- [ ] Activer HTTPS (reverse proxy Nginx/Apache)
- [ ] Configurer CORS pour votre domaine
- [ ] Augmenter `bcryptRounds` à 14+
- [ ] Activer les logs persistants
- [ ] Configurer un système de backup
- [ ] Mettre en place un monitoring
- [ ] Configurer les variables d'environnement

### Variables d'environnement

```bash
export JWT_SECRET="votre-secret-super-securise"
export NODE_ENV="production"
export PORT=3001
export PEER_URL="https://server2.example.com"
```

## 📝 Notes

- Les données sont stockées dans le système de fichiers (pas de base de données)
- Les notes sont chiffrées au repos
- Les tokens JWT sont stateless (pas de révocation côté serveur)
- La réplication est éventuelle (eventual consistency)

## 🐛 Debugging

### Activer les logs détaillés

Modifier `src/utils/logger.js` pour ajouter des logs de debug.

### Vérifier les données

```bash
cat data/users/users.json | jq
cat data/shares/shares.json | jq
cat data/logs/audit.log | tail -n 50
```

### Tester la réplication

```bash
# Terminal 1
npm run server1

# Terminal 2
npm run server2

# Observer les logs de synchronisation
```

