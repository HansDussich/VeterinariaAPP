import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

const API_BASE_URL = 'https://localhost:7290';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  senderName: string;
  isRead: boolean;
}

interface Contact {
  id: string;
  name: string;
  role: string;
  unreadCount: number;
}

interface ChatContextType {
  messages: Message[];
  contacts: Contact[];
  selectedContact: string | null;
  setSelectedContact: (contactId: string | null) => void;
  sendMessage: (content: string) => Promise<void>;
  markAsRead: (messageId: string) => Promise<void>;
  isLoading: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat debe ser usado dentro de un ChatProvider');
  }
  return context;
};

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider = ({ children }: ChatProviderProps) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      fetchContacts();
    }
  }, [currentUser]);

  useEffect(() => {
    if (selectedContact) {
      fetchMessages();
    }
  }, [selectedContact]);

  const fetchContacts = async () => {
    try {
      setIsLoading(true);
      // Implementar lógica para obtener contactos según el rol del usuario
      const response = await axios.get(`${API_BASE_URL}/api/contacts`);
      setContacts(response.data);
    } catch (error) {
      console.error('Error al cargar contactos:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los contactos',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async () => {
    if (!selectedContact) return;

    try {
      setIsLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/messages/${selectedContact}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error al cargar mensajes:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los mensajes',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || !selectedContact || !currentUser) return;

    try {
      const messageData = {
        senderId: currentUser.id,
        receiverId: selectedContact,
        content,
        timestamp: new Date().toISOString(),
      };

      const response = await axios.post(`${API_BASE_URL}/api/messages`, messageData);
      setMessages(prev => [...prev, response.data]);
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      toast({
        title: 'Error',
        description: 'No se pudo enviar el mensaje',
        variant: 'destructive',
      });
    }
  };

  const markAsRead = async (messageId: string) => {
    try {
      await axios.put(`${API_BASE_URL}/api/messages/${messageId}/read`);
      setMessages(prev =>
        prev.map(msg =>
          msg.id === messageId ? { ...msg, isRead: true } : msg
        )
      );
    } catch (error) {
      console.error('Error al marcar mensaje como leído:', error);
    }
  };

  const value = {
    messages,
    contacts,
    selectedContact,
    setSelectedContact,
    sendMessage,
    markAsRead,
    isLoading,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};