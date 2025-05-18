import React from 'react';
import { ChatProvider } from '@/contexts/ChatContext';
import ChatComponent from '@/components/chat/ChatComponent';

const Chat = () => {
  return (
    <ChatProvider>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Chat</h1>
        </div>
        <ChatComponent />
      </div>
    </ChatProvider>
  );
};

export default Chat;