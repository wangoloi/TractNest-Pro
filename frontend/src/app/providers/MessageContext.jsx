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

  // Generate mock messages using real users from localStorage
  const generateMockMessages = () => {
    try {
      const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const storedAdmins = JSON.parse(localStorage.getItem('admins') || '[]');
      
      // Combine users and admins
      const allUsers = [
        ...storedUsers.map(user => ({
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email
        })),
        ...storedAdmins.map(admin => ({
          id: `admin_${admin.id}`,
          name: `${admin.firstName} ${admin.lastName}`,
          email: admin.email
        }))
      ];
      
      // If we have real users, create messages with them
      if (allUsers.length > 0) {
        const messages = [];
        const subjects = [
          'Weekly Report Update',
          'Inventory Check',
          'Meeting Reminder',
          'New Project Update',
          'Sales Report Request',
          'System Maintenance Notice'
        ];
        
        const messageTexts = [
          'Please send me the weekly sales report by Friday. Thanks!',
          'I need to check the current inventory levels. Can you help me with that?',
          'Don\'t forget about our team meeting tomorrow at 2 PM.',
          'I wanted to update you on the new project status.',
          'Could you provide the latest sales figures?',
          'We will be performing system maintenance this weekend.'
        ];
        
        // Create some sample messages between real users
        for (let i = 0; i < Math.min(6, allUsers.length * 2); i++) {
          const sender = allUsers[i % allUsers.length];
          const recipient = allUsers[(i + 1) % allUsers.length];
          
          messages.push({
            id: i + 1,
            sender: sender,
            recipient: recipient,
            subject: subjects[i % subjects.length],
            message: messageTexts[i % messageTexts.length],
            status: i % 2 === 0 ? 'read' : 'unread',
            created_at: new Date(Date.now() - (i * 24 * 60 * 60 * 1000)).toISOString(),
            read_at: i % 2 === 0 ? new Date(Date.now() - (i * 24 * 60 * 60 * 1000) + 45 * 60 * 1000).toISOString() : null
          });
        }
        
        return messages;
      }
    } catch (error) {
      console.error('Error generating mock messages:', error);
    }
    
    // Fallback to original mock data if no real users found
    return [
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
      }
    ];
  };

  const mockMessages = generateMockMessages();

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

  const updateMessage = (messageId, updatedData) => {
    const updatedMessages = messages.map(msg => 
      msg.id === messageId 
        ? { ...msg, ...updatedData }
        : msg
    );
    setMessages(updatedMessages);
    updateUnreadCount(updatedMessages);
  };

  const value = {
    messages,
    unreadCount,
    markAsRead,
    addMessage,
    updateMessage,
    updateUnreadCount
  };

  return (
    <MessageContext.Provider value={value}>
      {children}
    </MessageContext.Provider>
  );
};
