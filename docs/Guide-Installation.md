# Guide d'installation et d'utilisation - SecureNotes

## Prérequis

### Logiciels requis

- **Node.js** : Version 14 ou supérieure (recommandé : v18+)
  - Téléchargement : https://nodejs.org/
  - Vérifier l'installation : `node --version`

- **npm** : Version 6 ou supérieure (inclus avec Node.js)
  - Vérifier l'installation : `npm --version`

- **Git** : Pour cloner le repository
  - Téléchargement : https://git-scm.com/

### Système d'exploitation

- Windows 10/11
- Linux (Ubuntu, Debian, etc.)
- macOS

---

## Installation pas à pas

### Étape 1 : Cloner le projet

```
# Cloner le repository
git clone https://github.com/LoicL832/SecureNotes.git

# Entrer dans le dossier
cd SecureNotes
```

### Étape 2 : Installer les dépendances

```
npm install
```

Cette commande va installer :
- express (serveur web)
- bcryptjs (hachage mot de passe)
- jsonwebtoken (JWT)
- helmet (sécurité HTTP)
- cors (Cross-Origin Resource Sharing)
- express-rate-limit (limitation requêtes)
- uuid (génération d'identifiants)
- axios (client HTTP pour tests)

**Durée** : ~30-60 secondes selon votre connexion

### Étape 3 : Vérifier l'installation

```
# Afficher la structure du projet
dir
```

Vous devriez voir :
```
SecureNotes/
├── config/
├── src/
├── public/
├── tests/
├── docs/
├── package.json
├── .gitignore
└── README.md
```

---

## Démarrage du système

### Option 1 : Serveur unique (développement)

```
npm run dev
```

**Résultat** :
- Serveur démarré sur http://localhost:3001
- Pas de réplication (un seul serveur)
- Idéal pour tester rapidement

### Option 2 : Deux serveurs avec réplication (recommandé)

**Terminal 1** - Serveur principal :
```
npm run server1
```

**Terminal 2** - Serveur répliqué :
```
npm run server2
```

**Résultat** :
- Serveur 1 : http://localhost:3001
- Serveur 2 : http://localhost:3002
- Réplication active toutes les 30 secondes
- Tolérance aux pannes

**Sortie console attendue** :

```
SecureNotes Server Started

Server Name: server1
Port: 3001
Peer: http://localhost:3002

API Base URL: http://localhost:3001/api
Frontend URL: http://localhost:3001

Health Check: http://localhost:3001/health

Security Features:
- JWT Authentication
- AES-256-GCM Encryption
- Rate Limiting
- Input Validation
- Injection Protection
- Audit Logging
- Active-Active Replication

Press Ctrl+C to stop the server.
```

---

## Accéder à l'interface web

### Ouvrir le navigateur

1. Ouvrir votre navigateur (Chrome, Firefox, Edge)
2. Aller à l'adresse : **http://localhost:3001**

### Première utilisation

#### 1. Inscription

- Cliquer sur "S'inscrire"
- Remplir le formulaire :
  - **Nom d'utilisateur** : 3-50 caractères (lettres, chiffres, underscore)
  - **Email** : Format valide (user@example.com)
  - **Mot de passe** : 
    - Minimum 8 caractères
    - Au moins une majuscule
    - Au moins une minuscule
    - Au moins un chiffre
    - Au moins un caractère spécial (!@#$%^&*)

**Exemple valide** :
```
Username: alice_demo
Email: alice@demo.com
Password: SecurePass123!
```

- Cliquer sur "S'inscrire"
- Message de confirmation : "Inscription réussie !"

#### 2. Connexion

- Retour automatique à l'écran de connexion
- Entrer nom d'utilisateur et mot de passe
- Cliquer sur "Se connecter"
- Redirection vers l'interface principale

---

## Utilisation de l'application

### Vue d'ensemble

```
┌────────────────────────────────────────────┐
│  SecureNotes    alice_demo [Déconnexion]   │
├──────────┬─────────────────────────────────┤
│          │                                 │
│ Mes      │        Liste des notes          │
│ notes    │                                 │
│          │  ┌──────────────────────┐       │
│ Partagées│  │ Ma première note     │       │
│ avec moi │  │ Créée: Aujourd'hui   │       │
│          │  └──────────────────────┘       │
│          │                                 │
│ Mes      │  ┌──────────────────────┐       │
│ partages │  │ Idées projet         │       │
│          │  │ Créée: Hier          │       │
│          │  └──────────────────────┘       │
│          │                                 │
│ [+Nouv.] │                                 │
│  Note    │                                 │
└──────────┴─────────────────────────────────┘
```

### Créer une note

1. Cliquer sur le bouton "Nouvelle note"
2. Entrer un **titre** (1-200 caractères)
3. Entrer le **contenu** (jusqu'à 1 MB)
4. Cliquer sur "Enregistrer"

Note : La note est automatiquement chiffrée avec AES-256-GCM avant stockage

### Lire une note

1. Cliquer sur une note dans la liste
2. La note s'ouvre dans l'éditeur
3. Voir les métadonnées : date de création, dernière modification

### Modifier une note

1. Ouvrir la note
2. Modifier le titre ou le contenu
3. Cliquer sur "Enregistrer"

### Supprimer une note

1. Ouvrir la note
2. Cliquer sur "Supprimer"
3. Confirmer la suppression

Attention : Suppression définitive, aucune récupération possible !

---

## Partage de notes

### Partager une note

1. Ouvrir la note à partager
2. Cliquer sur "Partager"
3. Dans la popup :
   - Entrer le **nom d'utilisateur** du destinataire
   - Choisir la **permission** :
     - **Lecture seule** : Le destinataire peut lire la note
     - **Lecture et écriture** : Le destinataire peut modifier la note
4. Cliquer sur "Partager"

### Accéder aux notes partagées

1. Cliquer sur "Partagées avec moi" dans le menu
2. Liste des notes partagées avec vous
3. Badge indiquant la permission (Lecture ou Écriture)
4. Cliquer sur une note pour l'ouvrir

### Verrouiller une note (écriture collaborative)

Contexte : Vous travaillez à plusieurs sur une note avec permission "écriture"

1. Ouvrir la note partagée
2. Pendant que vous modifiez, la note est verrouillée automatiquement
3. Les autres utilisateurs voient : "Verrouillée par alice_demo"
4. Ils ne peuvent pas modifier tant que vous travaillez dessus
5. En sauvegardant, la note est déverrouillée

### Révoquer un partage

1. Cliquer sur "Mes partages" dans le menu
2. Liste des notes que vous avez partagées
3. Cliquer sur "Révoquer" à côté du partage à supprimer
4. Le destinataire perd immédiatement l'accès

---

## Configuration avancée

### Changer le port du serveur

Éditer `config/config.js` :

```
server: {
  port: process.env.PORT || 3005,  // Changer 3001 en 3005
  // ...
}
```

Ou utiliser une variable d'environnement :

```
# Windows PowerShell
$env:PORT=3005
npm run dev
```

### Modifier le secret JWT

IMPORTANT : En production, changez le secret JWT !

Éditer `config/config.js` :

```
jwt: {
  secret: 'VOTRE_SECRET_ROBUSTE_ICI',  // Min 32 caractères aléatoires
  // ...
}
```

### Configurer CORS

Si votre frontend est sur un autre domaine :

```
cors: {
  origin: 'http://mon-frontend.com',  // Changer l'origine
  credentials: true
}
```

### Ajuster le rate limiting

Pour environnement de test (plus permissif) :

```
rateLimit: {
  windowMs: 15 * 60 * 1000,
  max: 500,  // Augmenter la limite
  // ...
}
```

---

## Lancer les tests de sécurité

### Tests automatisés

```
npm test
```

Prérequis : Le serveur doit être démarré

Résultat attendu : 12/12 tests réussis

Durée : ~30-45 secondes

### Interpréter les résultats

```
✓ Test réussi (vert)
✗ Test échoué (rouge)
ℹ Information (bleu)
```

Si un test échoue :
1. Vérifier que le serveur est démarré
2. Vérifier qu'aucun autre processus n'utilise le port
3. Lire le message d'erreur détaillé

---

## Vérification du chiffrement

### Voir les fichiers chiffrés

```
# Naviguer vers le dossier des notes
cd data\notes

# Lister les dossiers utilisateurs
dir
```

Chaque utilisateur a son propre dossier (UUID).

### Contenu d'un fichier .enc

```
# Afficher un fichier de note
type [userId]\[noteId].enc
```

Résultat : JSON avec données chiffrées
```json
{
  "encrypted": "a3f8e9c1d2...",
  "iv": "7b2d4e9a...",
  "tag": "f1c8d3a7...",
  "salt": "9e5a2c1f..."
}
```

Le contenu est illisible sans la clé de déchiffrement !

### Vérifier les logs

```
# Afficher les logs d'audit
type data\logs\audit.log
```

Format :
```json
{"timestamp":"2026-01-06T12:34:56.789Z","level":"AUTH","event":"LOGIN_SUCCESS","userId":"alice","ip":"127.0.0.1","success":true}
{"timestamp":"2026-01-06T12:35:10.123Z","level":"INFO","event":"Note created","userId":"alice","noteId":"abc-123"}
```

---

## Dépannage

### Problème : Port déjà utilisé

Erreur : `EADDRINUSE: address already in use`

Solution :
1. Arrêter le processus existant :
```
# Trouver le processus
netstat -ano | findstr :3001

# Tuer le processus (remplacer PID)
taskkill /PID [PID] /F
```
2. Ou changer le port (voir Configuration avancée)

### Problème : Dépendances manquantes

Erreur : `Cannot find module 'express'`

Solution :
```powershell
# Supprimer node_modules
Remove-Item -Recurse -Force node_modules

# Réinstaller
npm install
```

### Problème : Token JWT invalide

Erreur : `401 Unauthorized`

Solution :
1. Se déconnecter
2. Se reconnecter
3. Nouveau token généré automatiquement

### Problème : Note ne se déchiffre pas

Erreur : `Failed to decrypt note`

Causes possibles :
- Fichier .enc corrompu
- Clé de chiffrement incorrecte
- Utilisateur différent

Solution :
- Impossible de récupérer (chiffrement sécurisé)
- Supprimer la note corrompue

### Problème : Réplication ne fonctionne pas

Symptôme : Données non synchronisées entre serveurs

Vérification :
```powershell
# Tester la santé du serveur pair
curl http://localhost:3002/api/internal/health
```

Solutions :
1. Vérifier que les deux serveurs sont démarrés
2. Vérifier les URLs de pair dans la configuration
3. Consulter les logs :
```
# Rechercher les erreurs de réplication
findstr /C:"REPLICATION" data\logs\audit.log
```

---

## Surveillance et maintenance

### Vérifier l'état du serveur

```powershell
# Health check
curl http://localhost:3001/health
```

Réponse :
```json
{
  "status": "healthy",
  "serverName": "server1",
  "timestamp": "2026-01-06T12:34:56.789Z"
}
```

### Surveillance des logs

```powershell
# Afficher les logs en temps réel (Windows)
Get-Content data\logs\audit.log -Wait -Tail 20
```

### Nettoyage des données

Attention : Suppression définitive !

```powershell
# Supprimer toutes les données
Remove-Item -Recurse -Force data\

# Redémarrer le serveur (recréera les dossiers)
npm run dev
```

### Backup des données

```powershell
# Créer un backup
Compress-Archive -Path data\ -DestinationPath backup-$(Get-Date -Format "yyyyMMdd-HHmmss").zip
```

---

## Déploiement en production

### Checklist pré-déploiement

- [ ] Changer le secret JWT (min 32 caractères aléatoires)
- [ ] Utiliser HTTPS avec certificat valide (Let's Encrypt)
- [ ] Configurer les variables d'environnement
- [ ] Activer les backups automatiques
- [ ] Configurer un reverse proxy (nginx, Apache)
- [ ] Activer le monitoring (Prometheus, Grafana)
- [ ] Tester tous les scénarios d'utilisation
- [ ] Lancer les tests de sécurité
- [ ] Mettre en place des alertes
- [ ] Documenter la procédure de récupération

### Variables d'environnement recommandées

```bash
NODE_ENV=production
PORT=3001
JWT_SECRET=<secret-robuste-32-caracteres>
CORS_ORIGIN=https://mon-domaine.com
PEER_URL=https://server2.mon-domaine.com
```

### Reverse proxy (nginx)

```nginx
server {
    listen 443 ssl http2;
    server_name securenotes.example.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Support et ressources

### Documentation

- **README.md** : Vue d'ensemble du projet
- **docs/UMLSec-Diagrams.md** : Diagrammes de sécurité
- **docs/Rapport-Securite.md** : Rapport de sécurité complet
- **Ce guide** : Installation et utilisation

### Ressources externes

- [Node.js Documentation](https://nodejs.org/docs/)
- [Express.js Guide](https://expressjs.com/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

### Dépôt GitHub

https://github.com/LoicL832/SecureNotes

---

## Checklist de vérification

Après installation, vérifier que :

- [ ] Serveur 1 démarre sans erreur
- [ ] Serveur 2 démarre sans erreur (optionnel)
- [ ] Interface web accessible sur http://localhost:3001
- [ ] Inscription d'un utilisateur fonctionne
- [ ] Connexion fonctionne
- [ ] Création de note fonctionne
- [ ] Modification de note fonctionne
- [ ] Suppression de note fonctionne
- [ ] Partage de note fonctionne
- [ ] Notes partagées visibles
- [ ] Tous les tests de sécurité passent (npm test)
- [ ] Logs créés dans data/logs/audit.log
- [ ] Notes chiffrées dans data/notes/[userId]/

---

Guide rédigé pour SecureNotes - Groupe 6
Version : 1.0
Date : 6 janvier 2026
