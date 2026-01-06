# 📂 Structure du Projet SecureNotes

Ce document décrit l'organisation du projet après la restructuration en architecture frontend/backend séparée.

## 🏗️ Architecture Globale

```
SecureNotes/
│
├── backend/              # 🔧 Serveur backend (API REST + Logic)
│   ├── src/
│   ├── config/
│   ├── tests/
│   ├── data/
│   └── package.json
│
├── frontend/             # 🎨 Application web (Interface utilisateur)
│   ├── css/
│   ├── js/
│   ├── index.html
│   └── package.json
│
├── docs/                 # 📚 Documentation
│   ├── Guide-Installation.md
│   ├── Rapport-Securite.md
│   └── UMLSec-Diagrams.md
│
├── package.json          # 📦 Scripts racine (orchestration)
├── README.md             # 📖 Documentation principale
└── PROJECT_STRUCTURE.md  # 📂 Ce fichier
```

## 🔧 Backend (`/backend`)

### Responsabilités
- API REST pour toutes les opérations
- Authentification JWT
- Chiffrement/déchiffrement des notes (AES-256-GCM)
- Gestion des utilisateurs et permissions
- Réplication entre serveurs
- Logs de sécurité
- Validation des entrées

### Structure détaillée

```
backend/
│
├── src/
│   ├── server.js                     # Point d'entrée principal
│   │
│   ├── middleware/
│   │   ├── auth.js                   # Vérification JWT
│   │   └── security.js               # Sécurité (injection, XSS, etc.)
│   │
│   ├── routes/
│   │   ├── auth.js                   # POST /api/auth/register, /login
│   │   ├── notes.js                  # CRUD /api/notes
│   │   ├── shares.js                 # Partage /api/shares
│   │   └── internal.js               # Réplication /api/internal
│   │
│   ├── services/
│   │   ├── userService.js            # Logique métier utilisateurs
│   │   ├── noteService.js            # Logique métier notes
│   │   ├── shareService.js           # Logique métier partages
│   │   └── replicationService.js     # Synchronisation serveurs
│   │
│   └── utils/
│       ├── crypto.js                 # Chiffrement AES-256-GCM
│       ├── logger.js                 # Audit logs
│       └── validator.js              # Validation entrées
│
├── config/
│   └── config.js                     # Configuration globale
│
├── tests/
│   └── security-tests.js             # Suite de 12 tests de sécurité
│
├── data/                             # ⚠️ Gitignored - données sensibles
│   ├── users/
│   │   └── users.json                # Base utilisateurs
│   ├── notes/
│   │   └── [userId]/
│   │       ├── [noteId].enc          # Note chiffrée
│   │       └── metadata.json         # Métadonnées
│   ├── shares/
│   │   └── shares.json               # Partages actifs
│   └── logs/
│       └── audit.log                 # Logs d'audit
│
├── init.js                           # Script d'initialisation
└── package.json                      # Dépendances backend
```

### Technologies
- **Express.js** - Framework web
- **bcryptjs** - Hachage passwords (12 rounds)
- **jsonwebtoken** - JWT auth
- **helmet** - Headers sécurisés
- **express-rate-limit** - Protection brute force
- **cors** - CORS configuré
- **uuid** - Génération IDs uniques

### Ports
- **Serveur 1** : `3001`
- **Serveur 2** : `3002`
- **Personnalisé** : `--port=XXXX`

## 🎨 Frontend (`/frontend`)

### Responsabilités
- Interface utilisateur web
- Formulaires d'authentification
- Gestion des notes (CRUD)
- Interface de partage
- Communication avec l'API backend
- Stockage token JWT (localStorage)

### Structure détaillée

```
frontend/
│
├── index.html                        # Page principale (SPA)
│
├── css/
│   └── style.css                     # Styles (variables CSS, responsive)
│
├── js/
│   ├── api.js                        # Client REST API (fetch)
│   ├── auth.js                       # Gestion authentification
│   ├── notes.js                      # Gestion notes
│   └── app.js                        # Application principale
│
├── package.json                      # Scripts + http-server
└── README.md                         # Documentation frontend
```

### Technologies
- **HTML5** - Structure sémantique
- **CSS3** - Variables CSS, Flexbox, Grid
- **Vanilla JavaScript** - Pas de framework
- **Fetch API** - Communication HTTP
- **localStorage** - Stockage tokens

### Modes de lancement

**Option 1 : Via le backend (recommandé)**
```bash
cd backend
npm start
# Frontend accessible sur http://localhost:3001
```

**Option 2 : Serveur indépendant**
```bash
cd frontend
npm start
# Frontend accessible sur http://localhost:8080
# Communique avec backend sur 3001
```

## 📦 Scripts NPM Racine

Le fichier `package.json` racine orchestre les deux parties :

```json
{
  "scripts": {
    "postinstall": "cd backend && npm install && cd ../frontend && npm install",
    "start": "cd backend && npm start",
    "server1": "cd backend && npm run server1",
    "server2": "cd backend && npm run server2",
    "test": "cd backend && npm test",
    "dev:backend": "cd backend && npm run dev",
    "dev:frontend": "cd frontend && npm start"
  }
}
```

### Commandes disponibles

| Commande | Description |
|----------|-------------|
| `npm install` | Installe toutes les dépendances (backend + frontend) |
| `npm start` | Démarre le backend (avec frontend intégré) |
| `npm run server1` | Démarre serveur 1 (port 3001) |
| `npm run server2` | Démarre serveur 2 (port 3002) |
| `npm test` | Lance les tests de sécurité |
| `npm run dev:backend` | Démarre le backend seul |
| `npm run dev:frontend` | Démarre le frontend seul (port 8080) |

## 🔄 Flux de Communication

```
┌─────────────────┐
│   Navigateur    │
│   (Frontend)    │
└────────┬────────┘
         │ HTTP
         │ (Fetch API)
         ├──────────────────────────────┐
         │                              │
         ▼                              ▼
┌────────────────┐            ┌────────────────┐
│  Serveur 1     │◄──Sync────►│  Serveur 2     │
│  (Backend)     │            │  (Backend)     │
│  Port 3001     │            │  Port 3002     │
└────────┬───────┘            └────────┬───────┘
         │                              │
         └──────────┬───────────────────┘
                    ▼
         ┌──────────────────┐
         │  Système de      │
         │  Fichiers        │
         │  (data/)         │
         └──────────────────┘
```

### Étapes typiques

1. **Authentification**
   - Frontend envoie `POST /api/auth/login`
   - Backend vérifie credentials (bcrypt)
   - Backend retourne JWT
   - Frontend stocke JWT dans localStorage

2. **Création de note**
   - Frontend envoie `POST /api/notes` + JWT
   - Backend vérifie JWT
   - Backend chiffre la note (AES-256-GCM)
   - Backend sauvegarde sur disque
   - Backend réplique vers pair
   - Backend retourne confirmation

3. **Lecture de note**
   - Frontend envoie `GET /api/notes/:id` + JWT
   - Backend vérifie JWT + permissions
   - Backend déchiffre la note
   - Backend retourne note en clair
   - Frontend affiche

## 🔒 Sécurité

### Données sensibles (`.gitignore`)
- ✅ `backend/data/` - Notes chiffrées, users, logs
- ✅ `node_modules/` - Dépendances
- ✅ `package-lock.json` - Lockfiles
- ✅ `.env` - Variables d'environnement

### Chiffrement
- **Notes au repos** : AES-256-GCM
- **Passwords** : bcrypt (12 rounds)
- **Tokens** : JWT HMAC-SHA256

### Protection
- Rate limiting (100 req / 15 min)
- Brute force protection (5 tentatives)
- Input validation stricte
- Headers sécurisés (Helmet)
- CORS configuré

## 🧪 Tests

Les tests sont dans `backend/tests/security-tests.js` :

```bash
npm test
```

**Tests inclus :**
1. Authentification valide
2. Credentials invalides
3. Création de note
4. Lecture de note chiffrée
5. Modification de note
6. Suppression de note
7. Partage de note
8. Révocation de partage
9. Protection injection SQL/NoSQL
10. Protection XSS
11. Rate limiting
12. Réplication entre serveurs

## 📚 Documentation

| Fichier | Description |
|---------|-------------|
| `README.md` | Documentation principale du projet |
| `PROJECT_STRUCTURE.md` | Ce fichier - architecture détaillée |
| `backend/README.md` | Documentation backend spécifique |
| `frontend/README.md` | Documentation frontend spécifique |
| `docs/Guide-Installation.md` | Guide d'installation pas à pas |
| `docs/Rapport-Securite.md` | Analyse de sécurité |
| `docs/UMLSec-Diagrams.md` | Diagrammes UMLSec |

## 🚀 Workflow de Développement

### Développement Backend
```bash
cd backend
npm install
npm run dev
# Serveur sur http://localhost:3001
```

### Développement Frontend
```bash
# Terminal 1 : Backend
cd backend && npm run dev

# Terminal 2 : Frontend
cd frontend && npm start
# Frontend sur http://localhost:8080
```

### Tests
```bash
cd backend
npm test
```

### Déploiement
```bash
# Installer tout
npm install

# Lancer serveur 1
npm run server1

# Lancer serveur 2 (autre terminal)
npm run server2
```

## 🔧 Configuration

### Backend (`backend/config/config.js`)
```javascript
module.exports = {
  jwtSecret: 'CHANGE_IN_PRODUCTION',  // ⚠️ À changer !
  jwtExpiresIn: '1h',
  bcryptRounds: 12,
  defaultPort: 3001,
  // ...
};
```

### Frontend (`frontend/js/api.js`)
```javascript
const API_BASE_URL = 'http://localhost:3001/api';
```

## 📈 Évolutions Futures

### Possibilités d'amélioration
- [ ] Ajouter une vraie base de données (PostgreSQL, MongoDB)
- [ ] Implémenter WebSockets pour temps réel
- [ ] Ajouter un framework frontend (React, Vue)
- [ ] Conteneuriser avec Docker
- [ ] CI/CD avec GitHub Actions
- [ ] Monitoring avec Prometheus/Grafana
- [ ] Tests unitaires avec Jest
- [ ] Tests E2E avec Cypress

### Maintien de la séparation
La structure actuelle facilite :
- ✅ Développement indépendant frontend/backend
- ✅ Tests isolés
- ✅ Déploiement séparé (microservices)
- ✅ Scalabilité horizontale
- ✅ Réutilisation du backend (API mobile, CLI)

## 🤝 Contribution

Pour contribuer :

1. **Backend** : Modifier dans `backend/src/`
2. **Frontend** : Modifier dans `frontend/`
3. **Tests** : Ajouter dans `backend/tests/`
4. **Docs** : Mettre à jour ce fichier

Toujours tester avant de commit :
```bash
npm test
```

---

**Groupe 6** - SecureNotes v1.0.0  
Janvier 2026

