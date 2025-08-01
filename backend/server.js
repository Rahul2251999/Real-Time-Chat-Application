const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// JWT Secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage
const chatRooms = new Map(); // roomId -> { name, messages: [], users: Set() }
const users = new Map(); // socketId -> { id, name, email, photo, currentRoom }
const userTokens = new Map(); // token -> { userId, name, email, photo }

// JWT Token generation
const generateToken = (userData) => {
  return jwt.sign(
    { 
      userId: userData.id, 
      name: userData.name, 
      email: userData.email,
      photo: userData.photo 
    }, 
    JWT_SECRET, 
    { expiresIn: '24h' }
  );
};

// JWT Token verification middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Authentication endpoint
app.post('/api/auth/login', (req, res) => {
  const { name, email, photo } = req.body;
  
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  // Generate user ID
  const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Create user data
  const userData = {
    id: userId,
    name,
    email,
    photo: photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`
  };

  // Generate JWT token
  const token = generateToken(userData);
  
  // Store token mapping
  userTokens.set(token, userData);

  res.json({
    success: true,
    token,
    user: userData
  });
});

// Verify token endpoint
app.get('/api/auth/verify', verifyToken, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

// Get user profile endpoint
app.get('/api/auth/profile', verifyToken, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

app.get('/api/rooms', verifyToken, (req, res) => {
  const rooms = Array.from(chatRooms.entries()).map(([id, room]) => ({
    id,
    name: room.name,
    userCount: room.users.size,
    users: Array.from(room.users).map(socketId => {
      const user = users.get(socketId);
      return user ? { name: user.name, photo: user.photo } : null;
    }).filter(Boolean)
  }));
  res.json(rooms);
});

// Socket.IO connection handling with token authentication
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    return next(new Error('Authentication token required'));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    socket.userData = decoded;
    next();
  } catch (error) {
    return next(new Error('Invalid or expired token'));
  }
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Store user data from token
  const userData = socket.userData;
  users.set(socket.id, {
    id: userData.userId,
    name: userData.name,
    email: userData.email,
    photo: userData.photo,
    currentRoom: null
  });
  
  socket.emit('login_success', {
    id: userData.userId,
    name: userData.name,
    email: userData.email,
    photo: userData.photo
  });
  
  console.log('User logged in:', userData.name);

  // Handle creating a new chat room
  socket.on('create_room', (roomData) => {
    const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    chatRooms.set(roomId, {
      name: roomData.name,
      messages: [],
      users: new Set()
    });
    
    socket.emit('room_created', {
      id: roomId,
      name: roomData.name
    });
    
    // Broadcast updated room list to all clients
    broadcastRoomList();
    
    console.log('Room created:', roomData.name, 'with ID:', roomId);
  });

  // Handle joining a chat room
  socket.on('join_room', (roomId) => {
    const user = users.get(socket.id);
    const room = chatRooms.get(roomId);
    
    if (!user) {
      socket.emit('error', { message: 'User not authenticated' });
      return;
    }
    
    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    // Leave current room if any
    if (user.currentRoom) {
      socket.leave(user.currentRoom);
      const currentRoom = chatRooms.get(user.currentRoom);
      if (currentRoom) {
        currentRoom.users.delete(socket.id);
        socket.to(user.currentRoom).emit('user_left', {
          userId: socket.id,
          userName: user.name
        });
      }
    }

    // Join new room
    socket.join(roomId);
    room.users.add(socket.id);
    user.currentRoom = roomId;

    // Send room data to user
    socket.emit('room_joined', {
      roomId,
      roomName: room.name,
      messages: room.messages,
      users: Array.from(room.users).map(socketId => {
        const roomUser = users.get(socketId);
        return roomUser ? {
          id: socketId,
          name: roomUser.name,
          photo: roomUser.photo
        } : null;
      }).filter(Boolean)
    });

    // Notify other users in the room
    socket.to(roomId).emit('user_joined', {
      userId: socket.id,
      userName: user.name,
      userPhoto: user.photo
    });

    // Broadcast updated room list
    broadcastRoomList();
    
    console.log(`User ${user.name} joined room ${room.name}`);
  });

  // Handle sending messages
  socket.on('send_message', (messageData) => {
    const user = users.get(socket.id);
    
    if (!user || !user.currentRoom) {
      socket.emit('error', { message: 'User not in a room' });
      return;
    }

    const room = chatRooms.get(user.currentRoom);
    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    const message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text: messageData.text,
      userId: socket.id,
      userName: user.name,
      userPhoto: user.photo,
      timestamp: new Date().toISOString()
    };

    // Store message in room history
    room.messages.push(message);

    // Broadcast message to all users in the room
    io.to(user.currentRoom).emit('new_message', message);
    
    console.log(`Message from ${user.name} in room ${room.name}: ${messageData.text}`);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    const user = users.get(socket.id);
    
    if (user && user.currentRoom) {
      const room = chatRooms.get(user.currentRoom);
      if (room) {
        room.users.delete(socket.id);
        socket.to(user.currentRoom).emit('user_left', {
          userId: socket.id,
          userName: user.name
        });
      }
    }
    
    users.delete(socket.id);
    broadcastRoomList();
    
    console.log('User disconnected:', socket.id);
  });
});

// Helper function to broadcast room list to all clients
function broadcastRoomList() {
  const rooms = Array.from(chatRooms.entries()).map(([id, room]) => ({
    id,
    name: room.name,
    userCount: room.users.size,
    users: Array.from(room.users).map(socketId => {
      const user = users.get(socketId);
      return user ? { name: user.name, photo: user.photo } : null;
    }).filter(Boolean)
  }));
  
  io.emit('rooms_updated', rooms);
}

const PORT = process.env.PORT || 3001;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

