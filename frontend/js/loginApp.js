// Gestion de l'authentification sur la page de login
let api;

document.addEventListener('DOMContentLoaded', () => {
    // Initialise l'API
    api = new APIClient();
    window.api = api;

    // Debug: affiche l'URL de l'API
    console.log('🔧 API Base URL:', typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : 'NOT DEFINED');
    console.log('🔧 Frontend URL:', window.location.origin);

    // Récupération des éléments
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const authMessage = document.getElementById('auth-message');

    // Fonction pour afficher/cacher les messages
    function showMessage(message, type) {
        authMessage.textContent = message;
        authMessage.className = `message ${type}`;
        authMessage.style.display = 'block';
    }

    function hideMessage() {
        authMessage.style.display = 'none';
    }

    // Switch entre login et register
    document.getElementById('show-register').addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.classList.remove('active');
        registerForm.classList.add('active');
        hideMessage();
    });

    document.getElementById('show-login').addEventListener('click', (e) => {
        e.preventDefault();
        registerForm.classList.remove('active');
        loginForm.classList.add('active');
        hideMessage();
    });

    // Gestion du formulaire de connexion
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        try {
            // Nettoie l'ancien état
            localStorage.clear();
            api.setToken(null);

            const response = await api.login(username, password);

            // Stocke le token et les infos utilisateur
            api.setToken(response.accessToken);
            localStorage.setItem('refreshToken', response.refreshToken);
            localStorage.setItem('currentUser', JSON.stringify(response.user));

            showMessage('Connexion réussie ! Redirection...', 'success');

            // Redirige vers la page des notes
            setTimeout(() => {
                window.location.href = 'notes.html';
            }, 500);

        } catch (error) {
            showMessage(error.message, 'error');
        }
    });

    // Gestion du formulaire d'inscription
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('register-username').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirm = document.getElementById('register-confirm').value;

        // Validation
        if (password !== confirm) {
            showMessage('Les mots de passe ne correspondent pas', 'error');
            return;
        }

        try {
            await api.register(username, email, password);

            showMessage('Inscription réussie ! Vous pouvez vous connecter.', 'success');

            setTimeout(() => {
                registerForm.classList.remove('active');
                loginForm.classList.add('active');
                document.getElementById('login-username').value = username;
                hideMessage();
            }, 1500);

        } catch (error) {
            showMessage(error.message, 'error');
        }
    });
});

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

