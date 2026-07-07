import React, { useState } from 'react';
import { FaPaperPlane, FaMicrophone, FaPaperclip } from 'react-icons/fa';
import styles from './InputBox.module.css';

export const InputBox = ({ onSendMessage, sending }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() || sending) return;
    onSendMessage(text);
    setText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSubmit(e);
    }
  };

  return (
    <form className={styles.inputForm} onSubmit={handleSubmit}>
      <div className={styles.inputContainer}>
        {/* Attachment UI button */}
        <button
          type="button"
          className={styles.iconButton}
          title="Attach files (UI simulation)"
          onClick={() => alert("Attachment feature is simulated in this portfolio demo.")}
        >
          <FaPaperclip />
        </button>

        {/* Text Input */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message SupportAI..."
          className={styles.textarea}
          rows={1}
          disabled={sending}
        />

        {/* Voice Input UI button */}
        <button
          type="button"
          className={styles.iconButton}
          title="Voice input (UI simulation)"
          onClick={() => alert("Voice input feature is simulated in this portfolio demo.")}
        >
          <FaMicrophone />
        </button>

        {/* Send Button */}
        <button
          type="submit"
          className={`${styles.sendButton} ${text.trim() && !sending ? styles.active : ''}`}
          disabled={!text.trim() || sending}
        >
          <FaPaperPlane />
        </button>
      </div>
    </form>
  );
};

export default InputBox;
