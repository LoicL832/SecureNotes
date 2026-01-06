// Gestion de l'authentification
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.initElements();
        this.attachEvents();
    }

    initElements() {
        this.authScreen = document.getElementById('auth-screen');
        this.mainScreen = document.getElementById('main-screen');
        this.loginForm = document.getElementById('login-form');
        this.registerForm = document.getElementById('register-form');
        this.authMessage = document.getElementById('auth-message');
        this.usernameDisplay = document.getElementById('username-display');
        this.logoutBtn = document.getElementById('logout-btn');
    }

    attachEvents() {
        // Switch entre login et register
        document.getElementById('show-register').addEventListener('click', (e) => {
            e.preventDefault();
            this.showRegister();
        });

        document.getElementById('show-login').addEventListener('click', (e) => {
            e.preventDefault();
            this.showLogin();
        });

        // Formulaires
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        document.getElementById('registerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });

        // Logout
        this.logoutBtn.addEventListener('click', () => {
            this.handleLogout();
        });
    }

    showLogin() {
        this.loginForm.classList.add('active');
        this.registerForm.classList.remove('active');
        this.hideMessage();
    }

    showRegister() {
        this.registerForm.classList.add('active');
        this.loginForm.classList.remove('active');
        this.hideMessage();
    }

    async handleLogin() {
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        try {
            // Nettoie d'abord tout l'ancien état
            localStorage.clear();
            api.setToken(null);
            
            const response = await api.login(username, password);
            
            // Stocke le token et les infos utilisateur
            api.setToken(response.accessToken);
            localStorage.setItem('refreshToken', response.refreshToken);
            this.currentUser = response.user;

            this.showMessage('Connexion réussie !', 'success');
            
            // Attend un peu avant de basculer pour être sûr que tout est nettoyé
            setTimeout(() => {
                this.showMainScreen();
            }, 500);

        } catch (error) {
            this.showMessage(error.message, 'error');
        }
    }

    async handleRegister() {
        const username = document.getElementById('register-username').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirm = document.getElementById('register-confirm').value;

        // Validation
        if (password !== confirm) {
            this.showMessage('Les mots de passe ne correspondent pas', 'error');
            return;
        }

        try {
            await api.register(username, email, password);
            
            this.showMessage('Inscription réussie ! Vous pouvez vous connecter.', 'success');
            
            setTimeout(() => {
                this.showLogin();
                document.getElementById('login-username').value = username;
            }, 1500);

        } catch (error) {
            this.showMessage(error.message, 'error');
        }
    }

    handleLogout() {
        // Nettoie les tokens
        api.setToken(null);
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('token');
        
        // Réinitialise l'utilisateur
        this.currentUser = null;
        
        // Nettoie l'interface des notes
        if (window.notesManager) {
            notesManager.currentNote = null;
            notesManager.notesList.innerHTML = '';
            notesManager.sharedNotesList.innerHTML = '';
            notesManager.mySharesList.innerHTML = '';
            notesManager.noteEditor.classList.remove('active');
        }
        
        // Nettoie les champs de formulaire
        document.getElementById('login-username').value = '';
        document.getElementById('login-password').value = '';
        document.getElementById('register-username').value = '';
        document.getElementById('register-email').value = '';
        document.getElementById('register-password').value = '';
        document.getElementById('register-confirm').value = '';
        
        // Retour à l'écran de connexion
        this.showAuthScreen();
        this.showLogin();
        
        showNotification('Déconnexion réussie', 'info');
    }

    async checkAuth() {
        const token = localStorage.getItem('token');
        
        if (!token) {
            this.showAuthScreen();
            return false;
        }

        try {
            const response = await api.verifyToken();
            
            if (response.valid) {
                this.currentUser = response.user;
                this.showMainScreen();
                return true;
            } else {
                this.showAuthScreen();
                return false;
            }
        } catch (error) {
            this.showAuthScreen();
            return false;
        }
    }

    showAuthScreen() {
        this.authScreen.classList.add('active');
        this.mainScreen.classList.remove('active');
    }

    showMainScreen() {
        console.log('Showing main screen for user:', this.currentUser.username);
        
        this.authScreen.classList.remove('active');
        this.mainScreen.classList.add('active');
        this.usernameDisplay.textContent = this.currentUser.username;
        
        // Réinitialise et charge toutes les données
        if (window.notesManager) {
            console.log('NotesManager found, resetting interface...');
            
            // Nettoie l'éditeur
            notesManager.currentNote = null;
            notesManager.noteEditor.classList.remove('active');
            
            // Réinitialise les listes
            notesManager.notesList.innerHTML = '';
            notesManager.sharedNotesList.innerHTML = '';
            notesManager.mySharesList.innerHTML = '';
            
            // Retour à la vue "Mes notes"
            notesManager.currentView = 'my-notes';
            notesManager.myNotesBtn.classList.add('active');
            notesManager.sharedNotesBtn.classList.remove('active');
            notesManager.mySharesBtn.classList.remove('active');
            
            // Force le rechargement des notes avec un petit délai pour être sûr
            setTimeout(() => {
                console.log('Forcing notes reload...');
                notesManager.loadNotes();
            }, 100);
        } else {
            console.error('NotesManager not found!');
        }
    }

    showMessage(message, type) {
        this.authMessage.textContent = message;
        this.authMessage.className = `message ${type}`;
    }

    hideMessage() {
        this.authMessage.className = 'message';
    }
}
