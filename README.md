# SecureNotes

**Système de gestion de notes sécurisé avec chiffrement et réplication Active-Active**

Projet universitaire - Groupe 6 (Stockage Fichiers)  
**Conformité UMLsec : 100% (20/20 tests)**

---

## DÉMARRAGE RAPIDE

-  Voir **[GUIDE_UTILISATION.md](GUIDE_UTILISATION.md)** - Guide complet d'utilisation, démarrage et dépannage
---

## DOCUMENTATION COMPLÈTE

### Pour Tous
- **[GUIDE_UTILISATION.md](GUIDE_UTILISATION.md)** - Guide complet d'utilisation, démarrage et dépannage

### Pour l'Enseignant
- **[AUDIT_SECURITE_UMLSEC.md](AUDIT_SECURITE_UMLSEC.md)** - Rapport audit complet + tests conformité

### Pour Comprendre l'Architecture
- **[ARCHITECTURE_TECHNIQUE.md](ARCHITECTURE_TECHNIQUE.md)** - Architecture, réplication, sécurité

---

## TESTS DE SÉCURITÉ

```bash
./test-security.sh
```

**Résultat attendu : 20/20 tests passés**

---

## SÉCURITÉ (Conformité UMLsec)

| Stéréotype                | Implémentation | Statut |
|---------------------------|----------------|--------|
| **<<**secure links**>>**  | HTTPS/TLS | OK |
| **<<**encrypted**>>**     | AES-256-GCM | OK |
| **<<**secrecy**>>**       | JWT + Isolation | OK |
| **<<**integrity**>>**     | Verrouillage .lock | OK |
| **<<**critical**>>**      | Permissions 600/700 | OK |
| **<<**no down-flow**>>**  | Logs sanitisés | OK |
| **<<**data security**>>** | Path Traversal protection | OK |

**Conformité : 7/7 (100%)**

---

## ARCHITECTURE

**Réplication Active-Active avec 2 serveurs backend :**

```
Server 1 (3001) <---- HTTPS Sync ----> Server 2 (3002)
         ↓                                     ↓
              Frontend (8080) -> Utilise Server 1
```

**Caractéristiques :**
- Haute disponibilité (failover automatique)
- Synchronisation bidirectionnelle temps réel
- Communication HTTPS sécurisée entre serveurs
- Stockage fichiers avec permissions restrictives

---

## FONCTIONNALITÉS

- Création/modification/suppression de notes
- Chiffrement AES-256-GCM des notes
- Authentification JWT
- Partage de notes entre utilisateurs
- Verrouillage pour édition concurrente
- Réplication Active-Active
- Logs d'audit sécurisés

---

## GROUPE 6 - Spécificités

- Stockage fichiers (pas de SQL)
- Protection Path Traversal (double validation)
- Permissions restrictives (600 fichiers, 700 répertoires)
- Isolation par utilisateur (répertoires séparés)
- Réplication Active-Active (2 serveurs)

---

## TECHNOLOGIES

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

## CONTACT

**Projet :** SecureNotes  
**Groupe :** 6 (Stockage Fichiers)  
**Date :** Janvier 2026  
**Conformité UMLsec :** 100%

---

**Pour plus de détails, consultez la documentation complète.**

#### Frontend
5. Retournez sur : `http://localhost:8080`
6. Rafraîchissez : Cmd+R (Mac) ou Ctrl+R (Windows)

---

### Alternative : Mode HTTP (Tests sans certificat)

```bash
./toggle-https.sh off
npm start
```

**ATTENTION :** Désactive <<**secure links**>> UMLsec

---

**Guides :**
- REPLICATION_2_SERVEURS.md - Guide réplication Active-Active
- REFERENCE_RAPIDE.md - Référence rapide
- LANCEMENT_APPLICATION.md - Guide complet
- INDEX_DOCUMENTATION.md - Navigation complète
- SOLUTION_CERTIFICAT_SSL.md - Guide complet
- toggle-https.sh - Script HTTP/HTTPS

---

## Table des matières

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

## Vue d'ensemble

SecureNotes est un système de stockage et de consultation de notes textuelles personnelles, sécurisé et multi-utilisateurs. Le système implémente :

- Chiffrement AES-256-GCM pour la confidentialité des notes
- Authentification forte avec bcrypt et JWT
- Réplication active-active sur deux serveurs
- Partage sécurisé avec gestion fine des permissions
- Protection complète contre les attaques courantes

---

## Installation

### Prérequis

- Node.js : v14+ (recommandé v18+)
- npm : v6+
- Système : Windows, Linux ou macOS

### Étapes

1. Cloner le repository

```bash
git clone https://github.com/LoicL832/SecureNotes.git
cd SecureNotes
```

2. Installer toutes les dépendances

```bash
npm install
```

Cela installe automatiquement les dépendances du backend ET du frontend.

3. Générer les certificats SSL

**Sur Windows (PowerShell)** :
```powershell
cd backend\certs
node generate-cert.js
cd ..\..
```

**Sur Linux/Mac** :
```bash
cd backend/certs
./generate-cert.sh
cd ../..
```

4. Lancer l'application

```bash
npm start
```

5. Accepter les certificats SSL dans le navigateur

**Sur Windows avec Firefox** :
- Ouvrir `https://localhost:3001`
- Cliquer **"Avancé"** → **"Accepter le risque et continuer"**
- Répéter pour `https://localhost:3002`

**Sur Windows avec Chrome/Edge** :
- Ouvrir `https://localhost:3001`
- Cliquer **"Paramètres avancés"** → **"Continuer vers localhost"**
- Répéter pour `https://localhost:3002`

6. Accéder à l'interface web

Frontend : `http://localhost:8080`

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
./run-tests.sh
./test-security.sh
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

##  Tests

### Tests de sécurité automatisés

Le projet inclut une suite complète de tests de sécurité UMLsec :

```bash
./test-security.sh
```

**Tests inclus (20 tests de conformité UMLsec) :**

**1 SÉCURITÉ DU CANAL (<<**secure links**>>)**
1. Certificats SSL présents
2. Permissions clé privée (600)
3. HTTPS activé dans config
4. CORS restrictif (liste blanche)

**2️ CONTRÔLE D'ACCÈS (<<**secrecy**>>)**
5. Middleware authenticate présent
6. Middleware checkNoteOwnership présent
7. Vérification owner stricte

**3 SÉCURITÉ STOCKAGE (<<**critical**>>)**
8. Protection Path Traversal
9. Validation UUID stricte
10. Permissions fichiers 600
11. Permissions répertoires 700
12. Fonction secureFilePermissions

**4 PRÉVENTION FUITES (<<**no down-flow**>>)**
13. Fonction sanitizeLogData présente
14. [REDACTED] pour données sensibles
15. Messages d'erreur génériques
16. Stack traces seulement en logs

**5️ INTÉGRITÉ & CONCURRENCE**
17. Champ locked dans métadonnées
18. Fonction createLockFile présente
19. Utilisation fichiers .lock
20. Opération atomique (flag wx)

**Résultat attendu :** 20/20 tests réussis (100% conformité UMLsec)

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

##  Documentation technique

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

Voir [docs/Diagrammes.pdf](docs/Diagrammes.pdf) pour :

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

##  Membres du groupe

**Groupe 6**

- Membre 1 : Duchamps Luc
- Membre 2 : Guiard--Dexet Matthieu
- Membre 3 : Verstraelen Adrien
- Membre 4 : Lamour Loïc

---

##  Licence

Projet universitaire - Tous droits réservés

---

##  Ressources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [UMLSec](http://umlsec.de/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [JWT.io](https://jwt.io/)
- [AES-GCM](https://en.wikipedia.org/wiki/Galois/Counter_Mode)

---

**Projet réalisé dans le cadre du cours de Génie Logiciel Sécurisé**  
**Deadline : 12 janvier 2026, 23h59**
