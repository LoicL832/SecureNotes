// Application principale pour la page des notes
let api;
let notesManager;
let currentUser;

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

// Vérifie l'authentification avant de charger la page
async function checkAuth() {
    const token = localStorage.getItem('token');

    if (!token) {
        // Pas de token, redirige vers login
        window.location.href = 'login.html';
        return false;
    }

    try {
        // Initialise l'API avec le token
        api = new APIClient();
        api.setToken(token);
        window.api = api;

        // Vérifie que le token est valide
        const response = await api.verifyToken();

        if (response.valid) {
            currentUser = response.user;
            return true;
        } else {
            // Token invalide, redirige vers login
            localStorage.clear();
            window.location.href = 'login.html';
            return false;
        }
    } catch (error) {
        console.error('Erreur de vérification:', error);
        // Erreur, redirige vers login
        localStorage.clear();
        window.location.href = 'login.html';
        return false;
    }
}

// Initialise l'application
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Notes page loading...');

    // Vérifie l'authentification
    const isAuth = await checkAuth();

    if (!isAuth) {
        // Déjà redirigé
        return;
    }

    console.log('User authenticated:', currentUser.username);

    // Affiche le nom d'utilisateur
    document.getElementById('username-display').textContent = currentUser.username;

    // Initialise le gestionnaire de notes
    notesManager = new NotesManager();
    window.notesManager = notesManager;

    // Gestion du bouton de déconnexion
    document.getElementById('logout-btn').addEventListener('click', () => {
        // Nettoie les tokens
        api.setToken(null);
        localStorage.clear();

        showNotification('Déconnexion réussie', 'info');

        // Redirige vers la page de login
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 500);
    });

    console.log('Notes app initialized successfully');
});

// Gestion des erreurs globales
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);

    // Si c'est une erreur d'authentification, redirige vers login
    if (event.reason && event.reason.message &&
        (event.reason.message.includes('authentification') ||
         event.reason.message.includes('token') ||
         event.reason.message.includes('401'))) {
        localStorage.clear();
        window.location.href = 'login.html';
    } else {
        showNotification('Une erreur inattendue s\'est produite', 'error');
    }
});

