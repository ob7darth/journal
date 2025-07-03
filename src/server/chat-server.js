// Simple Node.js chat server using Socket.IO
// Run this separately: node src/server/chat-server.js

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Store messages and users in memory (use database in production)
let messages = [];
let users = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Send existing messages to new user
  socket.emit('messages', messages);
  
  // Send current users list
  socket.emit('users', Array.from(users.values()));

  socket.on('join', ({ userId, userName }) => {
    const user = {
      id: userId,
      name: userName,
      socketId: socket.id,
      isOnline: true,
      lastSeen: new Date()
    };
    
    users.set(userId, user);
    socket.userId = userId;
    
    // Broadcast updated users list
    io.emit('users', Array.from(users.values()));
    
    console.log(`${userName} joined the chat`);
  });

  socket.on('message', (message) => {
    // Add server timestamp
    message.timestamp = new Date();
    messages.push(message);
    
    // Keep only last 100 messages
    if (messages.length > 100) {
      messages = messages.slice(-100);
    }
    
    // Broadcast message to all connected clients
    io.emit('message', message);
    
    console.log(`Message from ${message.user}: ${message.message}`);
  });

  socket.on('disconnect', () => {
    if (socket.userId && users.has(socket.userId)) {
      const user = users.get(socket.userId);
      user.isOnline = false;
      user.lastSeen = new Date();
      
      // Broadcast updated users list
      io.emit('users', Array.from(users.values()));
      
      console.log(`${user.name} disconnected`);
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Chat server running on port ${PORT}`);
});