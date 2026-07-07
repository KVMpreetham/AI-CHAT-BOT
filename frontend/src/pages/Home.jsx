import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import ChatWindow from '../components/ChatWindow';
import InputBox from '../components/InputBox';
import { useChat } from '../hooks/useChat';
import { api } from '../services/api';
import { FaTrash, FaPlus, FaCheck, FaCommentAlt, FaTags, FaChartBar, FaEye } from 'react-icons/fa';
import styles from './Home.module.css';

export const Home = () => {
  const {
    chats,
    activeChatId,
    messages,
    sending,
    sendMessage,
    selectChat,
    startNewChat,
    deleteChat
  } = useChat();

  const [theme, setTheme] = useState('dark');
  const [currentView, setCurrentView] = useState('chat'); // 'chat' or 'admin'
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Admin Dashboard State
  const [activeAdminTab, setActiveAdminTab] = useState('stats'); // 'stats', 'faqs', 'chats'
  const [stats, setStats] = useState(null);
  const [faqs, setFaqs] = useState([]);
  const [adminChats, setAdminChats] = useState([]);
  const [selectedAdminChat, setSelectedAdminChat] = useState(null);
  const [faqForm, setFaqForm] = useState({ question: '', answer: '', intent: '', category: 'General' });
  const [adminLoading, setAdminLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Handle HTML document theme attribute updates
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Load Admin Data when switching views
  useEffect(() => {
    if (currentView === 'admin') {
      loadAdminData();
    }
  }, [currentView, activeAdminTab]);

  const loadAdminData = async () => {
    setAdminLoading(true);
    try {
      if (activeAdminTab === 'stats') {
        const statsData = await api.getAdminStats();
        setStats(statsData);
      } else if (activeAdminTab === 'faqs') {
        const faqsData = await api.getFAQs();
        setFaqs(faqsData);
      } else if (activeAdminTab === 'chats') {
        const historyData = await api.getHistory();
        setAdminChats(historyData);
      }
    } catch (err) {
      console.error('Failed to load admin panel data:', err);
    } finally {
      setAdminLoading(false);
    }
  };

  const handleAddFaq = async (e) => {
    e.preventDefault();
    if (!faqForm.question || !faqForm.answer || !faqForm.intent) return;
    try {
      await api.addFAQ(faqForm);
      setSuccessMsg('FAQ added successfully!');
      setFaqForm({ question: '', answer: '', intent: '', category: 'General' });
      setTimeout(() => setSuccessMsg(''), 3000);
      loadAdminData(); // Refresh list
    } catch (err) {
      console.error('Failed to save FAQ:', err);
    }
  };

  const handleDeleteFaq = async (id) => {
    if (!window.confirm('Are you sure you want to delete this FAQ?')) return;
    try {
      await api.deleteFAQ(id);
      loadAdminData();
    } catch (err) {
      console.error('Failed to delete FAQ:', err);
    }
  };

  const inspectChatLogs = async (chatId) => {
    try {
      const details = await api.getChatDetails(chatId);
      setSelectedAdminChat(details);
    } catch (err) {
      console.error('Failed to inspect chat:', err);
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar - Rendered in Chat view, and hidden or custom in admin view */}
      {currentView === 'chat' && (
        <Sidebar
          chats={chats}
          activeChatId={activeChatId}
          onSelectChat={selectChat}
          onStartNewChat={startNewChat}
          onDeleteChat={deleteChat}
          mobileOpen={mobileSidebarOpen}
          setMobileOpen={setMobileSidebarOpen}
        />
      )}

      <div className="main-content">
        <Header
          theme={theme}
          setTheme={setTheme}
          currentView={currentView}
          setCurrentView={setCurrentView}
          setMobileSidebarOpen={setMobileSidebarOpen}
        />

        {/* View Switcher: Chat or Admin Dashboard */}
        {currentView === 'chat' ? (
          <div className={styles.chatAreaContainer}>
            <ChatWindow
              messages={messages}
              sending={sending}
              onSendMessage={sendMessage}
            />
            <InputBox onSendMessage={sendMessage} sending={sending} />
          </div>
        ) : (
          /* Admin Dashboard Container */
          <div className={styles.adminContainer}>
            {/* Admin navigation bar */}
            <div className={styles.adminSidebar}>
              <button
                className={`${styles.adminNavBtn} ${activeAdminTab === 'stats' ? styles.activeTab : ''}`}
                onClick={() => { setActiveAdminTab('stats'); setSelectedAdminChat(null); }}
              >
                <FaChartBar /> Dashboard
              </button>
              <button
                className={`${styles.adminNavBtn} ${activeAdminTab === 'faqs' ? styles.activeTab : ''}`}
                onClick={() => { setActiveAdminTab('faqs'); setSelectedAdminChat(null); }}
              >
                <FaTags /> Manage FAQs
              </button>
              <button
                className={`${styles.adminNavBtn} ${activeAdminTab === 'chats' ? styles.activeTab : ''}`}
                onClick={() => { setActiveAdminTab('chats'); setSelectedAdminChat(null); }}
              >
                <FaCommentAlt /> User Chat Logs
              </button>
            </div>

            {/* Admin Content Pane */}
            <div className={styles.adminContent}>
              {adminLoading ? (
                <div className={styles.spinnerWrapper}>
                  <div className={styles.spinner}></div>
                  <span>Loading dashboard data...</span>
                </div>
              ) : activeAdminTab === 'stats' && stats ? (
                /* 1. Statistics Cards View */
                <div className={styles.dashboardView}>
                  <h2 className={styles.sectionTitle}>Dashboard Overview</h2>
                  <div className={styles.statsGrid}>
                    <div className={styles.statCard}>
                      <h3>Total Chats</h3>
                      <p className={styles.statValue}>{stats.totalConversations}</p>
                    </div>
                    <div className={styles.statCard}>
                      <h3>Total Messages</h3>
                      <p className={styles.statValue}>{stats.totalMessages}</p>
                    </div>
                    <div className={styles.statCard}>
                      <h3>Database FAQs</h3>
                      <p className={styles.statValue}>{stats.totalFAQs}</p>
                    </div>
                  </div>

                  {/* Aggregated Intent chart lists */}
                  <div className={styles.chartsGrid}>
                    <div className={styles.chartCard}>
                      <h3>Intent Classifier Distribution</h3>
                      {stats.intentDistribution.length === 0 ? (
                        <p className={styles.noData}>No classifications stored yet.</p>
                      ) : (
                        <div className={styles.intentBarList}>
                          {stats.intentDistribution.map((item, idx) => {
                            // Find percentage
                            const total = stats.intentDistribution.reduce((acc, curr) => acc + curr.count, 0);
                            const percent = ((item.count / total) * 100).toFixed(0);
                            return (
                              <div key={idx} className={styles.intentBarRow}>
                                <div className={styles.barLabels}>
                                  <span className={styles.intentName}>{item.intent}</span>
                                  <span className={styles.intentCount}>{item.count} hits ({percent}%)</span>
                                </div>
                                <div className={styles.barProgressTrack}>
                                  <div
                                    className={styles.barProgressBar}
                                    style={{ width: `${percent}%` }}
                                  ></div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Recent exchanges list */}
                    <div className={styles.chartCard}>
                      <h3>Recent Chats</h3>
                      {stats.recentConversations.length === 0 ? (
                        <p className={styles.noData}>No recent activities.</p>
                      ) : (
                        <div className={styles.recentList}>
                          {stats.recentConversations.map((c, idx) => (
                            <div key={idx} className={styles.recentRow}>
                              <div className={styles.recentInfo}>
                                <h4 className={styles.recentTitle}>{c.title}</h4>
                                <span className={styles.recentMeta}>
                                  {c.messageCount} messages • {new Date(c.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <button
                                onClick={() => { setActiveAdminTab('chats'); inspectChatLogs(c._id); }}
                                className={styles.inspectBtn}
                                title="Inspect Logs"
                              >
                                <FaEye />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : activeAdminTab === 'faqs' ? (
                /* 2. Manage FAQs view */
                <div className={styles.faqManagerView}>
                  <div className={styles.faqFlexContainer}>
                    {/* List FAQs */}
                    <div className={styles.faqListContainer}>
                      <h2 className={styles.sectionTitle}>System FAQ Configuration</h2>
                      <div className={styles.faqTableList}>
                        {faqs.map((faq) => (
                          <div key={faq._id} className={styles.faqCardItem}>
                            <div className={styles.faqCardHeader}>
                              <span className={styles.faqIntentBadge}>{faq.intent}</span>
                              <span className={styles.faqCategory}>{faq.category}</span>
                            </div>
                            <h4 className={styles.faqQuestion}>Q: {faq.question}</h4>
                            <p className={styles.faqAnswer}>A: {faq.answer}</p>
                            <div className={styles.faqCardActions}>
                              {faq.isCustom && (
                                <span className={styles.customBadge}>Custom Override</span>
                              )}
                              <button
                                onClick={() => handleDeleteFaq(faq._id)}
                                className={styles.deleteFaqBtn}
                                title="Delete FAQ"
                              >
                                <FaTrash /> Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Form to add/overwrite FAQ */}
                    <div className={styles.faqFormContainer}>
                      <h3 className={styles.formTitle}>Add / Override FAQ</h3>
                      {successMsg && (
                        <div className={styles.successBanner}>
                          <FaCheck /> {successMsg}
                        </div>
                      )}
                      <form onSubmit={handleAddFaq} className={styles.faqForm}>
                        <div className={styles.formGroup}>
                          <label>Intent Classification</label>
                          <select
                            value={faqForm.intent}
                            onChange={(e) => setFaqForm({ ...faqForm, intent: e.target.value })}
                            required
                            className={styles.formInput}
                          >
                            <option value="">-- Select Intent --</option>
                            <option value="Greeting">Greeting</option>
                            <option value="Refund">Refund</option>
                            <option value="Order">Order</option>
                            <option value="Delivery">Delivery</option>
                            <option value="Payment">Payment</option>
                            <option value="Contact">Contact</option>
                            <option value="Product">Product</option>
                            <option value="Goodbye">Goodbye</option>
                          </select>
                          <small className={styles.helpText}>Setting an FAQ overrides the default AI response for this category.</small>
                        </div>

                        <div className={styles.formGroup}>
                          <label>Category Group</label>
                          <input
                            type="text"
                            placeholder="e.g. Billing, General, Shipping"
                            value={faqForm.category}
                            onChange={(e) => setFaqForm({ ...faqForm, category: e.target.value })}
                            className={styles.formInput}
                          />
                        </div>

                        <div className={styles.formGroup}>
                          <label>Question String</label>
                          <textarea
                            placeholder="Describe what query this answers..."
                            value={faqForm.question}
                            onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
                            required
                            rows={2}
                            className={styles.formInput}
                          />
                        </div>

                        <div className={styles.formGroup}>
                          <label>Bot Answer</label>
                          <textarea
                            placeholder="The response the chatbot should return..."
                            value={faqForm.answer}
                            onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
                            required
                            rows={4}
                            className={styles.formInput}
                          />
                        </div>

                        <button type="submit" className={styles.submitBtn}>
                          <FaPlus /> Update FAQ Configuration
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              ) : (
                /* 3. Conversations Audit view */
                <div className={styles.chatLogsView}>
                  <h2 className={styles.sectionTitle}>User Conversation History Audit</h2>
                  <div className={styles.logsFlexGrid}>
                    {/* Left Logs List */}
                    <div className={styles.logsListSide}>
                      {adminChats.length === 0 ? (
                        <p className={styles.noData}>No exchanges recorded in DB yet.</p>
                      ) : (
                        <div className={styles.logsItemList}>
                          {adminChats.map((c) => (
                            <button
                              key={c._id}
                              className={`${styles.logListItem} ${selectedAdminChat?._id === c._id ? styles.selectedLogItem : ''}`}
                              onClick={() => inspectChatLogs(c._id)}
                            >
                              <div className={styles.logTitle}>{c.title}</div>
                              <div className={styles.logMeta}>
                                {c.messageCount} messages • {new Date(c.createdAt).toLocaleTimeString()}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Right Inspector Box */}
                    <div className={styles.inspectorSide}>
                      {selectedAdminChat ? (
                        <div className={styles.inspectorContainer}>
                          <div className={styles.inspectorHeader}>
                            <h3>Chat: "{selectedAdminChat.title}"</h3>
                            <span className={styles.inspectorMeta}>ID: {selectedAdminChat._id}</span>
                          </div>
                          <div className={styles.inspectorScroll}>
                            {selectedAdminChat.messages.map((m, index) => {
                              const isBot = m.sender === 'bot';
                              return (
                                <div
                                  key={index}
                                  className={`${styles.inspectorMsg} ${isBot ? styles.inspectBot : styles.inspectUser}`}
                                >
                                  <div className={styles.inspectorLabel}>
                                    {isBot ? 'Bot' : 'User'}
                                  </div>
                                  <div className={styles.inspectorBubble}>
                                    <div className={styles.inspectText}>{m.text}</div>
                                  </div>
                                  {isBot && m.intent && (
                                    <div className={styles.inspectIntent}>
                                      Classified Intent: <span>{m.intent}</span>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className={styles.inspectorPlaceholder}>
                          <FaCommentAlt />
                          <p>Select a conversation from the sidebar to inspect full exchange transcripts and classifications.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
