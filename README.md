# SecureNotes 🔒

**Système de gestion de notes sécurisé avec chiffrement et réplication Active-Active**

Projet universitaire - Groupe 6 (Stockage Fichiers)  
**Conformité UMLsec : ✅ 100% (20/20 tests)**

---

## ⚡ DÉMARRAGE RAPIDE

```bash
# À la racine du projet
npm start
```

**Lance automatiquement :**
- 🖥️ Server 1 (HTTPS) : https://localhost:3001
- 🖥️ Server 2 (HTTPS) : https://localhost:3002
- 🎨 Frontend : http://localhost:8080

### Accepter les Certificats SSL (OBLIGATOIRE)

1. Ouvrir `https://localhost:3001` → Cliquer "Avancé" → "Continuer"
2. Ouvrir `https://localhost:3002` → Cliquer "Avancé" → "Continuer"
3. Ouvrir `http://localhost:8080` → Rafraîchir (Cmd+R)
4. ✅ Utiliser l'application

**⚠️ Certificats auto-signés normaux pour tests locaux académiques**

---

## 📚 DOCUMENTATION COMPLÈTE

### Pour Tous
- 📘 **[GUIDE_UTILISATION.md](GUIDE_UTILISATION.md)** - Guide complet d'utilisation, démarrage et dépannage

### Pour l'Enseignant
- 🎓 **[AUDIT_SECURITE_UMLSEC.md](AUDIT_SECURITE_UMLSEC.md)** - Rapport audit complet + tests conformité

### Pour Comprendre l'Architecture
- 🏗️ **[ARCHITECTURE_TECHNIQUE.md](ARCHITECTURE_TECHNIQUE.md)** - Architecture, réplication, sécurité

---

## 🧪 TESTS DE SÉCURITÉ

```bash
./test-security.sh
```

**Résultat attendu : 20/20 tests passés ✅**

---

## 🔐 SÉCURITÉ (Conformité UMLsec)

| Stéréotype | Implémentation | Statut |
|------------|----------------|--------|
| **<<secure links>>** | HTTPS/TLS | ✅ |
| **<<encrypted>>** | AES-256-GCM | ✅ |
| **<<secrecy>>** | JWT + Isolation | ✅ |
| **<<integrity>>** | Verrouillage .lock | ✅ |
| **<<critical>>** | Permissions 600/700 | ✅ |
| **<<no down-flow>>** | Logs sanitisés | ✅ |
| **<<data security>>** | Path Traversal protection | ✅ |

**Conformité : 7/7 (100%)**

---

## 🔄 ARCHITECTURE

**Réplication Active-Active avec 2 serveurs backend :**

```
Server 1 (3001) ←──── HTTPS Sync ────→ Server 2 (3002)
         ↓                                     ↓
              Frontend (8080) → Utilise Server 1
```

**Caractéristiques :**
- ✅ Haute disponibilité (failover automatique)
- ✅ Synchronisation bidirectionnelle temps réel
- ✅ Communication HTTPS sécurisée entre serveurs
- ✅ Stockage fichiers avec permissions restrictives

---

## 📦 FONCTIONNALITÉS

- 📝 Création/modification/suppression de notes
- 🔒 Chiffrement AES-256-GCM des notes
- 🔑 Authentification JWT
- 👥 Partage de notes entre utilisateurs
- 🔐 Verrouillage pour édition concurrente
- 🔄 Réplication Active-Active
- 📊 Logs d'audit sécurisés

---

## 🎯 GROUPE 6 - Spécificités

- ✅ **Stockage fichiers** (pas de SQL)
- ✅ **Protection Path Traversal** (double validation)
- ✅ **Permissions restrictives** (600 fichiers, 700 répertoires)
- ✅ **Isolation par utilisateur** (répertoires séparés)
- ✅ **Réplication Active-Active** (2 serveurs)

---

## 🛠️ TECHNOLOGIES

**Backend :**
- Node.js + Express
- HTTPS/TLS
- JWT + bcrypt
- AES-256-GCM
- Helmet (sécurité headers)

**Frontend :**
- HTML5 + CSS3 + JavaScript
- Fetch API

**Sécurité :**
- Permissions Unix (600/700)
- Verrouillage physique (.lock)
- Logs sanitisés
- Rate limiting

---

## 📞 CONTACT

**Projet :** SecureNotes  
**Groupe :** 6 (Stockage Fichiers)  
**Date :** Janvier 2026  
**Conformité UMLsec :** ✅ 100%

---

**Pour plus de détails, consultez la documentation complète ci-dessus ! 📚**

#### Frontend
5. **Retournez sur :** `http://localhost:8080`
6. **Rafraîchissez :** Cmd+R (Mac) ou Ctrl+R (Windows)
7. **✅ Ça fonctionne !**

**🎯 Astuce Chrome/Edge :** Tapez `thisisunsafe` sur chaque page d'erreur

---

### 🔄 Alternative : Mode HTTP (Tests sans certificat)

```bash
./toggle-https.sh off
npm start
```

**⚠️ ATTENTION :** Désactive <<secure links>> UMLsec

---

**📖 Guides :**
- 🔄 **[REPLICATION_2_SERVEURS.md](REPLICATION_2_SERVEURS.md)** - Guide réplication Active-Active
- ⚡ **[REFERENCE_RAPIDE.md](REFERENCE_RAPIDE.md)** - Référence rapide
- 🚀 **[LANCEMENT_APPLICATION.md](LANCEMENT_APPLICATION.md)** - Guide complet
- 📚 **[INDEX_DOCUMENTATION.md](INDEX_DOCUMENTATION.md)** - Navigation complète
- 📘 **[SOLUTION_CERTIFICAT_SSL.md](SOLUTION_CERTIFICAT_SSL.md)** - Guide complet
- 🔄 **[toggle-https.sh](toggle-https.sh)** - Script HTTP/HTTPS

**Documentation :**
- 📖 [Guide de Démarrage Complet](DEMARRAGE.md) - Instructions détaillées
- 📖 [Guide de Démarrage Rapide](QUICKSTART.md) - Commencer en 2 minutes
- 🔧 [Résolution des problèmes](PROBLEME-RESOLU.md) - Si vous rencontrez des erreurs
- 📂 [Architecture du Projet](PROJECT_STRUCTURE.md) - Structure détaillée
- 📄 [Guide des Pages Séparées](docs/Guide-Pages-Separees.md) - Architecture frontend
- 🧪 [Guide de Tests](TESTS.md) - Tests et dépannage
- 🔧 [Documentation Backend](backend/README.md)
- 🎨 [Documentation Frontend](frontend/README.md)

**Guides de résolution :**
- 🚨 [Erreur CSP "Refused to connect"](SOLUTION-CSP.md)
- 🚨 [Erreur 404 sur API](SOLUTION-404.md)

---

## 📋 Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Fonctionnalités](#fonctionnalités)
- [Architecture](#architecture)
- [Sécurité](#sécurité)
- [Installation](#installation)
- [Utilisation](#utilisation)
- [API REST](#api-rest)
- [Tests](#tests)
- [Documentation technique](#documentation-technique)
- [Membres du groupe](#membres-du-groupe)

---

## 🎯 Vue d'ensemble

SecureNotes est un système de stockage et de consultation de notes textuelles personnelles, sécurisé et multi-utilisateurs. Le système implémente :

- **Chiffrement AES-256-GCM** pour la confidentialité des notes
- **Authentification forte** avec bcrypt et JWT
- **Réplication active-active** sur deux serveurs
- **Partage sécurisé** avec gestion fine des permissions
- **Protection complète** contre les attaques courantes

### Technologies utilisées

- **Backend** : Node.js + Express.js
- **Frontend** : HTML5, CSS3, JavaScript (Vanilla)
- **Sécurité** : bcrypt, JWT, Helmet, rate-limit
- **Stockage** : Système de fichiers avec chiffrement

---

## ✨ Fonctionnalités

### Authentification
- ✅ Inscription avec validation stricte des mots de passe
- ✅ Connexion sécurisée avec JWT
- ✅ Protection brute force (verrouillage après 5 tentatives)
- ✅ Rate limiting (5 tentatives / 15 minutes)
- ✅ Déconnexion

### Gestion des notes
- ✅ Créer une note (chiffrée automatiquement)
- ✅ Lire ses notes
- ✅ Modifier une note
- ✅ Supprimer une note
- ✅ Chiffrement AES-256-GCM au repos

### Partage et collaboration
- ✅ Partager une note avec un autre utilisateur
- ✅ Permissions : lecture seule ou lecture/écriture
- ✅ Verrouillage exclusif pour l'écriture collaborative
- ✅ Révocation de partage
- ✅ Isolation stricte des données

### Réplication
- ✅ Synchronisation automatique entre deux serveurs
- ✅ Détection et résolution des conflits
- ✅ Tolérance aux pannes
- ✅ Active-active (les deux serveurs sont actifs)

---

## 🏗️ Architecture

### Architecture globale

```
┌─────────────────────────────────────────┐
│        Frontend Web (HTTPS)             │
└──────────────┬──────────────────────────┘
               │ REST API (JWT)
      ┌────────┴────────┐
      │                 │
┌─────▼─────┐    ┌─────▼─────┐
│ Server 1  │◄──►│ Server 2  │
│ (Primary) │Sync│ (Replica) │
└───────────┘    └───────────┘
```

### Stack technique

**Backend :**
- Express.js : Framework web
- bcryptjs : Hash des mots de passe (12 rounds)
- jsonwebtoken : Authentification JWT
- helmet : Headers de sécurité HTTP
- express-rate-limit : Protection DDoS
- crypto (native) : Chiffrement AES-256-GCM

**Frontend :**
- HTML5/CSS3 : Interface responsive
- JavaScript vanilla : Logique client
- Fetch API : Communication avec le backend

**Stockage :**
- JSON : Métadonnées (users, shares)
- Fichiers .enc : Notes chiffrées
- Logs : Audit trail

---

## 🔒 Sécurité

### Exigences UMLSec implémentées

Le système respecte les stéréotypes UMLSec suivants :

- **<<secrecy>>** : Confidentialité des données (chiffrement)
- **<<integrity>>** : Intégrité des données (HMAC, logs)
- **<<critical>>** : Composants critiques protégés
- **<<secure links>>** : Communications sécurisées (HTTPS)
- **<<authenticated>>** : Accès authentifié uniquement
- **<<encrypted>>** : Stockage chiffré

### Contre-mesures implémentées

| Menace | Contre-mesure |
|--------|---------------|
| **Brute force** | Verrouillage compte après 5 tentatives, rate limiting |
| **Injection SQL/NoSQL** | Validation stricte, pas de DB SQL |
| **XSS** | Sanitization des entrées, CSP headers |
| **CSRF** | Tokens JWT, SameSite cookies |
| **Man-in-the-Middle** | HTTPS obligatoire, HSTS |
| **Accès non autorisé** | JWT vérifié à chaque requête |
| **Élévation de privilèges** | Vérification permissions stricte |
| **Fuite de données** | Chiffrement AES-256-GCM au repos |
| **Path traversal** | Validation des chemins, détection ".." |
| **DDoS** | Rate limiting global (100 req/15min) |

### Chiffrement

**Algorithme** : AES-256-GCM (Authenticated Encryption)

**Détails** :
- Clé de 256 bits dérivée avec PBKDF2 (100 000 itérations)
- IV unique de 16 bytes par note
- Salt unique de 64 bytes
- Tag d'authentification de 16 bytes
- Garantit confidentialité ET intégrité

**Hachage des mots de passe** :
- bcrypt avec 12 rounds (2^12 = 4096 itérations)
- Salt unique par utilisateur
- Protection contre rainbow tables

### Authentification

**JWT (JSON Web Tokens)** :
- Signature HMAC-SHA256
- Expiration : 1 heure (access token)
- Refresh token : 7 jours
- Stockage : localStorage côté client

### Audit et logs

Tous les événements de sécurité sont journalisés :
- Tentatives de connexion (succès/échec)
- Accès aux ressources
- Modifications de données
- Erreurs de sécurité
- Réplication

Format : JSON avec timestamp, utilisateur, action, IP

---

## 🚀 Installation

### Prérequis

- **Node.js** : v14+ (recommandé v18+)
- **npm** : v6+
- **Système** : Windows, Linux ou macOS

### Architecture du projet

Le projet est maintenant structuré en deux parties distinctes :

```
SecureNotes/
├── backend/                # Serveur backend (API REST)
│   ├── src/               # Code source
│   ├── config/            # Configuration
│   ├── tests/             # Tests de sécurité
│   ├── data/              # Données persistantes
│   └── package.json
├── frontend/              # Application frontend (Web)
│   ├── index.html
│   ├── css/
│   ├── js/
│   └── package.json
├── docs/                  # Documentation
└── package.json           # Scripts racine
```

### Étapes

1. **Cloner le repository**

```bash
git clone https://github.com/LoicL832/SecureNotes.git
cd SecureNotes
```

2. **Installer toutes les dépendances**

```bash
npm install
```

Cela installe automatiquement les dépendances du backend ET du frontend.

3. **Lancer le serveur 1 (avec frontend intégré)**

```bash
npm run server1
```

Serveur disponible sur : `http://localhost:3001`  
Frontend accessible sur : `http://localhost:3001`

4. **Lancer le serveur 2 (dans un autre terminal)**

```bash
npm run server2
```

Serveur disponible sur : `http://localhost:3002`

5. **Accéder à l'interface web**

Ouvrir le navigateur : `http://localhost:3001`

### Démarrage alternatif

**Backend seul :**
```bash
npm run dev:backend
# ou
cd backend && npm start
```

**Frontend seul (serveur de développement) :**
```bash
npm run dev:frontend
# ou
cd frontend && npm start
```

Le frontend sera accessible sur `http://localhost:8080` et communiquera avec le backend sur le port 3001.

---

## 💻 Utilisation

### Interface web

1. **Inscription**
   - Cliquez sur "S'inscrire"
   - Nom d'utilisateur : 3-50 caractères alphanumériques
   - Email valide
   - Mot de passe : min 8 caractères (maj, min, chiffre, spécial)

2. **Connexion**
   - Entrez vos identifiants
   - Le token JWT est stocké automatiquement

3. **Créer une note**
   - Cliquez sur "➕ Nouvelle note"
   - Entrez un titre et un contenu
   - Cliquez sur "💾 Enregistrer"
   - La note est chiffrée automatiquement

4. **Modifier une note**
   - Cliquez sur une note dans la liste
   - Modifiez le contenu
   - Sauvegardez

5. **Partager une note**
   - Ouvrez la note
   - Cliquez sur "👥 Partager"
   - Entrez le nom d'utilisateur du destinataire
   - Choisissez la permission (lecture/écriture)

6. **Verrouiller une note partagée**
   - Accédez à une note partagée en écriture
   - Le verrouillage empêche les modifications concurrentes

### Ligne de commande

**Démarrer un serveur avec configuration personnalisée :**

```bash
cd backend
node src/server.js --port=3003 --name=server3 --peer=http://localhost:3001
```

**Lancer les tests de sécurité :**

```bash
npm test
```

---

## 📡 API REST

### Authentification

**POST /api/auth/register**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**POST /api/auth/login**
```json
{
  "username": "john_doe",
  "password": "SecurePass123!"
}
```
Réponse :
```json
{
  "user": { "id": "...", "username": "john_doe" },
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

**POST /api/auth/refresh**
```json
{
  "refreshToken": "eyJhbGc..."
}
```

### Notes

**Toutes les routes nécessitent un header :**
```
Authorization: Bearer <accessToken>
```

**GET /api/notes**  
Liste toutes les notes de l'utilisateur

**POST /api/notes**
```json
{
  "title": "Ma note",
  "content": "Contenu secret"
}
```

**GET /api/notes/:id**  
Récupère une note spécifique

**PUT /api/notes/:id**
```json
{
  "title": "Titre modifié",
  "content": "Nouveau contenu"
}
```

**DELETE /api/notes/:id**  
Supprime une note

### Partage

**POST /api/shares**
```json
{
  "noteId": "uuid-de-la-note",
  "targetUsername": "alice",
  "permission": "read"  // ou "write"
}
```

**GET /api/shares/received**  
Notes partagées avec moi

**GET /api/shares/sent**  
Notes que j'ai partagées

**DELETE /api/shares/:shareId**  
Révoque un partage

**POST /api/shares/lock/:noteId**  
Verrouille une note pour écriture exclusive

**POST /api/shares/unlock/:noteId**  
Déverrouille une note

**GET /api/shares/notes/:noteId**  
Lit une note partagée

**PUT /api/shares/notes/:noteId**  
Modifie une note partagée

### Réplication (API interne)

**POST /api/internal/sync**  
Synchronise les données entre serveurs  
(Authentification interne requise)

**GET /api/internal/health**  
État de santé du serveur

---

## 🧪 Tests

### Tests de sécurité automatisés

Le projet inclut une suite complète de tests de sécurité :

```bash
npm test
```

**Tests inclus :**

1. ✅ Protection brute force
2. ✅ Rate limiting
3. ✅ Validation mot de passe faible
4. ✅ Injection SQL/NoSQL
5. ✅ Protection XSS
6. ✅ Path traversal
7. ✅ Accès non autorisé
8. ✅ Expiration tokens
9. ✅ Élévation de privilèges
10. ✅ Chiffrement au repos
11. ✅ Permissions de partage
12. ✅ Verrouillage de notes

**Résultat attendu :** 12/12 tests réussis

### Tests manuels

**Test de réplication :**

1. Lancer les deux serveurs
2. Créer une note sur le serveur 1
3. Attendre 30 secondes (sync automatique)
4. Vérifier la présence de la note sur le serveur 2

**Test de tolérance aux pannes :**

1. Arrêter le serveur 2
2. Continuer à utiliser le serveur 1
3. Redémarrer le serveur 2
4. Vérifier que les données sont synchronisées

---

## 📚 Documentation technique

### Structure du projet

```
SecureNotes/
├── backend/
│   ├── config/
│   │   └── config.js           # Configuration globale
│   ├── src/
│   │   ├── middleware/
│   │   │   ├── auth.js         # Authentification JWT
│   │   │   └── security.js     # Middlewares de sécurité
│   │   ├── routes/
│   │   │   ├── auth.js         # Routes d'authentification
│   │   │   ├── notes.js        # Routes des notes
│   │   │   ├── shares.js       # Routes de partage
│   │   │   └── internal.js     # Routes de réplication
│   │   ├── services/
│   │   │   ├── userService.js  # Gestion utilisateurs
│   │   │   ├── noteService.js  # Gestion notes
│   │   │   ├── shareService.js # Gestion partages
│   │   │   └── replicationService.js # Réplication
│   │   ├── utils/
│   │   │   ├── crypto.js       # Chiffrement AES-256-GCM
│   │   │   ├── logger.js       # Logs de sécurité
│   │   │   └── validator.js    # Validation entrées
│   │   └── server.js           # Serveur principal
│   ├── tests/
│   │   └── security-tests.js   # Tests de sécurité
│   ├── data/                   # Données (gitignored)
│   │   ├── users/
│   │   ├── notes/
│   │   ├── shares/
│   │   └── logs/
│   ├── init.js                 # Script d'initialisation
│   └── package.json
├── frontend/
│   ├── css/
│   │   └── style.css           # Styles
│   ├── js/
│   │   ├── api.js              # Client API
│   │   ├── auth.js             # Gestion auth frontend
│   │   ├── notes.js            # Gestion notes frontend
│   │   └── app.js              # Application principale
│   ├── index.html              # Interface web
│   └── package.json
├── docs/
│   ├── Guide-Installation.md
│   ├── Rapport-Securite.md
│   └── UMLSec-Diagrams.md      # Diagrammes UMLSec
├── package.json                # Scripts racine
└── README.md
```

### Diagrammes UMLSec

Voir [docs/UMLSec-Diagrams.md](docs/UMLSec-Diagrams.md) pour :

- Diagramme de cas d'utilisation
- Diagramme de composants
- Diagramme de déploiement
- Diagrammes de séquence
- Annotations de sécurité

### Analyse de sécurité

**Modèle de menace :**

- **Acteur malveillant externe** : Attaquant sans compte
- **Utilisateur malveillant** : Utilisateur authentifié tentant d'accéder aux données d'autrui
- **Administrateur système compromis** : Protection avec chiffrement au repos

**Surface d'attaque :**

- API REST exposée
- Frontend web
- Système de fichiers
- Communication inter-serveurs

**Protection en profondeur :**

1. **Couche réseau** : HTTPS, HSTS, CORS
2. **Couche application** : Validation, sanitization, rate limiting
3. **Couche authentification** : JWT, bcrypt, verrouillage
4. **Couche données** : Chiffrement AES-256-GCM, isolation
5. **Couche audit** : Logs immuables, monitoring

---

## 👥 Membres du groupe

**Groupe 6**

- Membre 1 : [Nom]
- Membre 2 : [Nom]
- Membre 3 : [Nom]

---

## 📝 Licence

Projet universitaire - Tous droits réservés

---

## 🔗 Ressources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [UMLSec](http://umlsec.de/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [JWT.io](https://jwt.io/)
- [AES-GCM](https://en.wikipedia.org/wiki/Galois/Counter_Mode)

---

**Projet réalisé dans le cadre du cours de Génie Logiciel Sécurisé**  
**Deadline : 12 janvier 2026, 23h59**
