const express = require('express');
const bodyParser = require('body-parser');
const agentRouter = require('./routers/agentRouter');
const userRouter = require('./routers/userRouter');
const adminRouter = require('./routers/adminRouter');
const chatRouter = require('./routers/chatRouter');
const dotenv = require('dotenv');
const http = require('http');
const https = require('https'); // Import the https module
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const path = require('path');
const cron = require("node-cron");

dotenv.config();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/public/uploads', express.static('public/uploads'));

const BASE_URL = process.env.BASE_URL;
app.use('/', agentRouter);
app.use('/', userRouter);
app.use('/', adminRouter);

// Add the chat route
app.use('/chat', chatRouter);

// Serve static files from the root directory
app.use(express.static(path.join(__dirname, '')));
 
// Define a route for the privacy policy
app.get('/privacypolicy', (req, res) => {
  res.sendFile(path.join(__dirname, 'privacypolicy.html'));
});

app.get('/', (req, res) => {
  res.send('Welcome to Propertify App');
});

cron.schedule('*/14 * * * *', () => {
  console.log('Pinging server to keep it alive...');
  https.get('https://propertifyapp.online/', (res) => {
    console.log(`Ping response: ${res.statusCode}`);
  }).on('error', (err) => {
    console.error('Ping error:', err.message);
  });
});

module.exports = server;
