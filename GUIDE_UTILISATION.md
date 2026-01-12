# GUIDE D'UTILISATION - SecureNotes

## Table des Matières

1. [Démarrage Rapide](#démarrage-rapide)
2. [Lancement Détaillé](#lancement-détaillé)
3. [Accepter les Certificats SSL](#accepter-les-certificats-ssl)
4[Tests de Sécurité](#tests-de-sécurité)
5. [Dépannage](#dépannage)

---

## DÉMARRAGE RAPIDE (30 SECONDES)

### Lancement Simple

#### Premier Lancement :
```bash
# À la racine du projet
npm install
```
- Générer les certificats SSL
```bash
cd backend/certs
./generate-cert.sh
cd ../..
```
#### Chaque Lancement :
```bash
# À la racine du projet
npm start
```

**Lance automatiquement :**
- Server 1 (HTTPS) sur https://localhost:3001
- Server 2 (HTTPS) sur https://localhost:3002
- Frontend sur http://localhost:8080

### Accepter Certificats SSL

#### Server 1
1. Ouvrir : `https://localhost:3001`
2. Cliquer : "Avancé" → "Continuer vers localhost"

#### Server 2
3. Ouvrir : `https://localhost:3002`
4. Cliquer : "Avancé" → "Continuer vers localhost"

#### Frontend
5. Ouvrir : `http://localhost:8080`
6. Rafraîchir : **Cmd+R** (Mac) ou **Ctrl+R** (Windows)

**L'application fonctionne !**

### Arrêter
```bash
Ctrl+C
```

---


### Démonstrations Recommandées

#### 1. HTTPS Fonctionnel
```
https://localhost:3001 → Cadenas dans la barre d'adresse
```

#### 2. Authentification Requise
```bash
curl -k https://localhost:3001/api/notes
# Attendu : 401 Unauthorized
```

#### 3. Protection Path Traversal
```bash
curl -k "https://localhost:3001/api/notes/../../etc/passwd"
# Attendu : 400 Bad Request
```

#### 4. Permissions Fichiers
```bash
ls -la backend/data/notes/*/
# Attendu : drwx------ (700) pour répertoires
# Attendu : -rw------- (600) pour fichiers
```

#### 5. Logs Sanitisés
```bash
tail -f backend/data/logs/audit.log | grep "content"
# Attendu : [REDACTED]
```

#### 6. Verrouillage Concurrence
- Éditer une note dans un onglet
- Tenter d'éditer la même note dans un autre onglet
- Attendu : "Note is locked"

### Conformité UMLsec

| Stéréotype            | Implémentation | Statut |
|-----------------------|----------------|--------|
| <<**secure links**>>  | HTTPS/TLS | OK |
| <<**encrypted**>>     | AES-256-GCM | OK |
| <<**secrecy**>>       | JWT + Isolation | OK |
| <<**integrity**>>     | Verrouillage .lock | OK |
| <<**critical**>>      | Permissions 600/700 | OK |
| <<**no down-flow**>>  | Logs sanitisés | OK |
| <<**data security**>> | Path Traversal protection | OK |

Conformité : 7/7 (100%)

---

## LANCEMENT DÉTAILLÉ

### Architecture

```
┌─────────────────┐         ┌─────────────────┐
│   Server 1      │◄───────►│   Server 2      │
│   Port 3001     │  HTTPS  │   Port 3002     │
│   (HTTPS)       │  Sync   │   (HTTPS)       │
└────────┬────────┘         └────────┬────────┘
         │                           │
         └───────────┬───────────────┘
                     │
              ┌──────▼──────┐
              │  Frontend   │
              │  Port 8080  │
              │  (HTTP)     │
              └─────────────┘
```

### Réplication Active-Active

Caractéristiques :
- 2 serveurs backend actifs simultanément
- Synchronisation automatique des notes
- Haute disponibilité (failover automatique)
- Communication sécurisée HTTPS entre serveurs

### Vérifier la Réplication

Créer une note → Voir dans les logs :
```
[server1] Note created
[server1] Replicating to peer: https://localhost:3002
[server1] Sync successful

[server2] Received replication from server1
```

### Scripts Disponibles

| Commande | Description |
|----------|-------------|
| `npm start` | Lance 2 serveurs + frontend |
| `npm run server1` | Lance uniquement Server 1 |
| `npm run server2` | Lance uniquement Server 2 |
| `npm test` | Lance les tests backend |
| `./test-security.sh` | Tests de conformité UMLsec (20) |

---

## ACCEPTER LES CERTIFICATS SSL

### Pourquoi des Certificats Auto-Signés ?

Pour tests locaux académiques :
- Approprié : Communication sur localhost
- Conforme UMLsec : Le stéréotype <<**secure links**>> exige un canal chiffré, pas nécessairement un certificat CA
- Chiffrement TLS actif : Les données sont protégées

L'avertissement du navigateur est normal et attendu.

### Procédure Détaillée

#### Chrome / Edge
1. Sur `https://localhost:3001` ou `https://localhost:3002`
2. Cliquez sur "Avancé"
3. Cliquez sur "Continuer vers localhost (non sécurisé)"

Astuce : Tapez `thisisunsafe` sur la page d'erreur (aucun champ visible)

#### Firefox
1. Cliquez sur "Avancé"
2. Cliquez sur "Accepter le risque et continuer"

#### Safari
1. Cliquez sur "Afficher les détails"
2. Cliquez sur "Visiter ce site web"
3. Confirmez

### Note Importante

Vous devez accepter le certificat pour LES 2 SERVEURS (3001 et 3002) pour que la réplication fonctionne.

---

## TESTS DE SÉCURITÉ

### Tests Automatisés

```bash
./test-security.sh
```

Couvre :
1. Sécurité du Canal (HTTPS/TLS) - 4 tests
2. Contrôle d'Accès (JWT + Propriété) - 3 tests
3. Sécurité Stockage (Permissions + Path Traversal) - 5 tests
4. Prévention Fuites (Logs sanitisés) - 4 tests
5. Intégrité & Concurrence (Verrouillage) - 4 tests

Total : 20 tests

### Résultat Attendu

```
Total tests    : 20
Tests réussis  : 20
Tests échoués  : 0
Conformité     : 100%

TOUS LES TESTS SONT PASSÉS !
```

### Tests Manuels

#### Test Connexion
1. Ouvrir `http://localhost:8080`
2. Créer un compte
3. Se connecter
4. Créer une note
5. Tout fonctionne

#### Test Réplication
1. Créer une note
2. Observer les logs :
   - `[server1] Note created`
   - `[server1] Replicating to peer`
   - `[server2] Received replication`
3. Réplication active

---

## DÉPANNAGE

### Port déjà utilisé

```bash
# Port 3001
lsof -ti:3001 | xargs kill -9

# Port 3002
lsof -ti:3002 | xargs kill -9

# Port 8080
lsof -ti:8080 | xargs kill -9

# Relancer
npm start
```

### Certificats non générés

```bash
cd backend/certs
./generate-cert.sh
cd ../..
npm start
```

### Erreur "self-signed certificate"

Dans les logs de réplication :
- Corrigé : Le code accepte maintenant les certificats auto-signés
- Solution : Redémarrer simplement l'application

### Mode HTTP (sans certificats)

Si vous voulez tester sans HTTPS :

```bash
./toggle-https.sh off
npm start
```

Attention : Désactive la conformité <<secure links>> UMLsec

---

## VÉRIFICATIONS

### Checklist de Démarrage

- [ ] Certificats générés (`backend/certs/*.pem`)
- [ ] `npm start` exécuté
- [ ] Server 1 démarré (logs visibles)
- [ ] Server 2 démarré (logs visibles)
- [ ] Frontend démarré (logs visibles)
- [ ] Certificat Server 1 accepté (`https://localhost:3001`)
- [ ] Certificat Server 2 accepté (`https://localhost:3002`)
- [ ] Frontend accessible (`http://localhost:8080`)
- [ ] Connexion/Inscription fonctionne
- [ ] Application opérationnelle

### Checklist de Validation

- [ ] Tests automatisés : `./test-security.sh` → 20/20
- [ ] HTTPS actif : Cadenas dans le navigateur
- [ ] Réplication visible dans les logs
- [ ] Permissions fichiers : 600/700
- [ ] Logs sanitisés : `[REDACTED]`
- [ ] Verrouillage : Test avec 2 onglets
- [ ] Conformité UMLsec complète

---

## NOTES IMPORTANTES

### Contexte Académique

Cette application est pour tests locaux uniquement :
- Certificats auto-signés appropriés
- Pas de déploiement en ligne prévu
- Validation par l'enseignant sur sa machine

### Groupe 6 - Stockage Fichiers

Spécificités :
- Pas de base de données SQL
- Stockage sur système de fichiers
- Protection Path Traversal critique
- Permissions fichiers restrictives

### Conformité UMLsec

100% des exigences respectées :
- Canal sécurisé (HTTPS/TLS)
- Chiffrement (AES-256-GCM)
- Isolation utilisateurs (JWT)
- Intégrité (verrouillage physique)
- Données critiques protégées (permissions)
- Pas de fuites (logs sanitisés)
- Sécurité stockage (multi-couches)

---

## DOCUMENTATION COMPLÉMENTAIRE

Pour plus de détails, consultez :
- AUDIT_SECURITE_UMLSEC.md - Rapport d'audit complet
- ARCHITECTURE_TECHNIQUE.md - Architecture et réplication
- README.md - Vue d'ensemble du projet

---

Guide rédigé pour SecureNotes - Groupe 6
Version : 1.0
Date : 6 janvier 2026
