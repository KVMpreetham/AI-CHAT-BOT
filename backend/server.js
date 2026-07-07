const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Models
const FAQ = require('./models/FAQ');
const Order = require('./models/Order');

// Routes
const chatRouter = require('./routes/chat');
const historyRouter = require('./routes/history');
const faqRouter = require('./routes/faq');
const adminRouter = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Database connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/supportai';

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Connected to MongoDB database successfully.');
    // Run Database Auto-Seeding
    await seedDatabase();
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err.message);
    console.warn('Backend server running. Ensure a local MongoDB instance is started at:', MONGO_URI);
  });

// Mount routes
app.use('/api/chat', chatRouter);
app.use('/api/history', historyRouter);
app.use('/api/faq', faqRouter);
app.use('/api/admin', adminRouter);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'SupportAI Express Backend API is running',
    version: '1.0.0'
  });
});

// Database seeding logic
async function seedDatabase() {
  try {
    // 1. Seed FAQs
    const faqCount = await FAQ.countDocuments();
    if (faqCount === 0) {
      console.log('[Seeder] Seeding default FAQs into database...');
      const defaultFAQs = [
        {
          question: "What is your refund policy?",
          answer: "Products can be returned within 30 days of purchase for a full refund. The item must be unused, in its original packaging, and accompanied by the receipt. Refunds are processed back to your original payment method within 5-7 business days once we receive the item.",
          intent: "Refund",
          category: "Billing",
          isCustom: false
        },
        {
          question: "How can I track my order?",
          answer: "To track your order, please provide your 5-digit Order ID (e.g., ORD12345). You can find this in your confirmation email or order history in your account dashboard.",
          intent: "Order",
          category: "Shipping",
          isCustom: false
        },
        {
          question: "What are the shipping and delivery times?",
          answer: "Standard shipping takes 3 to 5 business days, while express delivery takes 1 to 2 business days. Shipping is free for orders over $50. You will receive a tracking link via email as soon as your package leaves our warehouse.",
          intent: "Delivery",
          category: "Shipping",
          isCustom: false
        },
        {
          question: "What payment methods are supported?",
          answer: "We accept a wide range of payment options including UPI, Debit Card, Credit Card (Visa, MasterCard, Amex), Net Banking, PayPal, Apple Pay, and Google Pay. All transactions are fully encrypted and secure.",
          intent: "Payment",
          category: "Billing",
          isCustom: false
        },
        {
          question: "How do I contact customer support?",
          answer: "You can reach our customer support team 24/7 at support@example.com or call us toll-free at +1 (800) 555-0199. You can also raise a support ticket directly from your account page.",
          intent: "Contact",
          category: "General",
          isCustom: false
        },
        {
          question: "What specifications and warranty apply to your products?",
          answer: "We stand behind the quality of our products. All physical items come with a comprehensive 1-year manufacturer warranty. You can find detailed descriptions, reviews, and specifications directly on the product's detail page in our catalog.",
          intent: "Product",
          category: "General",
          isCustom: false
        },
        {
          question: "Hello / Start Chat",
          answer: "Hello! I am SupportAI, your virtual customer assistant. How can I help you today?",
          intent: "Greeting",
          category: "General",
          isCustom: false
        },
        {
          question: "Goodbye / End Chat",
          answer: "Thank you for chatting with SupportAI! If you need anything else, just ask. Have a great day!",
          intent: "Goodbye",
          category: "General",
          isCustom: false
        }
      ];
      await FAQ.insertMany(defaultFAQs);
      console.log(`[Seeder] Successfully seeded ${defaultFAQs.length} FAQs.`);
    }

    // 2. Seed Orders (for tracking simulation)
    const orderCount = await Order.countDocuments();
    if (orderCount === 0) {
      console.log('[Seeder] Seeding dummy Orders for simulation...');
      const dummyOrders = [
        {
          orderId: "ORD12345",
          status: "Out for delivery",
          deliveryDate: "Tomorrow by 5:00 PM",
          customerName: "Alice Johnson",
          customerEmail: "alice@example.com",
          items: [{ name: "SupportAI Pro License", quantity: 1, price: 99.99 }, { name: "USB Hub", quantity: 1, price: 30.00 }],
          totalAmount: 129.99
        },
        {
          orderId: "ORD54321",
          status: "Delivered",
          deliveryDate: "Delivered 2 days ago",
          customerName: "Bob Smith",
          customerEmail: "bob@example.com",
          items: [{ name: "Ergonomic Office Mouse", quantity: 1, price: 49.50 }],
          totalAmount: 49.50
        },
        {
          orderId: "ORD98765",
          status: "Shipped",
          deliveryDate: "Expected July 11, 2026",
          customerName: "Charlie Brown",
          customerEmail: "charlie@example.com",
          items: [{ name: "Mechanical Keyboard", quantity: 1, price: 150.00 }, { name: "Custom Keycaps", quantity: 1, price: 149.00 }],
          totalAmount: 299.00
        },
        {
          orderId: "ORD11111",
          status: "Processing",
          deliveryDate: "Pending Shipment",
          customerName: "David Miller",
          customerEmail: "david@example.com",
          items: [{ name: "Wireless Headphones", quantity: 1, price: 85.20 }],
          totalAmount: 85.20
        }
      ];
      await Order.insertMany(dummyOrders);
      console.log(`[Seeder] Successfully seeded ${dummyOrders.length} dummy Orders.`);
    }
  } catch (error) {
    console.error('[Seeder] Database seeding error:', error);
  }
}

app.listen(PORT, () => {
  console.log(`SupportAI Express backend is listening on port ${PORT}`);
});
