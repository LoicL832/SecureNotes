const selfsigned = require('selfsigned');
const fs = require('fs');
const path = require('path');

(async () => {
    console.log('🔐 Génération des certificats SSL auto-signés...');

    // Chemin des certificats
    const keyPath = path.join(__dirname, 'private-key.pem');
    const certPath = path.join(__dirname, 'certificate.pem');

    // Attributs du certificat (format simplifié)
    const attrs = [
        { shortName: 'CN', value: 'localhost' },
        { shortName: 'C', value: 'FR' },
        { shortName: 'ST', value: 'IDF' },
        { shortName: 'L', value: 'Paris' },
        { shortName: 'O', value: 'SecureNotes' },
        { shortName: 'OU', value: 'Tests-Locaux' }
    ];

    // Options du certificat
    const options = {
        keySize: 2048,
        days: 365,
        algorithm: 'sha256',
        extensions: [
            {
                name: 'basicConstraints',
                cA: true
            },
            {
                name: 'keyUsage',
                keyCertSign: true,
                digitalSignature: true,
                nonRepudiation: true,
                keyEncipherment: true,
                dataEncipherment: true
            },
            {
                name: 'extKeyUsage',
                serverAuth: true,
                clientAuth: true
            },
            {
                name: 'subjectAltName',
                altNames: [
                    {
                        type: 2, // DNS
                        value: 'localhost'
                    },
                    {
                        type: 7, // IP
                        ip: '127.0.0.1'
                    }
                ]
            }
        ]
    };

    try {
        // Génération du certificat auto-signé (asynchrone)
        const pems = await selfsigned.generate(attrs, options);

        // Sauvegarde des fichiers
        if (pems.private && pems.cert) {
            fs.writeFileSync(keyPath, pems.private);
            fs.writeFileSync(certPath, pems.cert);

            console.log('\n✅ Certificats SSL générés avec succès !');
            console.log(`   - Clé privée : ${keyPath}`);
            console.log(`   - Certificat : ${certPath}`);
            console.log('\n⚠️  ATTENTION : Ces certificats sont auto-signés.');
            console.log('   Le navigateur affichera un avertissement de sécurité.');
            console.log("   Pour accepter : Cliquez sur 'Avancé' puis 'Continuer vers localhost'");
            console.log('\n✅ Prêt pour les tests locaux avec HTTPS et validation UMLsec !');
        } else {
            console.error('❌ Erreur: Les certificats n\'ont pas été générés correctement');
        }
    } catch (error) {
        console.error('❌ Erreur lors de la génération:', error.message);
    }
})();
console.log('\n⚠️  ATTENTION : Ces certificats sont auto-signés.');
console.log('   Le navigateur affichera un avertissement de sécurité.');
console.log("   Pour accepter : Cliquez sur 'Avancé' puis 'Continuer vers localhost'");
console.log('\n✅ Prêt pour les tests locaux avec HTTPS et validation UMLsec !');
