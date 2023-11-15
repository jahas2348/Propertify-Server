// chatModel.js
const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  roomName: String, // Room name or ID
  sender: String, // Sender's username or ID
  message: String, // Chat message
  timestamp: { type: Date, default: Date.now }, // Timestamp of the message
});

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
