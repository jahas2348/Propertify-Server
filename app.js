const express = require('express');
const bodyParser = require('body-parser');
const agentRouter = require('./routers/agentRouter');
const userRouter = require('./routers/userRouter');
const adminRouter = require('./routers/adminRouter');
const chatRouter = require('./routers/chatRouter'); // Import the chat router
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

dotenv.config();

// io.on('connection', (socket) => {
//   console.log(`A user/agent connected: ${socket.id}`);

//   socket.on('identify', (role) => {
//     socket.join(role);
//   });

//   socket.on('message', (data) => {
//     const { roomName, message } = data;

//     // Save the message to the database

//     // Broadcast the message to the room
//     io.to(roomName).emit('message', message);
//   });

//   socket.on('disconnect', () => {
//     console.log(`A user/agent disconnected: ${socket.id}`);
//   });
// }); 

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/public/uploads', express.static('public/uploads'));

const BASE_URL = process.env.BASE_URL;
app.use('/', agentRouter);
app.use('/', userRouter);
app.use('/', adminRouter);

// Add the chat route
app.use('/chat', chatRouter);

app.get('/', (req, res) => {
  res.send('Welcome to Propertify');
});

module.exports = server;
