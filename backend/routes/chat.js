const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// POST /api/chat - Sends a message
router.post('/', chatController.handleMessage);

module.exports = router;
