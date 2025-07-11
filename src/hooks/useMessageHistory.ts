import { useState, useCallback } from 'react';

interface Message {
  id: string;
  type: 'user' | 'tutor' | 'hint';
  content: string;
  timestamp: Date;
}

export const useMessageHistory = () => {
  const [messages, setMessages] = useState<Message[]>([]);

  const addMessage = useCallback((message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessage: Message = {
      ...message,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  }, []);

  const addUserMessage = useCallback((content: string) => {
    return addMessage({ type: 'user', content });
  }, [addMessage]);

  const addTutorMessage = useCallback((content: string) => {
    return addMessage({ type: 'tutor', content });
  }, [addMessage]);

  const addHintMessage = useCallback((content: string) => {
    return addMessage({ type: 'hint', content });
  }, [addMessage]);

  const resetMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const getConversationHistory = useCallback(() => {
    return messages.map(msg => ({
      role: msg.type === 'user' ? 'user' as const : 'assistant' as const,
      content: msg.content
    }));
  }, [messages]);

  return {
    messages,
    addMessage,
    addUserMessage,
    addTutorMessage,
    addHintMessage,
    resetMessages,
    getConversationHistory
  };
};