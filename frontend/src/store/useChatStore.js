import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { sendQuery } from '../api/chatApi';

export const useChatStore = create(
  persist(
    (set, get) => ({
      messages: [],
      selectedData: null,
      loading: false,

      askQuestion: async (input) => {
        set({ loading: true });
        const history = get().messages;

        const userMsg = { role: 'user', content: input };
        set((state) => ({ messages: [...state.messages, userMsg] }));

        try {
          const data = await sendQuery(input, history);

          const botMsg = {
            role: 'assistant',
            content: data.answer,
            metadata: data.metadata,
            sources: data.sources
          };

          set((state) => ({
            messages: [...state.messages, botMsg],
            selectedData: botMsg,
            loading: false
          }));
        } catch (error) {
          set({ loading: false });
          set((state) => ({
            messages: [...state.messages, { role: 'assistant', content: "Error: Backend unreachable." }]
          }));
        }
      },

      setSelectedData: (data) => set({ selectedData: data }),

      clearSession: () => {
        set({ messages: [], selectedData: null });
        localStorage.removeItem('clearpath-chat-storage');
      },
    }),
    {
      name: 'clearpath-chat-storage',
    }
  )
);