# SecureNotes 🔒

**Système de gestion de notes sécurisé avec chiffrement et réplication**

Projet universitaire - Groupe 6  
Deadline : 12 janvier 2026, 23h59

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

### Étapes

1. **Cloner le repository**

```powershell
git clone https://github.com/LoicL832/SecureNotes.git
cd SecureNotes
```

2. **Installer les dépendances**

```powershell
npm install
```

3. **Configuration (optionnel)**

Modifier `config/config.js` pour :
- Changer le secret JWT (IMPORTANT en production !)
- Ajuster le port des serveurs
- Configurer CORS

4. **Lancer le serveur 1**

```powershell
npm run server1
```

Serveur disponible sur : `http://localhost:3001`

5. **Lancer le serveur 2 (dans un autre terminal)**

```powershell
npm run server2
```

Serveur disponible sur : `http://localhost:3002`

6. **Accéder à l'interface web**

Ouvrir le navigateur : `http://localhost:3001`

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

```powershell
node src/server.js --port=3003 --name=server3 --peer=http://localhost:3001
```

**Lancer les tests de sécurité :**

```powershell
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

```powershell
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
├── config/
│   └── config.js           # Configuration globale
├── src/
│   ├── middleware/
│   │   ├── auth.js         # Authentification JWT
│   │   └── security.js     # Middlewares de sécurité
│   ├── routes/
│   │   ├── auth.js         # Routes d'authentification
│   │   ├── notes.js        # Routes des notes
│   │   ├── shares.js       # Routes de partage
│   │   └── internal.js     # Routes de réplication
│   ├── services/
│   │   ├── userService.js  # Gestion utilisateurs
│   │   ├── noteService.js  # Gestion notes
│   │   ├── shareService.js # Gestion partages
│   │   └── replicationService.js # Réplication
│   ├── utils/
│   │   ├── crypto.js       # Chiffrement AES-256-GCM
│   │   ├── logger.js       # Logs de sécurité
│   │   └── validator.js    # Validation entrées
│   └── server.js           # Serveur principal
├── public/
│   ├── css/
│   │   └── style.css       # Styles
│   ├── js/
│   │   ├── api.js          # Client API
│   │   ├── auth.js         # Gestion auth frontend
│   │   ├── notes.js        # Gestion notes frontend
│   │   └── app.js          # Application principale
│   └── index.html          # Interface web
├── tests/
│   └── security-tests.js   # Tests de sécurité
├── docs/
│   └── UMLSec-Diagrams.md  # Diagrammes UMLSec
├── data/                   # Données (gitignored)
│   ├── users/
│   ├── notes/
│   ├── shares/
│   └── logs/
├── package.json
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
