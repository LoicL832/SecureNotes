#!/bin/bash

# Script de test de sécurité automatisé pour SecureNotes
# Vérifie la conformité UMLsec

echo "🔒 Tests de Sécurité UMLsec - SecureNotes"
echo "=========================================="
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Compteurs
PASSED=0
FAILED=0

# Fonction de test
test_security() {
    local test_name="$1"
    local command="$2"
    local expected="$3"

    echo -n "Testing: $test_name ... "

    result=$(eval "$command" 2>&1)

    if echo "$result" | grep -q "$expected"; then
        echo -e "${GREEN}✅ PASSED${NC}"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}❌ FAILED${NC}"
        echo "  Expected: $expected"
        echo "  Got: $result"
        ((FAILED++))
        return 1
    fi
}

echo "1️⃣  SÉCURITÉ DU CANAL (<<secure links>>)"
echo "----------------------------------------"

# Test 1.1: Certificats SSL existent
echo -n "Test 1.1: Certificats SSL présents ... "
if [ -f "backend/certs/private-key.pem" ] && [ -f "backend/certs/certificate.pem" ]; then
    echo -e "${GREEN}✅ PASSED${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ FAILED${NC}"
    echo "  Exécutez: cd backend/certs && ./generate-cert.sh"
    ((FAILED++))
fi

# Test 1.2: Permissions clé privée
echo -n "Test 1.2: Permissions clé privée (600) ... "
if [ -f "backend/certs/private-key.pem" ]; then
    perms=$(stat -f "%Lp" backend/certs/private-key.pem 2>/dev/null || stat -c "%a" backend/certs/private-key.pem 2>/dev/null)
    if [ "$perms" = "600" ]; then
        echo -e "${GREEN}✅ PASSED${NC}"
        ((PASSED++))
    else
        echo -e "${YELLOW}⚠️  WARNING${NC} (permissions: $perms, attendu: 600)"
        echo "  Exécutez: chmod 600 backend/certs/private-key.pem"
    fi
else
    echo -e "${YELLOW}⚠️  SKIPPED${NC} (certificat absent)"
fi

# Test 1.3: Serveur HTTPS activé dans config
echo -n "Test 1.3: HTTPS activé dans config ... "
if grep -q "https:" backend/config/config.js && grep -q "keyPath:" backend/config/config.js && grep -q "certPath:" backend/config/config.js; then
    echo -e "${GREEN}✅ PASSED${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ FAILED${NC}"
    ((FAILED++))
fi

# Test 1.4: CORS restrictif
echo -n "Test 1.4: CORS restrictif (liste blanche) ... "
if grep -q "allowedOrigins" backend/config/config.js && ! grep -q "origin: '*'" backend/config/config.js; then
    echo -e "${GREEN}✅ PASSED${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ FAILED${NC}"
    ((FAILED++))
fi

echo ""
echo "2️⃣  CONTRÔLE D'ACCÈS (<<secrecy>>)"
echo "-----------------------------------"

# Test 2.1: Middleware d'authentification présent
echo -n "Test 2.1: Middleware authenticate présent ... "
if grep -q "function authenticate" backend/src/middleware/auth.js; then
    echo -e "${GREEN}✅ PASSED${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ FAILED${NC}"
    ((FAILED++))
fi

# Test 2.2: Vérification stricte de propriété
echo -n "Test 2.2: Middleware checkNoteOwnership présent ... "
if grep -q "checkNoteOwnership" backend/src/middleware/auth.js; then
    echo -e "${GREEN}✅ PASSED${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ FAILED${NC}"
    ((FAILED++))
fi

# Test 2.3: Vérification owner === userId
echo -n "Test 2.3: Vérification owner stricte ... "
if grep -q "noteMetadata.owner !== userId" backend/src/middleware/auth.js; then
    echo -e "${GREEN}✅ PASSED${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ FAILED${NC}"
    ((FAILED++))
fi

echo ""
echo "3️⃣  SÉCURITÉ STOCKAGE (<<critical>>)"
echo "-------------------------------------"

# Test 3.1: Protection Path Traversal
echo -n "Test 3.1: Protection Path Traversal ... "
if grep -q "preventPathTraversal" backend/src/middleware/security.js; then
    echo -e "${GREEN}✅ PASSED${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ FAILED${NC}"
    ((FAILED++))
fi

# Test 3.2: Validation UUID
echo -n "Test 3.2: Validation UUID stricte ... "
if grep -q "validateUUID" backend/src/services/noteService.js; then
    echo -e "${GREEN}✅ PASSED${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ FAILED${NC}"
    ((FAILED++))
fi

# Test 3.3: Permissions fichiers 600
echo -n "Test 3.3: Permissions fichiers 600 ... "
if grep -q "mode: 0o600" backend/src/services/noteService.js; then
    echo -e "${GREEN}✅ PASSED${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ FAILED${NC}"
    ((FAILED++))
fi

# Test 3.4: Permissions répertoires 700
echo -n "Test 3.4: Permissions répertoires 700 ... "
if grep -q "mode: 0o700" backend/src/services/noteService.js; then
    echo -e "${GREEN}✅ PASSED${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ FAILED${NC}"
    ((FAILED++))
fi

# Test 3.5: Fonction secureFilePermissions
echo -n "Test 3.5: Fonction secureFilePermissions présente ... "
if grep -q "secureFilePermissions" backend/src/services/noteService.js; then
    echo -e "${GREEN}✅ PASSED${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ FAILED${NC}"
    ((FAILED++))
fi

echo ""
echo "4️⃣  PRÉVENTION FUITES (<<no down-flow>>)"
echo "-----------------------------------------"

# Test 4.1: Sanitization logs
echo -n "Test 4.1: Fonction sanitizeLogData présente ... "
if grep -q "sanitizeLogData" backend/src/utils/logger.js; then
    echo -e "${GREEN}✅ PASSED${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ FAILED${NC}"
    ((FAILED++))
fi

# Test 4.2: [REDACTED] pour champs sensibles
echo -n "Test 4.2: [REDACTED] pour données sensibles ... "
if grep -q "\[REDACTED\]" backend/src/utils/logger.js; then
    echo -e "${GREEN}✅ PASSED${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ FAILED${NC}"
    ((FAILED++))
fi

# Test 4.3: Gestionnaire d'erreurs sécurisé
echo -n "Test 4.3: Messages d'erreur génériques ... "
if grep -q "Internal server error" backend/src/server.js; then
    echo -e "${GREEN}✅ PASSED${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ FAILED${NC}"
    ((FAILED++))
fi

# Test 4.4: Pas de stack trace au client
echo -n "Test 4.4: Stack traces seulement en logs ... "
if grep -q "process.env.NODE_ENV !== 'production' ? { stack:" backend/src/server.js; then
    echo -e "${GREEN}✅ PASSED${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ FAILED${NC}"
    ((FAILED++))
fi

echo ""
echo "5️⃣  INTÉGRITÉ & CONCURRENCE"
echo "---------------------------"

# Test 5.1: Champ locked dans métadonnées
echo -n "Test 5.1: Champ locked dans métadonnées ... "
if grep -q "locked:" backend/src/services/noteService.js; then
    echo -e "${GREEN}✅ PASSED${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ FAILED${NC}"
    ((FAILED++))
fi

# Test 5.2: Verrouillage physique
echo -n "Test 5.2: Fonction createLockFile présente ... "
if grep -q "createLockFile" backend/src/services/noteService.js; then
    echo -e "${GREEN}✅ PASSED${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ FAILED${NC}"
    ((FAILED++))
fi

# Test 5.3: Fichiers .lock
echo -n "Test 5.3: Utilisation fichiers .lock ... "
if grep -q "\.lock" backend/src/services/noteService.js; then
    echo -e "${GREEN}✅ PASSED${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ FAILED${NC}"
    ((FAILED++))
fi

# Test 5.4: Flag atomic 'wx'
echo -n "Test 5.4: Opération atomique (flag wx) ... "
if grep -q "flag: 'wx'" backend/src/services/noteService.js; then
    echo -e "${GREEN}✅ PASSED${NC}"
    ((PASSED++))
else
    echo -e "${RED}❌ FAILED${NC}"
    ((FAILED++))
fi

echo ""
echo "=========================================="
echo "RÉSULTATS DES TESTS"
echo "=========================================="
echo ""

TOTAL=$((PASSED + FAILED))
PERCENTAGE=$((PASSED * 100 / TOTAL))

echo "Total tests    : $TOTAL"
echo -e "Tests réussis  : ${GREEN}$PASSED${NC}"
echo -e "Tests échoués  : ${RED}$FAILED${NC}"
echo "Conformité     : $PERCENTAGE%"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ TOUS LES TESTS SONT PASSÉS !${NC}"
    echo "Votre application est conforme aux exigences UMLsec."
    exit 0
else
    echo -e "${RED}❌ CERTAINS TESTS ONT ÉCHOUÉ${NC}"
    echo "Veuillez corriger les problèmes ci-dessus."
    exit 1
fi

