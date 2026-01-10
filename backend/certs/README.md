# Certificats SSL/TLS - Tests Locaux

Ce répertoire contient les certificats SSL pour activer HTTPS et respecter les exigences UMLsec (<<secure links>>).

## 🔐 Génération des Certificats (Tests Locaux)

Pour générer des certificats auto-signés :

```bash
cd backend/certs
./generate-cert.sh
```

Cela créera :
- `private-key.pem` : Clé privée (permissions 600)
- `certificate.pem` : Certificat public auto-signé (valide 365 jours)

## ⚠️ Avertissement Navigateur

Les certificats auto-signés déclencheront un avertissement de sécurité dans le navigateur.

**Pour accepter le certificat :**
1. Accédez à `https://localhost:3001`
2. Cliquez sur "Avancé" ou "Advanced"
3. Cliquez sur "Continuer vers localhost (non sécurisé)" / "Proceed to localhost (unsafe)"

**C'est normal et attendu pour des tests locaux !**

## 🎓 Contexte Académique

Cette application est développée pour un projet universitaire et sera testée **uniquement en local** par l'enseignant.

Les certificats auto-signés sont **suffisants et appropriés** pour :
- ✅ Validation de la conformité UMLsec
- ✅ Démonstration du stéréotype <<secure links>>
- ✅ Tests fonctionnels en local
- ✅ Évaluation académique

## 🔧 Désactiver HTTPS (Si Nécessaire)

Si l'enseignant préfère tester en HTTP :
```bash
export HTTPS_ENABLED=false
npm start
```

## 📝 Notes de Sécurité

- **Clé privée** : Ne JAMAIS commit la clé privée dans Git (protégé par .gitignore)
- **Permissions** : La clé privée doit avoir des permissions 600 (lecture/écriture propriétaire uniquement)
- **Validité** : Certificats valides 365 jours

## 🎯 Conformité UMLsec

Ces certificats satisfont le stéréotype **<<secure links>>** qui exige :
- ✅ Communication chiffrée (TLS)
- ✅ Confidentialité des données en transit
- ✅ Protection contre man-in-the-middle

**Pour des tests locaux académiques, les certificats auto-signés sont la solution recommandée.**

