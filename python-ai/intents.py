# Intents mapping for SupportAI rule-based classifier

INTENTS = {
    "Greeting": {
        "keywords": [
            "hello", "hi", "hey", "good morning", "good afternoon", "good evening", 
            "greetings", "whats up", "howdy", "yo", "hola", "hi there", "hello there"
        ],
        "response": "Hello! I am SupportAI, your virtual customer assistant. How can I help you today?"
    },
    "Refund": {
        "keywords": [
            "refund", "return", "money back", "returns", "refund policy", "reimbursement", 
            "send back", "return item", "get refund", "damaged product", "cancel purchase"
        ],
        "response": "Products can be returned within 30 days of purchase for a full refund. The item must be unused, in its original packaging, and accompanied by the receipt. Refunds are processed back to your original payment method within 5-7 business days once we receive the item."
    },
    "Order": {
        "keywords": [
            "order", "track", "tracking", "track order", "order status", "find order", 
            "where is my order", "order details", "purchase status", "shipment tracker"
        ],
        "response": "To track your order, please provide your 5-digit Order ID (e.g., ORD12345). You can find this in your confirmation email or order history in your account dashboard."
    },
    "Delivery": {
        "keywords": [
            "delivery", "shipping", "shipment", "delivery time", "how long", "courier", 
            "transit", "delivered", "shipping cost", "delivery options", "late delivery"
        ],
        "response": "Standard shipping takes 3 to 5 business days, while express delivery takes 1 to 2 business days. Shipping is free for orders over $50. You will receive a tracking link via email as soon as your package leaves our warehouse."
    },
    "Payment": {
        "keywords": [
            "payment", "pay", "credit card", "debit card", "upi", "net banking", "paypal", 
            "payment methods", "google pay", "apple pay", "visa", "mastercard", "charge"
        ],
        "response": "We accept a wide range of payment options including UPI, Debit Card, Credit Card (Visa, MasterCard, Amex), Net Banking, PayPal, Apple Pay, and Google Pay. All transactions are fully encrypted and secure."
    },
    "Contact": {
        "keywords": [
            "contact", "support", "help", "email", "phone", "call", "agent", "human", 
            "reach us", "customer care", "representative", "chat with person", "number"
        ],
        "response": "You can reach our customer support team 24/7 at support@example.com or call us toll-free at +1 (800) 555-0199. You can also raise a support ticket directly from your account page."
    },
    "Product": {
        "keywords": [
            "product", "item", "specs", "warranty", "catalog", "features", "details", 
            "quality", "size", "colors", "price", "stock", "availability", "specification"
        ],
        "response": "We stand behind the quality of our products. All physical items come with a comprehensive 1-year manufacturer warranty. You can find detailed descriptions, reviews, and specifications directly on the product's detail page in our catalog."
    },
    "Goodbye": {
        "keywords": [
            "bye", "goodbye", "see you", "thank you", "thanks", "done", "exit", 
            "farewell", "have a nice day", "talk later", "quit", "appreciate"
        ],
        "response": "Thank you for chatting with SupportAI! If you need anything else, just ask. Have a great day!"
    },
    "Unknown": {
        "keywords": [],
        "response": "I'm sorry, I couldn't quite match that to our standard query categories. Could you please rephrase your question? Alternatively, you can type 'Contact Support' to get in touch with our team."
    }
}
