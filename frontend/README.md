# SecureNotes - Frontend 🎨

Interface web pour le système de gestion de notes sécurisé SecureNotes.

## 📁 Structure

```
frontend/
├── index.html          # Page principale
├── css/
│   └── style.css       # Feuilles de style
└── js/
    ├── api.js          # Client API REST
    ├── auth.js         # Gestion de l'authentification
    ├── notes.js        # Gestion des notes
    └── app.js          # Application principale
```

## 🚀 Lancement

### Option 1 : Avec http-server (recommandé)

```bash
cd frontend
npm install
npm start
```

L'interface sera accessible sur `http://localhost:8080`

### Option 2 : Avec le backend

Le backend Express sert automatiquement les fichiers statiques du frontend.

```bash
cd backend
npm start
```

L'interface sera accessible sur `http://localhost:3001`

## 🔌 Configuration

### API Backend

Par défaut, le frontend communique avec le backend sur `http://localhost:3001`.

Pour changer l'URL de l'API, modifiez la constante `API_BASE_URL` dans `js/api.js` :

```javascript
const API_BASE_URL = 'http://localhost:3001/api';
```

## 🎨 Technologies

- **HTML5** : Structure sémantique
- **CSS3** : Styles modernes avec variables CSS
- **JavaScript (Vanilla)** : Pas de framework, code pur
- **Fetch API** : Communication avec le backend
- **localStorage** : Stockage des tokens JWT

## 🔒 Sécurité

- Validation côté client avant envoi au serveur
- Sanitization des entrées utilisateur
- Tokens JWT stockés en localStorage
- Protection XSS via échappement HTML
- HTTPS recommandé en production

## 📱 Responsive Design

L'interface est optimisée pour :
- Desktop (1920x1080+)
- Laptop (1366x768+)
- Tablet (768x1024)
- Mobile (320x568+)

## 🎯 Fonctionnalités UI

- ✅ Authentification (inscription/connexion)
- ✅ Liste des notes avec recherche
- ✅ Création/édition/suppression de notes
- ✅ Partage de notes avec permissions
- ✅ Verrouillage de notes partagées
- ✅ Notifications utilisateur
- ✅ Mode sombre (optionnel)

## 🛠️ Développement

Pour développer le frontend indépendamment :

1. Démarrer le backend sur le port 3001
2. Démarrer le serveur de développement frontend
3. Les changements sont visibles immédiatement (pas de build requis)

## 📝 Notes

- Les fichiers JavaScript sont chargés en tant que modules ES6
- Aucun build step requis (pas de webpack/babel)
- Compatible avec tous les navigateurs modernes (Chrome 90+, Firefox 88+, Safari 14+)

