document.addEventListener('DOMContentLoaded', () => {
    // Referensi Elemen UI
    const namePromptOverlay = document.getElementById('name-prompt-overlay');
    const nameForm = document.getElementById('name-form');
    const nameInput = document.getElementById('name-input');
    const mainContent = document.getElementById('main-content');
    const usernameDisplay = document.getElementById('username-display');
    const columns = document.querySelectorAll('.kanban-column');
    const taskModalOverlay = document.getElementById('task-modal-overlay');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskForm = document.getElementById('task-form');
    const cancelTaskBtn = document.getElementById('cancel-task-btn');
    const taskHeaderInput = document.getElementById('task-header-input');
    const taskDetailInput = document.getElementById('task-detail-input');
    const chatWidget = document.getElementById('chat-widget');
    const chatToggle = document.getElementById('chat-toggle');
    const chatWindow = document.getElementById('chat-window');
    const chatMessages = document.getElementById('chat-messages');
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatNotificationBadge = document.getElementById('chat-notification-badge'); // Badge notifikasi
    const onlineUsersWidget = document.getElementById('online-users-widget');
    const avatarContainer = document.getElementById('avatar-container');
    const userListPopover = document.getElementById('user-list-popover');
    
    // Variabel state klien
    let currentUsername = null;
    let unreadMessages = 0; // State baru untuk menghitung pesan belum dibaca
    
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const ws = new WebSocket(`${protocol}://${window.location.host}`);

    function sendMessage(payload) {
        if (!currentUsername) return;
        ws.send(JSON.stringify({ ...payload, username: currentUsername }));
    }

    function createCardElement(todo) {
        const card = document.createElement('div'); card.className = 'kanban-card'; card.dataset.id = todo.id; card.draggable = true;
        let assignmentHTML;
        if (todo.assignedTo === 'Unassigned') {
            assignmentHTML = `<button class="take-task-btn" data-id="${todo.id}">Ambil Tugas Ini</button>`;
        } else if (todo.assignedTo === currentUsername) {
            assignmentHTML = `<div class="assigned-to-self">Anda yang mengerjakan</div><button class="unassign-task-btn" data-id="${todo.id}">Lepas Tugas</button>`;
        } else {
            assignmentHTML = `<div class="assigned-to">Ditugaskan kepada: <strong>${todo.assignedTo}</strong></div>`;
        }
        card.innerHTML = `<div class="card-header">${todo.header}</div><p class="card-detail">${todo.detail || ''}</p><div class="card-assignment">${assignmentHTML}</div><div class="card-author">Oleh: ${todo.addedBy}</div><button class="delete-btn">×</button>`;
        card.addEventListener('dragstart', e => { card.classList.add('dragging'); e.dataTransfer.setData('text/plain', todo.id); });
        card.addEventListener('dragend', () => card.classList.remove('dragging'));
        card.querySelector('.delete-btn').addEventListener('click', () => sendMessage({ type: 'delete_todo', id: todo.id }));
        const takeBtn = card.querySelector('.take-task-btn');
        if (takeBtn) { takeBtn.addEventListener('click', () => sendMessage({ type: 'assign_task', id: parseInt(takeBtn.dataset.id) })); }
        const unassignBtn = card.querySelector('.unassign-task-btn');
        if (unassignBtn) { unassignBtn.addEventListener('click', () => sendMessage({ type: 'unassign_task', id: parseInt(unassignBtn.dataset.id) })); }
        return card;
    }

    function renderBoard(todos) {
        document.getElementById('todo-list').innerHTML = ''; document.getElementById('inprogress-list').innerHTML = ''; document.getElementById('done-list').innerHTML = '';
        todos.forEach(todo => { const card = createCardElement(todo); const columnList = document.getElementById(`${todo.status}-list`); if (columnList) { columnList.appendChild(card); } });
    }

    function renderChatMessage({ sender, text }) {
        const messageEl = document.createElement('div'); messageEl.classList.add('chat-message');
        if (sender === currentUsername) {
            messageEl.classList.add('self');
        } else {
            messageEl.classList.add('other');
            // Logika Notifikasi: Tambah counter jika pesan dari orang lain & jendela chat tertutup
            if (chatWindow.classList.contains('hidden')) {
                unreadMessages++;
                updateNotificationBadge();
            }
        }
        messageEl.innerHTML = `<span class="sender">${sender}</span><span class="text">${text}</span>`;
        chatMessages.appendChild(messageEl); chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // --- FUNGSI BARU UNTUK MENGELOLA BADGE NOTIFIKASI ---
    function updateNotificationBadge() {
        if (unreadMessages > 0) {
            chatNotificationBadge.textContent = unreadMessages > 9 ? '9+' : unreadMessages;
            chatNotificationBadge.classList.add('visible');
        } else {
            chatNotificationBadge.classList.remove('visible');
        }
    }
    
    function resetNotificationBadge() {
        unreadMessages = 0;
        updateNotificationBadge();
    }
    // ----------------------------------------------------

    function updateUserList(users) {
        avatarContainer.innerHTML = ''; userListPopover.innerHTML = '';
        if (users.length === 0) return;
        const maxAvatarsToShow = 3;
        users.slice(0, maxAvatarsToShow).forEach(user => { const avatar = document.createElement('div'); avatar.className = 'avatar-circle'; avatar.textContent = user.charAt(0); avatar.title = user; avatarContainer.appendChild(avatar); });
        if (users.length > maxAvatarsToShow) { const moreEl = document.createElement('div'); moreEl.className = 'avatar-more'; moreEl.textContent = `+${users.length - maxAvatarsToShow}`; avatarContainer.appendChild(moreEl); }
        const popoverHeader = document.createElement('div'); popoverHeader.className = 'user-list-popover-header'; popoverHeader.textContent = `Online (${users.length})`;
        const listEl = document.createElement('ul');
        users.forEach(user => { const itemEl = document.createElement('li'); itemEl.textContent = user; if (user === currentUsername) { itemEl.style.fontWeight = 'bold'; } listEl.appendChild(itemEl); });
        userListPopover.appendChild(popoverHeader); userListPopover.appendChild(listEl);
    }

    // --- ALUR INISIALISASI ---
    fetch('/get-username').then(res => res.json()).then(data => { if (data.username) initializeUser(data.username); else { namePromptOverlay.classList.remove('hidden'); nameInput.focus(); } });
    nameForm.addEventListener('submit', e => { e.preventDefault(); fetch('/set-username', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: nameInput.value }) }).then(res => res.json()).then(data => { if (data.success) { namePromptOverlay.classList.add('hidden'); initializeUser(data.username); } }); });
    function initializeUser(username) { currentUsername = username; usernameDisplay.textContent = username; mainContent.classList.remove('hidden'); chatWidget.classList.remove('hidden'); sendMessage({ type: 'client_ready' }); }

    // --- MENANGANI PESAN SERVER ---
    ws.onmessage = event => {
        const data = JSON.parse(event.data);
        switch (data.type) {
            case 'board_update': renderBoard(data.todos); break;
            case 'new_chat_message': renderChatMessage(data); break;
            case 'user_list_update': updateUserList(data.users); break;
        }
    };
    
    // --- EVENT LISTENERS ---
    addTaskBtn.addEventListener('click', () => taskModalOverlay.classList.remove('hidden'));
    cancelTaskBtn.addEventListener('click', () => taskModalOverlay.classList.add('hidden'));
    taskForm.addEventListener('submit', e => { e.preventDefault(); sendMessage({ type: 'add_todo', header: taskHeaderInput.value, detail: taskDetailInput.value }); taskForm.reset(); taskModalOverlay.classList.add('hidden'); });
    
    // --- MODIFIKASI LISTENER WIDGET CHAT ---
    chatToggle.addEventListener('click', () => {
        chatWindow.classList.toggle('hidden');
        // Jika jendela dibuka, reset notifikasi
        if (!chatWindow.classList.contains('hidden')) {
            resetNotificationBadge();
        }
    });
    chatForm.addEventListener('submit', e => { e.preventDefault(); const text = chatInput.value.trim(); if (text) { sendMessage({ type: 'send_chat_message', text: text }); chatInput.value = ''; } });
    
    columns.forEach(column => { column.addEventListener('dragover', e => { e.preventDefault(); column.classList.add('drag-over'); }); column.addEventListener('dragleave', () => column.classList.remove('drag-over')); column.addEventListener('drop', e => { e.preventDefault(); column.classList.remove('drag-over'); sendMessage({ type: 'move_todo', id: parseInt(e.dataTransfer.getData('text/plain')), newStatus: column.dataset.status }); }); });
    avatarContainer.addEventListener('click', (e) => { e.stopPropagation(); userListPopover.classList.toggle('hidden'); });
    document.addEventListener('click', (e) => { if (!onlineUsersWidget.contains(e.target)) { userListPopover.classList.add('hidden'); } });
});