/**
 * Script d'initialisation du projet SecureNotes
 * Crée les répertoires et fichiers nécessaires au démarrage
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Initialisation de SecureNotes...\n');

// Dossiers à créer
const directories = [
  'data',
  'data/users',
  'data/notes',
  'data/shares',
  'data/logs'
];

// Fichiers à créer avec contenu initial
const files = {
  'data/users/users.json': '[]',
  'data/shares/shares.json': '[]',
  'data/logs/audit.log': ''
};

// Création des répertoires
directories.forEach(dir => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ Dossier créé: ${dir}`);
  } else {
    console.log(`ℹ️  Dossier existant: ${dir}`);
  }
});

// Création des fichiers
Object.entries(files).forEach(([file, content]) => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fichier créé: ${file}`);
  } else {
    console.log(`ℹ️  Fichier existant: ${file}`);
  }
});

console.log('\n✨ Initialisation terminée !');
console.log('\n📝 Prochaines étapes:');
console.log('   1. npm install');
console.log('   2. npm run server1');
console.log('   3. Ouvrir http://localhost:3001\n');
