import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' }
});

export const sendQuery = async (question, history = [], conversationId = null) => {
  try {
    const response = await api.post('/query', {
      question,
      chat_history: history.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      conversation_id: conversationId,
    });

    return response.data;
  } catch (error) {
    console.error('API Error Details:', error.response?.data || error.message);
    throw error;
  }
};