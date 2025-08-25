import React, { createContext, useContext, useState, useEffect } from 'react';

const MessageContext = createContext();

export const useMessages = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error('useMessages must be used within a MessageProvider');
  }
  return context;
};

export const MessageProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [messages, setMessages] = useState([]);

  // Mock data for messages
  const mockMessages = [
    {
      id: 1,
      sender: { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
      recipient: { id: 1, name: 'John Doe', email: 'john@example.com' },
      subject: 'Weekly Report Update',
      message: 'Hi John, please send me the weekly sales report by Friday. Thanks!',
      status: 'read',
      created_at: '2024-01-20T10:30:00Z',
      read_at: '2024-01-20T11:15:00Z'
    },
    {
      id: 2,
      sender: { id: 1, name: 'John Doe', email: 'john@example.com' },
      recipient: { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
      subject: 'Inventory Check',
      message: 'Jane, I need to check the current inventory levels. Can you help me with that?',
      status: 'unread',
      created_at: '2024-01-19T14:20:00Z',
      read_at: null
    },
    {
      id: 3,
      sender: { id: 3, name: 'Bob Wilson', email: 'bob@example.com' },
      recipient: { id: 1, name: 'John Doe', email: 'john@example.com' },
      subject: 'Meeting Reminder',
      message: 'Don\'t forget about our team meeting tomorrow at 2 PM.',
      status: 'read',
      created_at: '2024-01-18T09:45:00Z',
      read_at: '2024-01-18T10:00:00Z'
    },
    {
      id: 4,
      sender: { id: 4, name: 'Alice Johnson', email: 'alice@example.com' },
      recipient: { id: 1, name: 'John Doe', email: 'john@example.com' },
      subject: 'New Project Update',
      message: 'Hi John, I wanted to update you on the new project status.',
      status: 'unread',
      created_at: '2024-01-20T15:30:00Z',
      read_at: null
    }
  ];

  useEffect(() => {
    // Simulate loading messages
    setTimeout(() => {
      setMessages(mockMessages);
      updateUnreadCount(mockMessages);
    }, 1000);
  }, []);

  const updateUnreadCount = (messageList) => {
    const currentUserId = 1; // Mock current user ID
    const unread = messageList.filter(msg => 
      msg.recipient.id === currentUserId && msg.status === 'unread'
    ).length;
    setUnreadCount(unread);
  };

  const markAsRead = (messageId) => {
    const updatedMessages = messages.map(msg => 
      msg.id === messageId 
        ? { ...msg, status: 'read', read_at: new Date().toISOString() }
        : msg
    );
    setMessages(updatedMessages);
    updateUnreadCount(updatedMessages);
  };

  const addMessage = (newMessage) => {
    const updatedMessages = [newMessage, ...messages];
    setMessages(updatedMessages);
    updateUnreadCount(updatedMessages);
  };

  const value = {
    messages,
    unreadCount,
    markAsRead,
    addMessage,
    updateUnreadCount
  };

  return (
    <MessageContext.Provider value={value}>
      {children}
    </MessageContext.Provider>
  );
};
