import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  // Chat endpoints
  sendMessage: async (message, chatId) => {
    const response = await apiClient.post('/chat', { message, chatId });
    return response.data;
  },

  // History endpoints
  getHistory: async () => {
    const response = await apiClient.get('/history');
    return response.data;
  },

  getChatDetails: async (chatId) => {
    const response = await apiClient.get(`/history/${chatId}`);
    return response.data;
  },

  deleteChat: async (chatId) => {
    const response = await apiClient.delete(`/history/${chatId}`);
    return response.data;
  },

  // FAQ endpoints
  getFAQs: async () => {
    const response = await apiClient.get('/faq');
    return response.data;
  },

  addFAQ: async (faqData) => {
    const response = await apiClient.post('/faq', faqData);
    return response.data;
  },

  deleteFAQ: async (faqId) => {
    const response = await apiClient.delete(`/faq/${faqId}`);
    return response.data;
  },

  // Admin endpoints
  getAdminStats: async () => {
    const response = await apiClient.get('/admin/stats');
    return response.data;
  },
};

export default api;
