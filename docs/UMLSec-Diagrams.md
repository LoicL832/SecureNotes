# Diagrammes UMLSec - SecureNotes

## 1. Diagramme de cas d'utilisation UMLSec

```plantuml
@startuml
!define SECRECY <<secrecy>>
!define INTEGRITY <<integrity>>
!define CRITICAL <<critical>>
!define SECURE_LINKS <<secure links>>
!define AUTHENTICATED <<authenticated>>

title Diagramme de cas d'utilisation UMLSec - SecureNotes

left to right direction

actor "Utilisateur\nnon authentifié" as Guest
actor "Utilisateur\nauthentifié" as User AUTHENTICATED
actor "Propriétaire\nde note" as Owner
actor "Utilisateur\ninvité" as Shared

package "Système SecureNotes" SECURE_LINKS {
  
  package "Authentification" CRITICAL {
    usecase "S'inscrire" as UC1
    usecase "Se connecter" as UC2 SECRECY
    usecase "Se déconnecter" as UC3
    usecase "Rafraîchir token" as UC4
  }
  
  package "Gestion des notes" CRITICAL {
    usecase "Créer une note" as UC5 INTEGRITY
    usecase "Lire une note" as UC6 SECRECY
    usecase "Modifier une note" as UC7 INTEGRITY
    usecase "Supprimer une note" as UC8 CRITICAL
    usecase "Chiffrer le contenu" as UC9 SECRECY
    usecase "Déchiffrer le contenu" as UC10 SECRECY
  }
  
  package "Partage et collaboration" CRITICAL {
    usecase "Partager une note" as UC11
    usecase "Définir permissions" as UC12 CRITICAL
    usecase "Révoquer un partage" as UC13 CRITICAL
    usecase "Verrouiller pour écriture" as UC14 CRITICAL
    usecase "Déverrouiller" as UC15
    usecase "Accéder note partagée" as UC16 AUTHENTICATED
  }
  
  package "Réplication" CRITICAL {
    usecase "Synchroniser données" as UC17 INTEGRITY
    usecase "Détecter conflits" as UC18
    usecase "Résoudre conflits" as UC19
  }
  
  package "Audit" {
    usecase "Journaliser actions" as UC20 INTEGRITY
    usecase "Surveiller accès" as UC21
  }
}

' Relations Guest
Guest --> UC1
Guest --> UC2

' Relations User
User --> UC3
User --> UC4
User --> UC5
User --> UC6
User --> UC7
User --> UC8
User --> UC16

' Relations Owner
Owner --> UC11
Owner --> UC12
Owner --> UC13

' Relations Shared
Shared --> UC14
Shared --> UC15
Shared --> UC16

' Inclusions
UC5 ..> UC9 : <<include>>
UC6 ..> UC10 : <<include>>
UC7 ..> UC10 : <<include>>
UC7 ..> UC9 : <<include>>

UC11 ..> UC12 : <<include>>

UC2 ..> UC20 : <<include>>
UC6 ..> UC20 : <<include>>
UC7 ..> UC20 : <<include>>
UC8 ..> UC20 : <<include>>
UC11 ..> UC20 : <<include>>

UC17 ..> UC18 : <<include>>
UC18 ..> UC19 : <<extend>>

note right of UC2
  **Sécurité: <<secrecy>>**
  - Hash bcrypt (12 rounds)
  - Rate limiting (5/15min)
  - JWT avec expiration
end note

note right of UC9
  **Sécurité: <<secrecy>>**
  - AES-256-GCM
  - Clé dérivée (PBKDF2)
  - IV unique par note
end note

note right of UC12
  **Sécurité: <<critical>>**
  - Vérification propriétaire
  - Validation permissions
  - Isolation des données
end note

@enduml
```

---

## 2. Diagramme de composants UMLSec

```plantuml
@startuml
!define ENCRYPTED <<encrypted>>
!define INTEGRITY <<integrity>>
!define SECURE_DEPENDENCY <<secure dependency>>
!define CRITICAL <<critical>>

title Diagramme de composants UMLSec - SecureNotes

package "Frontend (Client)" {
  component [Interface Web] as FE
  component [API Client] as API_CLIENT
  component [Auth Manager] as AUTH_MGR
  component [Notes Manager] as NOTES_MGR
  
  FE --> API_CLIENT
  FE --> AUTH_MGR
  FE --> NOTES_MGR
  AUTH_MGR --> API_CLIENT
  NOTES_MGR --> API_CLIENT
}

package "Serveur 1" CRITICAL {
  component [Express Server] as SERVER1
  
  package "Middlewares Sécurité" CRITICAL {
    component [Auth Middleware] as AUTH_MW1
    component [Rate Limiter] as RATE_LIM1
    component [Input Validator] as VALID1
    component [Injection Detector] as INJ_DET1
  }
  
  package "Services Métier" {
    component [User Service] as USER_SVC1
    component [Note Service] as NOTE_SVC1 ENCRYPTED
    component [Share Service] as SHARE_SVC1 CRITICAL
    component [Replication Service] as REP_SVC1 INTEGRITY
  }
  
  package "Utilitaires Crypto" ENCRYPTED {
    component [Crypto Utils] as CRYPTO1
    component [Security Logger] as LOGGER1 INTEGRITY
  }
  
  package "Stockage Fichiers" ENCRYPTED {
    database "users.json" as USERS1
    database "notes/*.enc" as NOTES1 ENCRYPTED
    database "shares.json" as SHARES1
    database "audit.log" as LOGS1 INTEGRITY
  }
}

package "Serveur 2" CRITICAL {
  component [Express Server] as SERVER2
  
  package "Middlewares Sécurité" CRITICAL {
    component [Auth Middleware] as AUTH_MW2
    component [Rate Limiter] as RATE_LIM2
    component [Input Validator] as VALID2
    component [Injection Detector] as INJ_DET2
  }
  
  package "Services Métier" {
    component [User Service] as USER_SVC2
    component [Note Service] as NOTE_SVC2 ENCRYPTED
    component [Share Service] as SHARE_SVC2 CRITICAL
    component [Replication Service] as REP_SVC2 INTEGRITY
  }
  
  package "Utilitaires Crypto" ENCRYPTED {
    component [Crypto Utils] as CRYPTO2
    component [Security Logger] as LOGGER2 INTEGRITY
  }
  
  package "Stockage Fichiers" ENCRYPTED {
    database "users.json" as USERS2
    database "notes/*.enc" as NOTES2 ENCRYPTED
    database "shares.json" as SHARES2
    database "audit.log" as LOGS2 INTEGRITY
  }
}

' Relations Frontend -> Serveur 1
API_CLIENT --> SERVER1 : HTTPS + JWT\nSECURE_DEPENDENCY

' Relations internes Serveur 1
SERVER1 --> AUTH_MW1
SERVER1 --> RATE_LIM1
SERVER1 --> VALID1
SERVER1 --> INJ_DET1

AUTH_MW1 --> USER_SVC1
SERVER1 --> NOTE_SVC1
SERVER1 --> SHARE_SVC1

USER_SVC1 --> CRYPTO1 : bcrypt\nSECURE_DEPENDENCY
NOTE_SVC1 --> CRYPTO1 : AES-256-GCM\nSECURE_DEPENDENCY
SHARE_SVC1 --> NOTE_SVC1

USER_SVC1 --> LOGGER1
NOTE_SVC1 --> LOGGER1
SHARE_SVC1 --> LOGGER1

USER_SVC1 --> USERS1
NOTE_SVC1 --> NOTES1
SHARE_SVC1 --> SHARES1
LOGGER1 --> LOGS1

' Réplication
REP_SVC1 <--> REP_SVC2 : Sync\nINTEGRITY\nSECURE_DEPENDENCY
REP_SVC1 --> USERS1
REP_SVC1 --> NOTES1
REP_SVC1 --> SHARES1

REP_SVC2 --> USERS2
REP_SVC2 --> NOTES2
REP_SVC2 --> SHARES2

' Relations internes Serveur 2 (similaires)
SERVER2 --> AUTH_MW2
SERVER2 --> RATE_LIM2
SERVER2 --> VALID2
SERVER2 --> INJ_DET2

AUTH_MW2 --> USER_SVC2
SERVER2 --> NOTE_SVC2
SERVER2 --> SHARE_SVC2

USER_SVC2 --> CRYPTO2
NOTE_SVC2 --> CRYPTO2
SHARE_SVC2 --> NOTE_SVC2

USER_SVC2 --> LOGGER2
NOTE_SVC2 --> LOGGER2
SHARE_SVC2 --> LOGGER2

USER_SVC2 --> USERS2
NOTE_SVC2 --> NOTES2
SHARE_SVC2 --> SHARES2
LOGGER2 --> LOGS2

note right of CRYPTO1
  **<<encrypted>>**
  - AES-256-GCM
  - PBKDF2 (100k iter)
  - HMAC-SHA256
  - bcrypt (12 rounds)
end note

note right of NOTES1
  **<<encrypted>>**
  Fichiers chiffrés avec:
  - Chiffrement au repos
  - IV unique par note
  - Tag d'authentification
end note

note right of REP_SVC1
  **<<integrity>>**
  - Détection conflits
  - Timestamp-based merge
  - Authentification inter-serveurs
end note

note bottom of AUTH_MW1
  **<<critical>>**
  - Vérification JWT
  - Validation token
  - Extraction user context
end note

@enduml
```

---

## 3. Diagramme de déploiement UMLSec

```plantuml
@startuml
!define SECURE_COMM <<secure communication>>
!define ENCRYPTED_STORAGE <<encrypted storage>>
!define FIREWALL <<firewall>>
!define CRITICAL <<critical>>

title Diagramme de déploiement UMLSec - SecureNotes

node "Client (Navigateur)" {
  component [Application Web] as WebApp
  note right of WebApp
    - HTML/CSS/JavaScript
    - LocalStorage (tokens)
    - CSP headers
  end note
}

cloud "Internet" SECURE_COMM {
  node "Load Balancer" FIREWALL {
    component [LB] as LB
    note right of LB
      - Distribution charge
      - Health checks
      - SSL termination
    end note
  }
}

node "Serveur 1" CRITICAL {
  node "Runtime Node.js" {
    artifact "server.js" as App1
    artifact "Express" as Express1
    
    component [API REST] as API1
    component [Middlewares\nSécurité] as MW1 CRITICAL
    component [Services] as SVC1
    component [Réplication] as REP1
  }
  
  node "Système de fichiers" ENCRYPTED_STORAGE {
    folder "data/" as Data1 {
      file "users.json"
      folder "notes/"
      file "shares.json"
      folder "logs/"
    }
  }
  
  App1 --> Express1
  Express1 --> API1
  API1 --> MW1
  MW1 --> SVC1
  SVC1 --> Data1
  REP1 --> Data1
}

node "Serveur 2" CRITICAL {
  node "Runtime Node.js" {
    artifact "server.js" as App2
    artifact "Express" as Express2
    
    component [API REST] as API2
    component [Middlewares\nSécurité] as MW2 CRITICAL
    component [Services] as SVC2
    component [Réplication] as REP2
  }
  
  node "Système de fichiers" ENCRYPTED_STORAGE {
    folder "data/" as Data2 {
      file "users.json"
      folder "notes/"
      file "shares.json"
      folder "logs/"
    }
  }
  
  App2 --> Express2
  Express2 --> API2
  API2 --> MW2
  MW2 --> SVC2
  SVC2 --> Data2
  REP2 --> Data2
}

' Communications
WebApp --> LB : HTTPS (TLS 1.3)\nSECURE_COMM
LB --> API1 : HTTP/HTTPS\nSECURE_COMM
LB --> API2 : HTTP/HTTPS\nSECURE_COMM

REP1 <--> REP2 : Sync HTTP\n+ Internal Auth\nSECURE_COMM

note right of WebApp
  **Protocoles:**
  - HTTPS obligatoire
  - JWT Bearer tokens
  - CORS configuré
  
  **Headers sécurité:**
  - CSP
  - X-Content-Type-Options
  - X-Frame-Options
end note

note bottom of Data1
  **<<encrypted storage>>**
  - Fichiers notes chiffrés (AES-256-GCM)
  - Permissions filesystem restreintes
  - Logs immuables (append-only)
  - Backup régulier recommandé
end note

note bottom of MW1
  **Middlewares sécurité:**
  - Helmet (headers HTTP)
  - Rate limiting (DDoS)
  - Input validation
  - Injection detection
  - Path traversal protection
  - Request size limits
end note

note right of REP1
  **Réplication:**
  - Active-active
  - Sync toutes les 30s
  - Authentification interne
  - Résolution conflits timestamp
end note

note bottom of LB
  **<<firewall>>**
  - Filtrage IP (optionnel)
  - Rate limiting global
  - DDoS protection
  - Health monitoring
end note

@enduml
```

---

## 4. Diagramme de séquence - Authentification sécurisée

```plantuml
@startuml
title Séquence d'authentification sécurisée (UMLSec)

actor Utilisateur as U
participant "Frontend" as FE
participant "Rate Limiter" as RL
participant "Auth Middleware" as AM
participant "User Service" as US
participant "Crypto Utils" as CU
participant "Security Logger" as SL
database "users.json" as DB

U -> FE: Login (username, password)
activate FE

FE -> RL: POST /api/auth/login
activate RL
RL -> RL: Vérifier limite (5/15min)
alt Limite dépassée
  RL --> FE: 429 Too Many Requests
  FE --> U: Erreur: trop de tentatives
else OK
  RL -> US: login(username, password, ip)
  activate US
  
  US -> DB: Charger utilisateurs
  activate DB
  DB --> US: users[]
  deactivate DB
  
  US -> US: Trouver utilisateur
  alt Utilisateur non trouvé
    US -> SL: Log AUTH_FAILED
    activate SL
    SL -> SL: Écrire audit.log
    deactivate SL
    US --> RL: Erreur: credentials invalides
    RL --> FE: 401 Unauthorized
    FE --> U: Erreur de connexion
  else Utilisateur trouvé
    US -> US: Vérifier si compte verrouillé
    alt Compte verrouillé
      US -> SL: Log LOCKED_ACCOUNT_ATTEMPT
      US --> RL: Erreur: compte verrouillé
      RL --> FE: 401 Unauthorized
      FE --> U: Compte verrouillé
    else Compte OK
      US -> CU: bcrypt.compare(password, hash)
      activate CU
      CU --> US: Résultat validation
      deactivate CU
      
      alt Mot de passe invalide
        US -> US: Incrémenter tentatives
        alt Tentatives >= 5
          US -> US: Verrouiller compte
          US -> SL: Log ACCOUNT_LOCKED
        end
        US -> DB: Sauvegarder état
        US -> SL: Log LOGIN_FAILED
        US --> RL: Erreur: credentials invalides
        RL --> FE: 401 Unauthorized
        FE --> U: Erreur de connexion
      else Mot de passe valide
        US -> US: Réinitialiser tentatives
        US -> US: generateAccessToken(user)
        US -> US: generateRefreshToken(user)
        US -> DB: Mettre à jour lastLogin
        US -> SL: Log LOGIN_SUCCESS
        activate SL
        SL -> SL: Écrire audit.log
        deactivate SL
        US --> RL: {user, accessToken, refreshToken}
        RL --> FE: 200 OK + tokens
        deactivate US
        FE -> FE: Stocker tokens (localStorage)
        FE --> U: Connexion réussie
        deactivate FE
      end
    end
  end
end
deactivate RL

note over CU
  **Sécurité bcrypt:**
  - Salt unique par user
  - 12 rounds (2^12 iterations)
  - Protection timing attacks
end note

note over US
  **Protection brute force:**
  - Max 5 tentatives
  - Verrouillage 15 minutes
  - Logs de sécurité
end note

@enduml
```

---

## 5. Diagramme de séquence - Création de note chiffrée

```plantuml
@startuml
title Séquence de création de note chiffrée (UMLSec)

actor Utilisateur as U
participant "Frontend" as FE
participant "Auth Middleware" as AM
participant "Input Validator" as IV
participant "Note Service" as NS
participant "Crypto Utils" as CU
participant "Security Logger" as SL
database "Filesystem" as FS

U -> FE: Créer note (titre, contenu)
activate FE

FE -> AM: POST /api/notes\nBearer JWT
activate AM
AM -> AM: Vérifier token JWT
alt Token invalide/expiré
  AM -> SL: Log INVALID_TOKEN
  AM --> FE: 401 Unauthorized
  FE --> U: Session expirée
else Token valide
  AM -> AM: Extraire user context
  AM -> IV: Valider entrées
  activate IV
  
  IV -> IV: validateNoteTitle(title)
  IV -> IV: validateNoteContent(content)
  IV -> IV: detectInjection(inputs)
  
  alt Validation échouée
    IV --> AM: Erreur validation
    AM --> FE: 400 Bad Request
    FE --> U: Erreur: données invalides
  else Validation OK
    IV -> NS: createNote(userId, title, content, userKey)
    activate NS
    
    NS -> NS: Générer noteId (UUID)
    NS -> NS: Créer répertoire utilisateur
    
    NS -> CU: encrypt(content, userKey)
    activate CU
    
    CU -> CU: Générer salt (64 bytes)
    CU -> CU: Dériver clé (PBKDF2, 100k iter)
    CU -> CU: Générer IV (16 bytes)
    CU -> CU: AES-256-GCM encrypt
    CU -> CU: Récupérer auth tag
    
    CU --> NS: {encrypted, iv, tag, salt}
    deactivate CU
    
    NS -> FS: Écrire noteId.enc
    activate FS
    FS --> NS: OK
    deactivate FS
    
    NS -> NS: Créer métadonnées\n{id, title, owner, timestamps}
    NS -> FS: Écrire metadata.json
    activate FS
    FS --> NS: OK
    deactivate FS
    
    NS -> SL: Log NOTE_CREATED
    activate SL
    SL -> SL: Journaliser action
    deactivate SL
    
    NS --> IV: noteMetadata
    deactivate NS
    IV --> AM: Success
    deactivate IV
    AM --> FE: 201 Created + noteMetadata
    deactivate AM
    FE --> U: Note créée
    deactivate FE
  end
end

note over CU
  **Chiffrement AES-256-GCM:**
  - Confidentialité (chiffrement)
  - Intégrité (auth tag)
  - Salt unique par opération
  - IV unique par note
  - Clé dérivée de userKey
end note

note over IV
  **Validation stricte:**
  - Titre: 1-200 caractères
  - Contenu: max 1 MB
  - Détection injection (XSS, etc.)
  - Sanitization
end note

note over FS
  **Stockage sécurisé:**
  - Fichiers .enc chiffrés
  - Permissions restrictives
  - Isolation par utilisateur
  - Pas de données en clair
end note

@enduml
```

---

## Annotations de sécurité utilisées

### Stéréotypes UMLSec appliqués :

1. <<**secrecy**>> : Garantit la confidentialité
   - Connexion (credentials)
   - Chiffrement/déchiffrement des notes
   - Stockage des mots de passe

2. <<**integrity**>> : Garantit l'intégrité
   - Création/modification de notes
   - Logs d'audit
   - Réplication des données

3. <<**critical**>> : Ressources critiques nécessitant protection maximale
   - Système d'authentification
   - Gestion des permissions
   - Verrouillage de notes
   - Serveurs et composants sensibles

4. <<**secure links**>> : Communications sécurisées
   - HTTPS entre client et serveur
   - Authentification inter-serveurs

5. <<**secure dependency**>> : Dépendances sécurisées entre composants
   - Utilisation de JWT
   - Appels aux utilitaires crypto
   - Réplication authentifiée

6. <<**encrypted**>> : Données chiffrées
   - Stockage des notes
   - Service de chiffrement
   - Fichiers .enc

7. <<**authenticated**>> : Accès nécessitant authentification
   - Utilisateur connecté
   - Routes protégées

8. <<**firewall**>> : Protection périmétrique
   - Load balancer
   - Filtrage réseau

9. <<**encrypted storage**>> : Stockage chiffré
   - Système de fichiers
   - Notes sur disque

## Propriétés de sécurité garanties

- **Confidentialité** : AES-256-GCM, HTTPS, JWT
- **Intégrité** : HMAC, auth tags, logs immuables
- **Authentification** : bcrypt, JWT, rate limiting
- **Autorisation** : RBAC, vérification permissions
- **Non-répudiation** : Logs d'audit horodatés
- **Disponibilité** : Réplication active-active
