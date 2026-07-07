const axios = require('axios');

// Default backup responses matching our intents
const FALLBACK_INTENTS = {
  Greeting: {
    keywords: [/hello/i, /hi/i, /hey/i, /good morning/i, /good afternoon/i, /good evening/i, /whats up/i],
    response: "Hello! I am SupportAI, your virtual customer assistant. How can I help you today? (Backend Fallback)"
  },
  Refund: {
    keywords: [/refund/i, /return/i, /money back/i, /reimbursement/i, /cancel purchase/i],
    response: "Products can be returned within 30 days of purchase for a full refund. The item must be unused, in its original packaging, and accompanied by the receipt. (Backend Fallback)"
  },
  Order: {
    keywords: [/order/i, /track/i, /tracking/i, /where is my order/i, /status/i],
    response: "To track your order, please provide your 5-digit Order ID (e.g., ORD12345). You can find this in your confirmation email. (Backend Fallback)"
  },
  Delivery: {
    keywords: [/delivery/i, /shipping/i, /shipment/i, /how long/i, /courier/i],
    response: "Standard shipping takes 3 to 5 business days, while express delivery takes 1 to 2 business days. You will receive a tracking link via email as soon as your package leaves our warehouse. (Backend Fallback)"
  },
  Payment: {
    keywords: [/payment/i, /pay/i, /credit card/i, /debit card/i, /upi/i, /net banking/i, /paypal/i],
    response: "We accept a wide range of payment options including UPI, Debit Card, Credit Card (Visa, MasterCard, Amex), Net Banking, PayPal, Apple Pay, and Google Pay. (Backend Fallback)"
  },
  Contact: {
    keywords: [/contact/i, /support/i, /help/i, /email/i, /phone/i, /call/i, /agent/i, /human/i],
    response: "You can reach our customer support team 24/7 at support@example.com or call us toll-free at +1 (800) 555-0199. (Backend Fallback)"
  },
  Product: {
    keywords: [/product/i, /item/i, /specs/i, /warranty/i, /catalog/i, /features/i, /details/i],
    response: "We stand behind the quality of our products. All physical items come with a comprehensive 1-year manufacturer warranty. Specs can be found on individual product pages. (Backend Fallback)"
  },
  Goodbye: {
    keywords: [/bye/i, /goodbye/i, /see you/i, /thank you/i, /thanks/i],
    response: "Thank you for chatting with SupportAI! If you need anything else, just ask. Have a great day! (Backend Fallback)"
  }
};

/**
 * Perform a fast keyword-based fallback classification if Python Flask is offline.
 */
function classifyLocalFallback(message) {
  const text = message.toLowerCase();
  let bestIntent = 'Unknown';
  let maxScore = 0;

  for (const [intentName, intentData] of Object.entries(FALLBACK_INTENTS)) {
    let score = 0;
    for (const regex of intentData.keywords) {
      if (regex.test(text)) {
        score += 1;
      }
    }
    if (score > maxScore) {
      maxScore = score;
      bestIntent = intentName;
    }
  }

  const response = FALLBACK_INTENTS[bestIntent]?.response || "I'm sorry, I couldn't quite match that to our standard query categories. Could you please rephrase your question? Alternatively, you can type 'Contact Support' to get in touch with our team. (Backend Fallback)";
  
  return {
    intent: bestIntent,
    confidence: maxScore > 0 ? 0.75 : 0.0,
    response: response,
    source: 'backend-fallback-js'
  };
}

/**
 * Classifies a user query by calling the Python Flask microservice.
 * Falls back to local JS classification if the Flask service is unreachable.
 */
async function classifyMessage(message) {
  const pythonServiceUrl = process.env.PYTHON_AI_URL || 'http://localhost:8000/classify';
  
  try {
    const response = await axios.post(pythonServiceUrl, { message }, { timeout: 3000 });
    return {
      intent: response.data.intent,
      confidence: response.data.confidence,
      response: response.data.response,
      source: response.data.source || 'python-flask'
    };
  } catch (error) {
    console.warn(`[pythonService] Failed to contact Python NLP service: ${error.message}. Running local fallback classifier.`);
    return classifyLocalFallback(message);
  }
}

module.exports = {
  classifyMessage
};
