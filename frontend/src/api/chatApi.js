import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' }
});

export const sendQuery = async (question, conversationId = null) => {
  try {
    const response = await api.post('/query', {
      question,
      conversation_id: conversationId,
    });


    return response.data;
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
    throw error;
  }
};