const express = require('express');
const http = require('http');
const session = require('express-session');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);

app.use(express.json());

const sessionParser = session({
    secret: 'kunci-rahasia-yang-paling-aman-dan-benar',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }
});
app.use(sessionParser);

const animalNames = [ 'Kancil', 'Harimau', 'Gajah', 'Elang', 'Komodo', 'Orangutan', 'Badak', 'Penyu', 'Anoa', 'Cendrawasih' ];

app.post('/set-username', (req, res) => {
    let newName = req.body.username?.trim();
    if (!newName) {
        const randomAnimal = animalNames[Math.floor(Math.random() * animalNames.length)];
        const randomNumber = Math.floor(100 + Math.random() * 900);
        newName = `${randomAnimal}_${randomNumber}`;
    }
    req.session.username = newName;
    req.session.save(() => res.json({ success: true, username: newName }));
});

app.get('/get-username', (req, res) => {
    res.json({ username: req.session.username || null });
});

app.use(express.static('public'));

let todos = [];
let nextId = 1;
const onlineUsers = new Map();

const wss = new WebSocket.Server({ server });

function broadcast(type, payload) {
    const data = JSON.stringify({ type, ...payload });
    for (const client of wss.clients) {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    }
}

wss.on('connection', ws => {
    console.log('[SERVER] Koneksi WebSocket baru diterima.');

    ws.on('message', message => {
        const data = JSON.parse(message);
        
        const currentUsername = data.username;
        if (!currentUsername) return;

        console.log(`[SERVER] Pesan dari ${currentUsername}:`, data.type);

        switch (data.type) {
            case 'client_ready':
                ws.username = currentUsername;
                onlineUsers.set(currentUsername, ws);
                broadcast('user_list_update', { users: Array.from(onlineUsers.keys()) });
                ws.send(JSON.stringify({ type: 'board_update', todos: todos }));
                break;
            
            case 'send_chat_message':
                broadcast('new_chat_message', {
                    sender: currentUsername,
                    text: data.text,
                    timestamp: new Date().getTime()
                });
                break;

            case 'add_todo':
                const newTodo = { id: nextId++, header: data.header, detail: data.detail, assignedTo: 'Unassigned', status: 'todo', addedBy: currentUsername };
                todos.push(newTodo);
                broadcast('board_update', { todos });
                break;
            
            case 'assign_task':
                todos = todos.map(todo => (todo.id === data.id && todo.assignedTo === 'Unassigned') ? { ...todo, assignedTo: currentUsername } : todo);
                broadcast('board_update', { todos });
                break;
            
            // --- LOGIKA BARU UNTUK MELEPAS TUGAS ---
            case 'unassign_task':
                todos = todos.map(todo => {
                    // Hanya lepas tugas jika ID cocok DAN pengguna yang meminta adalah pemilik tugas
                    if (todo.id === data.id && todo.assignedTo === currentUsername) {
                        return { ...todo, assignedTo: 'Unassigned' };
                    }
                    return todo;
                });
                broadcast('board_update', { todos });
                break;
            // ------------------------------------------

            case 'move_todo':
                todos = todos.map(todo => todo.id === data.id ? { ...todo, status: data.newStatus } : todo);
                broadcast('board_update', { todos });
                break;

            case 'delete_todo':
                todos = todos.filter(todo => todo.id !== data.id);
                broadcast('board_update', { todos });
                break;
        }
    });

    ws.on('close', () => {
        const closedUsername = ws.username;
        if (closedUsername && onlineUsers.has(closedUsername)) {
            onlineUsers.delete(closedUsername);
            console.log(`[SERVER] Client terputus: ${closedUsername}`);
            broadcast('user_list_update', { users: Array.from(onlineUsers.keys()) });
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server berjalan di http://localhost:${PORT}`));