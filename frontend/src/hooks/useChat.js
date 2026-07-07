import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

export const useChat = () => {
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  // Load chat history
  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      const history = await api.getHistory();
      setChats(history);
      setError(null);
    } catch (err) {
      console.error('Error fetching chat history:', err);
      setError('Failed to load chat history.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize and load history on mount
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Select a specific chat from history
  const selectChat = async (chatId) => {
    if (!chatId) return;
    setLoading(true);
    try {
      const chatDetails = await api.getChatDetails(chatId);
      setActiveChatId(chatDetails._id);
      setMessages(chatDetails.messages);
      setError(null);
    } catch (err) {
      console.error('Error fetching chat details:', err);
      setError('Failed to load chat conversation.');
    } finally {
      setLoading(false);
    }
  };

  // Start a new chat session
  const startNewChat = () => {
    setActiveChatId(null);
    setMessages([]);
  };

  // Send a message
  const sendMessage = async (text) => {
    if (!text.trim()) return;

    // 1. Temporarily append user message to UI for instant rendering
    const tempUserMessage = {
      _id: `temp-user-${Date.now()}`,
      sender: 'user',
      text: text,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMessage]);
    setSending(true);

    try {
      // 2. Call backend API
      const response = await api.sendMessage(text, activeChatId);
      
      // 3. Set active chat ID if it was a new chat
      if (!activeChatId) {
        setActiveChatId(response.chatId);
      }
      
      // 4. Update messages with actual database objects (user + bot messages)
      setMessages(response.chat.messages);
      
      // 5. Reload chat history sidebar to show new chat name or last message
      await loadHistory();
      setError(null);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
      
      // Remove the temporary message on error to keep UI in sync
      setMessages((prev) => prev.filter((m) => m._id !== tempUserMessage._id));
    } finally {
      setSending(false);
    }
  };

  // Delete a chat session
  const deleteChat = async (chatId) => {
    try {
      await api.deleteChat(chatId);
      
      // If deleted chat was the active one, clear active view
      if (activeChatId === chatId) {
        startNewChat();
      }
      
      // Refresh sidebar list
      await loadHistory();
    } catch (err) {
      console.error('Error deleting chat:', err);
      setError('Failed to delete chat session.');
    }
  };

  return {
    chats,
    activeChatId,
    messages,
    loading,
    sending,
    error,
    selectChat,
    startNewChat,
    sendMessage,
    deleteChat,
    loadHistory,
  };
};

export default useChat;
