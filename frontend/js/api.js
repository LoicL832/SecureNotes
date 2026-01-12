// API Client pour communiquer avec le backend
const API_BASE_URL = 'https://localhost:3001/api';

class APIClient {
    constructor() {
        this.token = localStorage.getItem('token');
    }

    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    }

    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        return headers;
    }

    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const config = {
            ...options,
            headers: {
                ...this.getHeaders(),
                ...options.headers
            }
        };

        try {
            const response = await fetch(url, config);

            // Vérifie si la réponse a du contenu
            const text = await response.text();
            let data;

            try {
                data = text ? JSON.parse(text) : {};
            } catch (e) {
                console.error('Failed to parse JSON:', text);
                throw new Error('Réponse invalide du serveur');
            }

            if (!response.ok) {
                // Gère spécifiquement l'erreur 423 (Locked)
                if (response.status === 423) {
                    const lockedBy = data.lockedBy ? ` par ${data.lockedBy}` : '';
                    throw new Error(`Note verrouillée${lockedBy} (423)`);
                }
                throw new Error(data.error || `Erreur ${response.status}: ${response.statusText}`);
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Auth
    async register(username, email, password) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username, email, password })
        });
    }

    async login(username, password) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
    }

    async verifyToken() {
        return this.request('/auth/verify');
    }

    async refreshToken(refreshToken) {
        return this.request('/auth/refresh', {
            method: 'POST',
            body: JSON.stringify({ refreshToken })
        });
    }

    // Notes
    async getNotes() {
        return this.request('/notes');
    }

    async getNote(noteId) {
        return this.request(`/notes/${noteId}`);
    }

    async createNote(title, content) {
        return this.request('/notes', {
            method: 'POST',
            body: JSON.stringify({ title, content })
        });
    }

    async updateNote(noteId, title, content) {
        return this.request(`/notes/${noteId}`, {
            method: 'PUT',
            body: JSON.stringify({ title, content })
        });
    }

    async deleteNote(noteId) {
        return this.request(`/notes/${noteId}`, {
            method: 'DELETE'
        });
    }

    // Shares
    async shareNote(noteId, targetUsername, permission) {
        return this.request('/shares', {
            method: 'POST',
            body: JSON.stringify({ noteId, targetUsername, permission })
        });
    }

    async getSharedWithMe() {
        return this.request('/shares/received');
    }

    async getSharedByMe() {
        return this.request('/shares/sent');
    }

    async revokeShare(shareId) {
        return this.request(`/shares/${shareId}`, {
            method: 'DELETE'
        });
    }

    async lockNote(noteId) {
        return this.request(`/notes/${noteId}/lock`, {
            method: 'POST'
        });
    }

    async unlockNote(noteId) {
        return this.request(`/notes/${noteId}/unlock`, {
            method: 'POST'
        });
    }

    async getSharedNote(noteId) {
        return this.request(`/shares/notes/${noteId}`);
    }

    async updateSharedNote(noteId, title, content) {
        return this.request(`/shares/notes/${noteId}`, {
            method: 'PUT',
            body: JSON.stringify({ title, content })
        });
    }
}
