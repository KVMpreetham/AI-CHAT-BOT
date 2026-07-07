import React from 'react';
import { motion } from 'framer-motion';
import Avatar from './Avatar';
import styles from './Message.module.css';

export const Message = ({ message }) => {
  const { sender, text, intent, timestamp } = message;
  const isBot = sender === 'bot';

  // Format timestamps
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    try {
      const date = new Date(timeStr);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  // Helper to parse basic Markdown-like double asterisks for bolding
  const renderMessageContent = (content) => {
    if (!content) return '';
    const parts = content.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className={styles.boldText}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <motion.div
      className={`${styles.messageWrapper} ${isBot ? styles.botWrapper : styles.userWrapper}`}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {!isBot && (
        <div className={styles.timeWrapperOuter}>
          <span className={styles.timestamp}>{formatTime(timestamp)}</span>
        </div>
      )}
      
      <div className={styles.avatarWrapper}>
        <Avatar isBot={isBot} />
      </div>

      <div className={styles.bubbleAndMeta}>
        <div className={`${styles.bubble} ${isBot ? styles.botBubble : styles.userBubble}`}>
          <div className={styles.text}>{renderMessageContent(text)}</div>
        </div>
        
        {isBot && (
          <div className={styles.metaRow}>
            {intent && intent !== 'Unknown' && (
              <span className={styles.intentBadge} title="Classified Intent">
                {intent}
              </span>
            )}
            <span className={styles.timestamp}>{formatTime(timestamp)}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Message;
