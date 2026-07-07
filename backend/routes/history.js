const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const dbFallback = require('../services/dbFallback');

// GET /api/history - Retrieve all chat sessions
router.get('/', async (req, res) => {
  try {
    if (dbFallback.isOffline()) {
      return res.status(200).json(dbFallback.getChats());
    }

    const chats = await Chat.find({}, 'title createdAt messages')
      .sort({ createdAt: -1 });
    
    const formattedHistory = chats.map(chat => ({
      _id: chat._id,
      title: chat.title,
      createdAt: chat.createdAt,
      messageCount: chat.messages.length,
      lastMessage: chat.messages[chat.messages.length - 1]?.text || ''
    }));

    return res.status(200).json(formattedHistory);
  } catch (error) {
    console.error('[historyRoute] Error retrieving history:', error);
    return res.status(500).json({ error: 'Failed to retrieve chat history' });
  }
});

// GET /api/history/:id - Retrieve single chat detail
router.get('/:id', async (req, res) => {
  try {
    if (dbFallback.isOffline()) {
      const chat = dbFallback.getChatById(req.params.id);
      if (!chat) {
        return res.status(404).json({ error: 'Chat history not found' });
      }
      return res.status(200).json(chat);
    }

    const chat = await Chat.findById(req.params.id);
    if (!chat) {
      return res.status(404).json({ error: 'Chat history not found' });
    }
    return res.status(200).json(chat);
  } catch (error) {
    console.error('[historyRoute] Error retrieving single chat:', error);
    return res.status(500).json({ error: 'Failed to retrieve conversation details' });
  }
});

// DELETE /api/history/:id - Delete a chat session
router.delete('/:id', async (req, res) => {
  try {
    if (dbFallback.isOffline()) {
      const success = dbFallback.deleteChat(req.params.id);
      if (!success) {
        return res.status(404).json({ error: 'Chat history not found' });
      }
      return res.status(200).json({ success: true, message: 'Chat history deleted successfully' });
    }

    const deletedChat = await Chat.findByIdAndDelete(req.params.id);
    if (!deletedChat) {
      return res.status(404).json({ error: 'Chat history not found' });
    }
    return res.status(200).json({ success: true, message: 'Chat history deleted successfully' });
  } catch (error) {
    console.error('[historyRoute] Error deleting chat:', error);
    return res.status(500).json({ error: 'Failed to delete chat history' });
  }
});

module.exports = router;
