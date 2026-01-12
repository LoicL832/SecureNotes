// Gestion des notes
class NotesManager {
    constructor() {
        this.currentView = 'my-notes';
        this.currentNote = null;
        this.isEditing = false;
        this.initElements();
        this.attachEvents();
        // Charge les notes au démarrage
        this.loadNotes();
    }

    initElements() {
        // Listes de notes
        this.notesList = document.getElementById('notes-list');
        this.sharedNotesList = document.getElementById('shared-notes-list');
        this.mySharesList = document.getElementById('my-shares-list');
        
        // Éditeur
        this.noteEditor = document.getElementById('note-editor');
        this.noteTitle = document.getElementById('note-title');
        this.noteContent = document.getElementById('note-content');
        this.noteInfo = document.getElementById('note-info');
        this.shareModal = document.getElementById('share-modal');
        
        // Boutons de navigation
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(btn => {
            const view = btn.dataset.view;
            if (view === 'my-notes') this.myNotesBtn = btn;
            else if (view === 'shared-notes') this.sharedNotesBtn = btn;
            else if (view === 'my-shares') this.mySharesBtn = btn;
        });
    }

    attachEvents() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.switchView(btn.dataset.view);
            });
        });

        // Nouvelle note
        document.getElementById('new-note-btn').addEventListener('click', () => {
            this.createNewNote();
        });

        // Éditeur
        document.getElementById('back-to-list').addEventListener('click', () => {
            this.closeEditor();
        });

        document.getElementById('save-note-btn').addEventListener('click', () => {
            this.saveNote();
        });

        document.getElementById('delete-note-btn').addEventListener('click', () => {
            this.deleteNote();
        });

        document.getElementById('share-note-btn').addEventListener('click', () => {
            this.openShareModal();
        });

        // Modal de partage
        document.querySelector('.modal-close').addEventListener('click', () => {
            this.closeShareModal();
        });

        document.getElementById('cancel-share-btn').addEventListener('click', () => {
            this.closeShareModal();
        });

        document.getElementById('confirm-share-btn').addEventListener('click', () => {
            this.confirmShare();
        });
    }

    switchView(viewName) {
        this.currentView = viewName;

        // Met à jour la navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === viewName);
        });

        // Met à jour les vues
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });

        document.getElementById(`${viewName}-view`).classList.add('active');

        // Ferme l'éditeur
        this.closeEditor();

        // Charge les données
        if (viewName === 'my-notes') {
            this.loadNotes();
        } else if (viewName === 'shared-with-me') {
            this.loadSharedNotes();
        } else if (viewName === 'shared-by-me') {
            this.loadMyShares();
        }
    }

    async loadNotes() {
        try {
            console.log('Loading notes for user...');
            
            // Vide d'abord la liste
            this.notesList.innerHTML = '<div class="loading">Chargement...</div>';
            
            const response = await api.getNotes();
            console.log('Notes received:', response.notes.length);
            
            this.renderNotesList(response.notes, this.notesList);
        } catch (error) {
            console.error('Error loading notes:', error);
            this.notesList.innerHTML = '';
            showNotification('Erreur lors du chargement des notes', 'error');
        }
    }

    async loadSharedNotes() {
        try {
            const response = await api.getSharedWithMe();
            this.renderSharedNotesList(response.shares, this.sharedNotesList);
        } catch (error) {
            showNotification('Erreur lors du chargement des notes partagées', 'error');
        }
    }

    async loadMyShares() {
        try {
            const response = await api.getSharedByMe();
            this.renderSharesList(response.shares, this.mySharesList);
        } catch (error) {
            showNotification('Erreur lors du chargement des partages', 'error');
        }
    }

    renderNotesList(notes, container) {
        if (notes.length === 0) {
            container.innerHTML = '<div class="empty-state">📝<p>Aucune note. Créez-en une !</p></div>';
            return;
        }

        container.innerHTML = notes.map(note => `
            <div class="note-card" data-note-id="${note.id}">
                <h3>${this.escapeHtml(note.title)}</h3>
                <div class="note-meta">
                    <span>${this.formatDate(note.updatedAt)}</span>
                    ${note.locked ? '<span class="note-badge locked">🔒 Verrouillée</span>' : ''}
                </div>
            </div>
        `).join('');

        // Événements de clic
        container.querySelectorAll('.note-card').forEach(card => {
            card.addEventListener('click', () => {
                this.openNote(card.dataset.noteId, false);
            });
        });
    }

    renderSharedNotesList(shares, container) {
        if (shares.length === 0) {
            container.innerHTML = '<div class="empty-state">👥<p>Aucune note partagée avec vous</p></div>';
            return;
        }

        container.innerHTML = shares.map(share => `
            <div class="note-card" data-note-id="${share.noteId}" data-is-shared="true">
                <h3>${this.escapeHtml(share.title)}</h3>
                <div class="note-meta">
                    <span>${this.formatDate(share.createdAt)}</span>
                    <span class="note-badge ${share.permission}">${share.permission === 'read' ? '👁️ Lecture' : '✏️ Écriture'}</span>
                    ${share.locked ? '<span class="note-badge locked">🔒 Verrouillée</span>' : ''}
                </div>
            </div>
        `).join('');

        container.querySelectorAll('.note-card').forEach(card => {
            card.addEventListener('click', () => {
                this.openNote(card.dataset.noteId, true);
            });
        });
    }

    renderSharesList(shares, container) {
        if (shares.length === 0) {
            container.innerHTML = '<div class="empty-state">📤<p>Vous n\'avez partagé aucune note</p></div>';
            return;
        }

        container.innerHTML = '<div class="shares-list">' + shares.map(share => `
            <div class="share-item">
                <div class="share-info">
                    <h4>Note: ${share.noteId.substring(0, 8)}...</h4>
                    <p>Partagée avec: <strong>${this.escapeHtml(share.sharedWithUsername)}</strong></p>
                    <p>Permission: <span class="note-badge ${share.permission}">${share.permission === 'read' ? 'Lecture' : 'Écriture'}</span></p>
                </div>
                <button class="btn btn-danger" onclick="notesManager.revokeShare('${share.shareId}')">
                    Révoquer
                </button>
            </div>
        `).join('') + '</div>';
    }

    async openNote(noteId, isShared) {
        try {
            const response = isShared 
                ? await api.getSharedNote(noteId)
                : await api.getNote(noteId);

            this.currentNote = {
                ...response.note,
                isShared
            };

            // Tente de verrouiller la note
            try {
                await api.lockNote(noteId);
                this.currentNote.lockedByMe = true;
                console.log('Note verrouillée avec succès');
            } catch (lockError) {
                console.warn('Impossible de verrouiller la note:', lockError);
                this.currentNote.lockedByMe = false;
                
                // Si la note est déjà verrouillée par quelqu'un d'autre
                if (lockError.message.includes('currently being edited') || 
                    lockError.message.includes('verrouillée') || 
                    lockError.message.includes('423')) {
                    showNotification('⚠️ Cette note est en cours de modification par un autre utilisateur. Vous pouvez la consulter mais pas la modifier.', 'warning');
                    // Désactive les champs
                    this.noteTitle.disabled = true;
                    this.noteContent.disabled = true;
                    document.getElementById('save-note-btn').disabled = true;
                }
                // Pour toute erreur de verrouillage, ne pas permettre l'édition
            }

            this.noteTitle.value = response.note.title;
            this.noteContent.value = response.note.content;
            
            // Info de la note
            let info = `Créée: ${this.formatDate(response.note.createdAt)} | Modifiée: ${this.formatDate(response.note.updatedAt)}`;
            if (response.note.locked && !this.currentNote.lockedByMe) {
                info += ` | 🔒 Verrouillée par un autre utilisateur`;
            } else if (this.currentNote.lockedByMe) {
                info += ` | 🔓 Vous modifiez cette note`;
            }
            this.noteInfo.textContent = info;

            this.showEditor();

        } catch (error) {
            showNotification(error.message, 'error');
        }
    }

    createNewNote() {
        this.currentNote = {
            id: null,
            title: '',
            content: '',
            isShared: false
        };

        this.noteTitle.value = '';
        this.noteContent.value = '';
        this.noteInfo.textContent = 'Nouvelle note';

        this.showEditor();
        this.noteTitle.focus();
    }

    async saveNote() {
        const title = this.noteTitle.value.trim();
        const content = this.noteContent.value;

        if (!title) {
            showNotification('Le titre est requis', 'error');
            return;
        }

        try {
            if (this.currentNote.id) {
                // Mise à jour
                if (this.currentNote.isShared) {
                    await api.updateSharedNote(this.currentNote.id, title, content);
                } else {
                    await api.updateNote(this.currentNote.id, title, content);
                }
                showNotification('Note mise à jour', 'success');
                
                // Déverrouille la note après sauvegarde
                if (this.currentNote.lockedByMe) {
                    try {
                        await api.unlockNote(this.currentNote.id);
                        console.log('Note déverrouillée');
                    } catch (unlockError) {
                        console.warn('Erreur lors du déverrouillage:', unlockError);
                    }
                }
            } else {
                // Création
                await api.createNote(title, content);
                showNotification('Note créée', 'success');
            }

            this.closeEditor();
            this.loadNotes();

        } catch (error) {
            showNotification(error.message, 'error');
        }
    }

    async deleteNote() {
        if (!this.currentNote.id) return;

        if (!confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) {
            return;
        }

        try {
            await api.deleteNote(this.currentNote.id);
            showNotification('Note supprimée', 'success');
            this.closeEditor();
            this.loadNotes();
        } catch (error) {
            showNotification(error.message, 'error');
        }
    }

    async revokeShare(shareId) {
        if (!confirm('Êtes-vous sûr de vouloir révoquer ce partage ?')) {
            return;
        }

        try {
            await api.revokeShare(shareId);
            showNotification('Partage révoqué', 'success');
            this.loadMyShares();
        } catch (error) {
            showNotification(error.message, 'error');
        }
    }

    openShareModal() {
        if (!this.currentNote || !this.currentNote.id) {
            showNotification('Veuillez d\'abord enregistrer la note', 'error');
            return;
        }

        this.shareModal.classList.add('active');
        document.getElementById('share-username').value = '';
        document.getElementById('share-permission').value = 'read';
    }

    closeShareModal() {
        this.shareModal.classList.remove('active');
    }

    async confirmShare() {
        const username = document.getElementById('share-username').value.trim();
        const permission = document.getElementById('share-permission').value;

        if (!username) {
            showNotification('Le nom d\'utilisateur est requis', 'error');
            return;
        }

        try {
            await api.shareNote(this.currentNote.id, username, permission);
            showNotification('Note partagée avec succès', 'success');
            this.closeShareModal();
        } catch (error) {
            showNotification(error.message, 'error');
        }
    }

    showEditor() {
        document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
        this.noteEditor.classList.remove('hidden');
    }

    async closeEditor() {
        // Déverrouille la note si elle était verrouillée par nous
        if (this.currentNote && this.currentNote.id && this.currentNote.lockedByMe) {
            try {
                await api.unlockNote(this.currentNote.id);
                console.log('Note déverrouillée lors de la fermeture');
            } catch (error) {
                console.warn('Erreur lors du déverrouillage:', error);
            }
        }
        
        // Réactive les champs au cas où ils étaient désactivés
        this.noteTitle.disabled = false;
        this.noteContent.disabled = false;
        document.getElementById('save-note-btn').disabled = false;
        
        this.noteEditor.classList.add('hidden');
        document.getElementById(`${this.currentView}-view`).classList.add('active');
        this.currentNote = null;
    }

    // Utilitaires
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) {
            return 'Aujourd\'hui';
        } else if (days === 1) {
            return 'Hier';
        } else if (days < 7) {
            return `Il y a ${days} jours`;
        } else {
            return date.toLocaleDateString('fr-FR');
        }
    }
}
