// Instances globales
let api;
let authManager;
let notesManager;

// Application principale
class App {
    constructor() {
        console.log('App constructor called');
        this.init();
    }

    async init() {
        console.log('App initializing...');
        
        // Initialise les managers
        api = new APIClient();
        authManager = new AuthManager();
        notesManager = new NotesManager();
        
        // Expose globalement pour permettre l'accès depuis d'autres modules
        window.api = api;
        window.authManager = authManager;
        window.notesManager = notesManager;
        
        console.log('Managers initialized:', { api, authManager, notesManager });
        
        // Vérifie l'authentification au démarrage
        await authManager.checkAuth();
    }
}

// Fonction utilitaire pour afficher des notifications
function showNotification(message, type = 'info') {
    const container = document.getElementById('notification-container');
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    container.appendChild(notification);
    
    // Retire la notification après 4 secondes
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 4000);
}

// Animation de sortie pour les notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialise l'application au chargement du DOM
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded - Starting app...');
    new App();
});

// Gestion des erreurs globales
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    showNotification('Une erreur inattendue s\'est produite', 'error');
});
