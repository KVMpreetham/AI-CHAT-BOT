const Chat = require('../models/Chat');
const FAQ = require('../models/FAQ');
const Order = require('../models/Order');
const pythonService = require('../services/pythonService');
const dbFallback = require('../services/dbFallback');

/**
 * Handle POST /api/chat - Sends a message to the chatbot
 */
exports.handleMessage = async (req, res) => {
  try {
    const { message, chatId } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'Message content is required' });
    }

    // ==========================================
    // IN-MEMORY FALLBACK MODE (MongoDB Offline)
    // ==========================================
    if (dbFallback.isOffline()) {
      let chat;
      if (chatId) {
        chat = dbFallback.getChatById(chatId);
        if (!chat) {
          return res.status(404).json({ error: 'Chat session not found' });
        }
      } else {
        const title = message.length > 35 ? `${message.substring(0, 32)}...` : message;
        chat = { title, messages: [] };
      }

      const classification = await pythonService.classifyMessage(message);
      let finalResponse = classification.response;
      const detectedIntent = classification.intent;

      const matchedFAQ = dbFallback.getFAQByIntent(detectedIntent);
      if (matchedFAQ) {
        finalResponse = matchedFAQ.answer;
      }

      if (detectedIntent === 'Order' || message.toLowerCase().includes('track') || message.toLowerCase().includes('ord')) {
        const orderIdRegex = /ORD\d{5}/i;
        const match = message.match(orderIdRegex);
        
        if (match) {
          const extractedId = match[0].toUpperCase();
          const order = dbFallback.getOrderById(extractedId);
          
          if (order) {
            finalResponse = `Order **${order.orderId}** status update: The status is currently **"${order.status}"**. Estimated delivery date: **${order.deliveryDate}**. Customer: ${order.customerName}.`;
          } else {
            finalResponse = `I found the order code **${extractedId}** in your message, but I couldn't locate it in our database. Please double-check your order number.`;
          }
        } else if (detectedIntent === 'Order') {
          finalResponse = `To track your order details, please provide your 5-digit Order ID (e.g., ORD12345). You can check your email receipt.`;
        }
      }

      chat.messages.push({
        sender: 'user',
        text: message,
        intent: 'User',
        timestamp: new Date()
      });

      chat.messages.push({
        sender: 'bot',
        text: finalResponse,
        intent: detectedIntent,
        timestamp: new Date()
      });

      if (chat.messages.length === 2) {
        chat.title = message.length > 35 ? `${message.substring(0, 32)}...` : message;
      }

      const savedChat = dbFallback.saveChat(chat);
      return res.status(200).json({
        chatId: savedChat._id,
        response: finalResponse,
        intent: detectedIntent,
        confidence: classification.confidence,
        source: classification.source,
        chat: savedChat
      });
    }

    // ==========================================
    // STANDARD DATABASE MODE (MongoDB Online)
    // ==========================================
    let chat;
    if (chatId) {
      chat = await Chat.findById(chatId);
      if (!chat) {
        return res.status(404).json({ error: 'Chat session not found' });
      }
    } else {
      const title = message.length > 35 ? `${message.substring(0, 32)}...` : message;
      chat = new Chat({ title, messages: [] });
    }

    const classification = await pythonService.classifyMessage(message);
    let finalResponse = classification.response;
    const detectedIntent = classification.intent;

    const matchedFAQ = await FAQ.findOne({ intent: detectedIntent });
    if (matchedFAQ) {
      finalResponse = matchedFAQ.answer;
    }

    if (detectedIntent === 'Order' || message.toLowerCase().includes('track') || message.toLowerCase().includes('ord')) {
      const orderIdRegex = /ORD\d{5}/i;
      const match = message.match(orderIdRegex);
      
      if (match) {
        const extractedId = match[0].toUpperCase();
        const order = await Order.findOne({ orderId: extractedId });
        
        if (order) {
          finalResponse = `Order **${order.orderId}** status update: The status is currently **"${order.status}"**. Estimated delivery date: **${order.deliveryDate}**. Customer: ${order.customerName}.`;
        } else {
          finalResponse = `I found the order code **${extractedId}** in your message, but I couldn't locate it in our database. Please double-check your order number or contact support.`;
        }
      } else if (detectedIntent === 'Order') {
        finalResponse = `To track your order details, please provide your 5-digit Order ID (e.g., ORD12345). You can check your email receipt or order status dashboard for this ID.`;
      }
    }

    chat.messages.push({
      sender: 'user',
      text: message,
      intent: 'User'
    });

    chat.messages.push({
      sender: 'bot',
      text: finalResponse,
      intent: detectedIntent
    });

    if (chat.messages.length === 2) {
      chat.title = message.length > 35 ? `${message.substring(0, 32)}...` : message;
    }

    await chat.save();

    return res.status(200).json({
      chatId: chat._id,
      response: finalResponse,
      intent: detectedIntent,
      confidence: classification.confidence,
      source: classification.source,
      chat
    });

  } catch (error) {
    console.error('[chatController] Error:', error);
    return res.status(500).json({ error: 'Internal server error processing chat message' });
  }
};
