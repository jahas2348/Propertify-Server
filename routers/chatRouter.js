// chatRouter.js
const express = require('express');
const router = express.Router();
const Chat = require('../models/chatModel'); // Import the Chat model

// Send a new message
router.post('/send', async (req, res) => {
  try {
    // Get the message content and room name from the request body
    const { message, roomName } = req.body;

    // Create a new chat message
    const chatMessage = new Chat({
      message,
      room: roomName,
    });

    // Save the message to the database
    const savedMessage = await chatMessage.save();

    // Broadcast the message to the room
    io.to(roomName).emit('message', savedMessage);

    res.status(201).json(savedMessage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
