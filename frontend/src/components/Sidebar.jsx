import React, { useState } from 'react';
import { FaPlus, FaSearch, FaTrash, FaCommentAlt, FaTimes } from 'react-icons/fa';
import styles from './Sidebar.module.css';

export const Sidebar = ({
  chats,
  activeChatId,
  onSelectChat,
  onStartNewChat,
  onDeleteChat,
  mobileOpen,
  setMobileOpen
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter chats by search term
  const filteredChats = chats.filter((c) =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectChat = (chatId) => {
    onSelectChat(chatId);
    setMobileOpen(false); // Close mobile drawer when clicked
  };

  const handleNewChat = () => {
    onStartNewChat();
    setMobileOpen(false);
  };

  return (
    <aside className={`${styles.sidebar} ${mobileOpen ? styles.mobileOpen : ''}`}>
      {/* Mobile Header Close */}
      <div className={styles.mobileCloseRow}>
        <span className={styles.mobileTitle}>Conversations</span>
        <button className={styles.closeButton} onClick={() => setMobileOpen(false)}>
          <FaTimes />
        </button>
      </div>

      {/* New Chat Button */}
      <div className={styles.newChatWrapper}>
        <button className={styles.newChatButton} onClick={handleNewChat}>
          <FaPlus />
          <span>New Chat</span>
        </button>
      </div>

      {/* Search Conversations */}
      <div className={styles.searchWrapper}>
        <div className={styles.searchContainer}>
          <FaSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      {/* Chats List */}
      <div className={styles.chatListContainer}>
        <div className={styles.listSectionTitle}>Recent Chats</div>
        {filteredChats.length === 0 ? (
          <div className={styles.emptyState}>
            {searchTerm ? 'No matching chats' : 'No conversations yet'}
          </div>
        ) : (
          <div className={styles.chatList}>
            {filteredChats.map((c) => {
              const isActive = c._id === activeChatId;
              return (
                <div
                  key={c._id}
                  className={`${styles.chatItemWrapper} ${isActive ? styles.active : ''}`}
                >
                  <button
                    onClick={() => handleSelectChat(c._id)}
                    className={styles.chatItemButton}
                    title={c.title}
                  >
                    <FaCommentAlt className={styles.chatIcon} />
                    <span className={styles.chatTitle}>{c.title}</span>
                  </button>
                  <button
                    onClick={() => onDeleteChat(c._id)}
                    className={styles.deleteButton}
                    title="Delete Chat"
                  >
                    <FaTrash />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
