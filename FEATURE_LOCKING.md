# Fonctionnalité de Verrouillage des Notes Partagées

## Description

Cette fonctionnalité empêche les modifications concurrentes sur les notes partagées. Lorsqu'un utilisateur commence à éditer une note partagée, celle-ci est automatiquement verrouillée et les autres utilisateurs ne peuvent plus la modifier jusqu'à ce que le verrou soit libéré.

## Caractéristiques

### 1. Verrouillage Automatique
- Lorsqu'un utilisateur tente de modifier une note, le système vérifie si elle est déjà verrouillée
- Si la note est verrouillée par un autre utilisateur, la modification est refusée avec le code HTTP 423 (Locked)
- Le message d'erreur indique qui a verrouillé la note et quand

### 2. Verrouillage Manuel (Optionnel)
Les utilisateurs peuvent également verrouiller/déverrouiller manuellement une note avant de l'éditer :

```javascript
// Verrouiller une note
POST /api/notes/:id/lock

// Déverrouiller une note
POST /api/notes/:id/unlock
```

### 3. Expiration Automatique
- Les verrous expirent automatiquement après 5 minutes d'inactivité
- Cela évite qu'une note reste bloquée indéfiniment si un utilisateur ferme son navigateur sans déverrouiller

### 4. Double Mécanisme de Sécurité
- **Fichier de verrouillage physique** : `.lock` dans le répertoire de l'utilisateur
- **Métadonnées** : Informations de verrouillage dans `metadata.json`

## Utilisation

### Scénario 1 : Tentative de modification d'une note verrouillée

```javascript
// Alice verrouille et édite une note partagée
PUT /api/notes/:id
{
  "title": "Ma note",
  "content": "Nouveau contenu"
}
// ✅ Succès - La note est mise à jour

// Bob tente de modifier la même note en même temps
PUT /api/notes/:id
{
  "title": "Ma note",
  "content": "Autre contenu"
}
// ❌ Erreur 423 (Locked)
// {
//   "error": "Note is currently being edited by another user",
//   "lockedBy": "alice-user-id",
//   "lockedAt": "2026-01-12T17:30:00.000Z"
// }
```

### Scénario 2 : Verrouillage manuel

```javascript
// Alice verrouille explicitement la note avant de commencer l'édition
POST /api/notes/:id/lock
// ✅ { "success": true, "message": "Note locked for editing", "lockedBy": "alice-user-id" }

// Alice modifie la note
PUT /api/notes/:id
{ "content": "..." }
// ✅ Succès

// Alice déverrouille la note une fois terminée
POST /api/notes/:id/unlock
// ✅ { "success": true, "message": "Note unlocked" }
```

## Comportement Technique

### Codes de Statut HTTP

- **200 OK** : Opération réussie (lecture, mise à jour sans conflit)
- **201 Created** : Note créée
- **423 Locked** : Note verrouillée par un autre utilisateur
- **400 Bad Request** : Erreur de validation
- **404 Not Found** : Note introuvable

### Fichiers de Verrouillage

Structure d'un fichier `.lock` :
```json
{
  "noteId": "uuid-de-la-note",
  "lockedBy": "user-id-de-l-editeur",
  "lockedAt": "2026-01-12T17:30:00.000Z",
  "pid": 12345
}
```

### Métadonnées de Note

Les métadonnées incluent maintenant :
```json
{
  "id": "note-id",
  "title": "Titre",
  "createdAt": "2026-01-12T17:00:00.000Z",
  "updatedAt": "2026-01-12T17:30:00.000Z",
  "locked": true,
  "lockedBy": "user-id",
  "lockedAt": "2026-01-12T17:30:00.000Z"
}
```

## Logs de Sécurité

Toutes les opérations de verrouillage sont enregistrées :

```
[INFO] Note locked for editing { ownerId: '...', noteId: '...', editorId: '...' }
[INFO] Note unlocked { ownerId: '...', noteId: '...', editorId: '...' }
[WARN] Lock file expired, removing { userId: '...', noteId: '...', lockAge: 300000 }
```

## Avantages de Sécurité (UMLsec)

1. **Intégrité des Données** : Empêche les conflits d'écriture concurrente
2. **Traçabilité** : Logs détaillés de qui verrouille quoi et quand
3. **Disponibilité** : Expiration automatique pour éviter le blocage permanent
4. **Isolation** : Chaque note partagée peut être éditée par un seul utilisateur à la fois

## Limitations

- Le verrouillage est au niveau du serveur uniquement (pas de coordination entre serveurs répliqués)
- Un utilisateur malveillant pourrait forcer le déverrouillage en attendant l'expiration (5 minutes)
- Le verrouillage ne protège pas contre les modifications via manipulation directe des fichiers

## Tests

Pour tester la fonctionnalité :

1. Créez deux utilisateurs (Alice et Bob)
2. Alice crée une note et la partage avec Bob (permission 'write')
3. Alice verrouille la note : `POST /api/notes/:id/lock`
4. Bob tente de modifier : `PUT /api/notes/:id` → Erreur 423
5. Alice déverrouille : `POST /api/notes/:id/unlock`
6. Bob peut maintenant modifier la note
