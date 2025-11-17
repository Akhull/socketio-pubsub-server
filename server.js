const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  transports: ['websocket', 'polling'],
  path: '/socket.io/'
});

app.get('/', (req, res) => {
  res.json({ 
    status: 'Socket.IO Server läuft!', 
    connections: io.engine.clientsCount 
  });
});

io.on('connection', (socket) => {
  console.log('Client verbunden:', socket.id);

  socket.on('subscribe', (channel) => {
    socket.join(channel);
    console.log(`${socket.id} subscribed zu ${channel}`);
    socket.emit('subscribed', { channel, success: true });
  });

  socket.on('unsubscribe', (channel) => {
    socket.leave(channel);
    socket.emit('unsubscribed', { channel, success: true });
  });

  socket.on('publish', ({ channel, message }) => {
    console.log(`Publish zu ${channel}:`, message);
    socket.to(channel).emit('message', { channel, message, senderId: socket.id });
    socket.emit('published', { channel, success: true });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 8080;
httpServer.listen(PORT, () => {
  console.log(`Socket.IO Server läuft auf Port ${PORT}`);
});
