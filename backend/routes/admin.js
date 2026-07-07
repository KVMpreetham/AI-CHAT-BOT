const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const FAQ = require('../models/FAQ');
const dbFallback = require('../services/dbFallback');

// GET /api/admin/stats - Retrieve Admin Dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    if (dbFallback.isOffline()) {
      return res.status(200).json(dbFallback.getStats());
    }

    const totalConversations = await Chat.countDocuments();
    const totalFAQs = await FAQ.countDocuments();

    const allChats = await Chat.find({});
    let totalMessages = 0;
    allChats.forEach(c => {
      totalMessages += c.messages.length;
    });

    const intentDistribution = await Chat.aggregate([
      { $unwind: '$messages' },
      { $match: { 'messages.sender': 'bot' } },
      { $group: { _id: '$messages.intent', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const formattedIntents = intentDistribution.map(item => ({
      intent: item._id || 'Unknown',
      count: item.count
    }));

    const recentConversations = allChats
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5)
      .map(chat => ({
        _id: chat._id,
        title: chat.title,
        messageCount: chat.messages.length,
        createdAt: chat.createdAt
      }));

    return res.status(200).json({
      totalConversations,
      totalMessages,
      totalFAQs,
      intentDistribution: formattedIntents,
      recentConversations
    });
  } catch (error) {
    console.error('[adminRoute] Error getting admin stats:', error);
    return res.status(500).json({ error: 'Failed to retrieve admin stats' });
  }
});

module.exports = router;
