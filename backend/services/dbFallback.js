// In-memory fallback datastore for SupportAI when MongoDB is offline
const mongoose = require('mongoose');

const mockChats = [];

const mockFAQs = [
  {
    _id: "faq_1",
    question: "What is your refund policy?",
    answer: "Products can be returned within 30 days of purchase for a full refund. The item must be unused, in its original packaging, and accompanied by the receipt. Refunds are processed back to your original payment method within 5-7 business days once we receive the item. (In-Memory DB)",
    intent: "Refund",
    category: "Billing",
    isCustom: false
  },
  {
    _id: "faq_2",
    question: "How can I track my order?",
    answer: "To track your order, please provide your 5-digit Order ID (e.g., ORD12345). You can find this in your confirmation email or order history in your account dashboard. (In-Memory DB)",
    intent: "Order",
    category: "Shipping",
    isCustom: false
  },
  {
    _id: "faq_3",
    question: "What are the shipping and delivery times?",
    answer: "Standard shipping takes 3 to 5 business days, while express delivery takes 1 to 2 business days. Shipping is free for orders over $50. You will receive a tracking link via email as soon as your package leaves our warehouse. (In-Memory DB)",
    intent: "Delivery",
    category: "Shipping",
    isCustom: false
  },
  {
    _id: "faq_4",
    question: "What payment methods are supported?",
    answer: "We accept a wide range of payment options including UPI, Debit Card, Credit Card (Visa, MasterCard, Amex), Net Banking, PayPal, Apple Pay, and Google Pay. All transactions are fully encrypted and secure. (In-Memory DB)",
    intent: "Payment",
    category: "Billing",
    isCustom: false
  },
  {
    _id: "faq_5",
    question: "How do I contact customer support?",
    answer: "You can reach our customer support team 24/7 at support@example.com or call us toll-free at +1 (800) 555-0199. You can also raise a support ticket directly from your account page. (In-Memory DB)",
    intent: "Contact",
    category: "General",
    isCustom: false
  },
  {
    _id: "faq_6",
    question: "What specifications and warranty apply to your products?",
    answer: "We stand behind the quality of our products. All physical items come with a comprehensive 1-year manufacturer warranty. You can find detailed descriptions, reviews, and specifications directly on the product's detail page in our catalog. (In-Memory DB)",
    intent: "Product",
    category: "General",
    isCustom: false
  },
  {
    _id: "faq_7",
    question: "Hello / Start Chat",
    answer: "Hello! I am SupportAI, your virtual customer assistant. How can I help you today? (In-Memory DB)",
    intent: "Greeting",
    category: "General",
    isCustom: false
  },
  {
    _id: "faq_8",
    question: "Goodbye / End Chat",
    answer: "Thank you for chatting with SupportAI! If you need anything else, just ask. Have a great day! (In-Memory DB)",
    intent: "Goodbye",
    category: "General",
    isCustom: false
  }
];

const mockOrders = [
  {
    orderId: "ORD12345",
    status: "Out for delivery",
    deliveryDate: "Tomorrow by 5:00 PM",
    customerName: "Alice Johnson",
    customerEmail: "alice@example.com",
    totalAmount: 129.99
  },
  {
    orderId: "ORD54321",
    status: "Delivered",
    deliveryDate: "Delivered 2 days ago",
    customerName: "Bob Smith",
    customerEmail: "bob@example.com",
    totalAmount: 49.50
  },
  {
    orderId: "ORD98765",
    status: "Shipped",
    deliveryDate: "Expected July 11, 2026",
    customerName: "Charlie Brown",
    customerEmail: "charlie@example.com",
    totalAmount: 299.00
  },
  {
    orderId: "ORD11111",
    status: "Processing",
    deliveryDate: "Pending Shipment",
    customerName: "David Miller",
    customerEmail: "david@example.com",
    totalAmount: 85.20
  }
];

const dbFallback = {
  isOffline: () => mongoose.connection.readyState !== 1,

  // Chats
  getChats: () => {
    return mockChats.map(c => ({
      _id: c._id,
      title: c.title,
      createdAt: c.createdAt,
      messageCount: c.messages.length,
      lastMessage: c.messages[c.messages.length - 1]?.text || ''
    })).sort((a, b) => b.createdAt - a.createdAt);
  },

  getChatById: (id) => {
    return mockChats.find(c => c._id === id) || null;
  },

  saveChat: (chatData) => {
    let chat;
    if (chatData._id) {
      chat = mockChats.find(c => c._id === chatData._id);
      if (chat) {
        chat.messages = chatData.messages;
        chat.title = chatData.title;
      }
    } else {
      chat = {
        _id: `mock_chat_${Date.now()}`,
        title: chatData.title || 'New Conversation',
        messages: chatData.messages || [],
        createdAt: new Date()
      };
      mockChats.push(chat);
    }
    return chat;
  },

  deleteChat: (id) => {
    const idx = mockChats.findIndex(c => c._id === id);
    if (idx !== -1) {
      mockChats.splice(idx, 1);
      return true;
    }
    return false;
  },

  // FAQs
  getFAQs: () => {
    return [...mockFAQs].sort((a, b) => a.intent.localeCompare(b.intent));
  },

  getFAQByIntent: (intent) => {
    return mockFAQs.find(f => f.intent === intent) || null;
  },

  saveFAQ: (faqData) => {
    const existing = mockFAQs.find(f => f.intent === faqData.intent);
    if (existing) {
      existing.question = faqData.question;
      existing.answer = faqData.answer;
      existing.category = faqData.category;
      existing.isCustom = true;
      existing.updatedAt = new Date();
      return existing;
    } else {
      const newFaq = {
        _id: `mock_faq_${Date.now()}`,
        question: faqData.question,
        answer: faqData.answer,
        intent: faqData.intent,
        category: faqData.category || 'General',
        isCustom: true,
        updatedAt: new Date()
      };
      mockFAQs.push(newFaq);
      return newFaq;
    }
  },

  deleteFAQ: (id) => {
    const idx = mockFAQs.findIndex(f => f._id === id);
    if (idx !== -1) {
      mockFAQs.splice(idx, 1);
      return true;
    }
    return false;
  },

  // Orders
  getOrderById: (orderId) => {
    return mockOrders.find(o => o.orderId.toUpperCase() === orderId.toUpperCase()) || null;
  },

  // Stats
  getStats: () => {
    const totalConversations = mockChats.length;
    const totalFAQs = mockFAQs.length;
    let totalMessages = 0;
    const intentMap = {};

    mockChats.forEach(c => {
      totalMessages += c.messages.length;
      c.messages.forEach(m => {
        if (m.sender === 'bot' && m.intent) {
          intentMap[m.intent] = (intentMap[m.intent] || 0) + 1;
        }
      });
    });

    const intentDistribution = Object.entries(intentMap).map(([intent, count]) => ({
      intent,
      count
    })).sort((a, b) => b.count - a.count);

    const recentConversations = [...mockChats]
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5)
      .map(c => ({
        _id: c._id,
        title: c.title,
        messageCount: c.messages.length,
        createdAt: c.createdAt
      }));

    return {
      totalConversations,
      totalMessages,
      totalFAQs,
      intentDistribution,
      recentConversations
    };
  }
};

module.exports = dbFallback;
