# 🚀 Guide de Démarrage Rapide - SecureNotes

Ce guide vous permet de démarrer **en 2 minutes** avec SecureNotes après la restructuration.

## ⚡ Installation Express (3 commandes)

```bash
# 1. Cloner (si pas déjà fait)
git clone <votre-repo-url>
cd SecureNotes

# 2. Installer tout (backend + frontend)
npm install

# 3. Lancer le serveur
npm start
```

**C'est tout ! 🎉**

Ouvrez votre navigateur sur : **http://localhost:3001**

## 📖 Commandes Essentielles

### Lancer un Serveur

```bash
# Serveur principal (port 3001)
npm start

# Mode développement backend
npm run dev:backend

# Mode développement frontend séparé (port 8080)
npm run dev:frontend
```

### Réplication (2 Serveurs)

```bash
# Terminal 1
npm run server1

# Terminal 2
npm run server2
```

Serveurs disponibles sur :
- **Serveur 1** : http://localhost:3001
- **Serveur 2** : http://localhost:3002

### Tests de Sécurité

```bash
npm test
```

## 📂 Structure (Simplifié)

```
SecureNotes/
├── backend/          ← Serveur API (Express, JWT, crypto)
├── frontend/         ← Interface Web (HTML/CSS/JS)
└── package.json      ← Scripts globaux
```

## 🔑 Premiers Pas

### 1. Créer un Compte
1. Ouvrir http://localhost:3001
2. Cliquer sur "S'inscrire"
3. Entrer username + password
4. Cliquer sur "S'inscrire"

### 2. Créer une Note
1. Cliquer sur "+ Nouvelle note"
2. Entrer titre et contenu
3. Cliquer sur "Créer"

### 3. Partager une Note
1. Cliquer sur "Partager" sur une note
2. Entrer le username du destinataire
3. Choisir les permissions (lecture/écriture)
4. Cliquer sur "Partager"

## 🛠️ Développement

### Backend (API)

```bash
cd backend
npm run dev
```

Fichiers importants :
- `backend/src/server.js` - Serveur principal
- `backend/src/routes/` - Routes API
- `backend/src/services/` - Logique métier

### Frontend (UI)

```bash
cd frontend
npm start
```

Fichiers importants :
- `frontend/index.html` - Page principale
- `frontend/js/app.js` - Application
- `frontend/css/style.css` - Styles

## 🔍 Résolution Rapide

### Port déjà utilisé
```bash
lsof -ti:3001 | xargs kill -9
npm start
```

### Problème d'installation
```bash
rm -rf backend/node_modules frontend/node_modules
npm install
```

### Réinitialiser les données
```bash
rm -rf backend/data/
cd backend && npm run init
```

## 📚 Documentation Complète

- **Vue d'ensemble** : `README.md`
- **Architecture** : `PROJECT_STRUCTURE.md`
- **Migration** : `MIGRATION.md`
- **Backend** : `backend/README.md`
- **Frontend** : `frontend/README.md`
- **Sécurité** : `docs/Rapport-Securite.md`

## 🎯 Prochaines Étapes

1. ✅ Lire `README.md` pour comprendre le projet
2. ✅ Lire `PROJECT_STRUCTURE.md` pour l'architecture
3. ✅ Explorer `backend/src/` pour le code backend
4. ✅ Explorer `frontend/` pour le code frontend
5. ✅ Lancer les tests avec `npm test`

## 💡 Astuces

### Voir les logs en temps réel
```bash
tail -f backend/data/logs/audit.log
```

### Tester l'API avec curl
```bash
# Health check
curl http://localhost:3001/health

# Créer un compte
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"Test123!"}'
```

### Changer le port
```bash
cd backend
node src/server.js --port=3003
```

## 🚨 En Cas de Problème

1. Vérifier que Node.js v14+ est installé : `node --version`
2. Vérifier que npm v6+ est installé : `npm --version`
3. Réinstaller les dépendances : `npm install`
4. Consulter les logs : `backend/data/logs/audit.log`
5. Lire `MIGRATION.md` pour les détails

## ✅ Checklist Démarrage

- [ ] Node.js v14+ installé
- [ ] Projet cloné
- [ ] `npm install` exécuté
- [ ] `npm start` lancé
- [ ] http://localhost:3001 accessible
- [ ] Compte créé
- [ ] Note créée
- [ ] Note partagée (optionnel)
- [ ] Tests lancés (optionnel)

**Tout fonctionne ? Parfait ! 🎉**

---

**Besoin d'aide ?** Consultez `README.md` ou `PROJECT_STRUCTURE.md`

**Groupe 6** - SecureNotes v1.0.0

