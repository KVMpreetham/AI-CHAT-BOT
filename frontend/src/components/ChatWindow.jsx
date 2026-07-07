import React, { useEffect, useRef } from 'react';
import Message from './Message';
import TypingIndicator from './TypingIndicator';
import { FaRobot, FaArrowRight } from 'react-icons/fa';
import styles from './ChatWindow.module.css';

export const ChatWindow = ({ messages, sending, onSendMessage }) => {
  const bottomRef = useRef(null);

  // Auto scroll to bottom of chat
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const suggestions = [
    { text: "What is your refund policy?", label: "Refund Policy" },
    { text: "Track my order ORD12345", label: "Order Tracking" },
    { text: "What payment methods do you accept?", label: "Payment Options" },
    { text: "How can I contact customer support?", label: "Contact Us" }
  ];

  return (
    <div className={styles.chatWindow}>
      {messages.length === 0 ? (
        <div className={styles.welcomeContainer}>
          <div className={styles.welcomeIcon}>
            <FaRobot />
          </div>
          <h2 className={styles.welcomeTitle}>Welcome to SupportAI</h2>
          <p className={styles.welcomeSubtitle}>
            Our AI-powered assistant is online and ready to answer your questions instantly.
            Get help with orders, delivery, refunds, payments, and specs.
          </p>

          <div className={styles.suggestionsGrid}>
            {suggestions.map((s, index) => (
              <button
                key={index}
                className={styles.suggestionCard}
                onClick={() => onSendMessage(s.text)}
              >
                <div className={styles.suggestionContent}>
                  <span className={styles.suggestionLabel}>{s.label}</span>
                  <span className={styles.suggestionText}>"{s.text}"</span>
                </div>
                <FaArrowRight className={styles.suggestionArrow} />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className={styles.messagesContainer}>
          {messages.map((message) => (
            <Message key={message._id} message={message} />
          ))}
          {sending && (
            <div className={styles.typingContainer}>
              <TypingIndicator />
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
