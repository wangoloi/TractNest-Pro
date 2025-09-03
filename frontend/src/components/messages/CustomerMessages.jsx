import React, { useState, useEffect } from 'react';
import { Send, Plus, Search, Filter, RefreshCw, User, MessageSquare, Clock, Check, CheckCheck } from 'lucide-react';
import DataTable from '../ui/tables/DataTable';
import Modal from '../ui/modals/Modal';
import Dropdown from '../ui/forms/Dropdown';
import { useMessages } from '../../app/providers/MessageContext';

const Messages = () => {
  const { messages, markAsRead, addMessage, updateMessage } = useMessages();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [composeData, setComposeData] = useState({
    recipient: '',
    subject: '',
    message: ''
  });
  const [editData, setEditData] = useState({
    subject: '',
    message: ''
  });

  // Load real users from localStorage
  const loadUsers = () => {
    setLoading(true);
    try {
      // Get users from localStorage
      const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const storedAdmins = JSON.parse(localStorage.getItem('admins') || '[]');
      
      // Combine users and admins, ensuring unique IDs
      const allUsers = [
        ...storedUsers.map(user => ({
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          email: user.email,
          role: 'user'
        })),
        ...storedAdmins.map(admin => ({
          id: `admin_${admin.id}`,
          name: `${admin.firstName} ${admin.lastName}`,
          email: admin.email,
          role: 'admin'
        }))
      ];
      
      // Remove duplicates based on email
      const uniqueUsers = allUsers.filter((user, index, self) => 
        index === self.findIndex(u => u.email === user.email)
      );
      
      setUsers(uniqueUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      // Fallback to mock data if there's an error
      const fallbackUsers = [
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'user' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'admin' },
        { id: 3, name: 'Bob Wilson', email: 'bob@example.com', role: 'user' },
        { id: 4, name: 'Alice Johnson', email: 'alice@example.com', role: 'user' }
      ];
      setUsers(fallbackUsers);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const columns = [
    {
      key: 'sender',
      header: 'From',
      accessor: (msg) => msg.sender.name,
      render: (msg) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <User size={16} className="text-blue-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-white">{msg.sender.name}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{msg.sender.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'recipient',
      header: 'To',
      accessor: (msg) => msg.recipient.name,
      render: (msg) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <User size={16} className="text-green-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-white">{msg.recipient.name}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{msg.recipient.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'subject',
      header: 'Subject',
      accessor: (msg) => msg.subject,
             render: (msg) => (
         <div className="max-w-xs">
           <div className="font-medium text-gray-900 dark:text-white truncate">
             {msg.subject}
             {msg.is_edited && (
               <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">(edited)</span>
             )}
           </div>
           <div className="text-sm text-gray-500 dark:text-gray-400 truncate">{msg.message.substring(0, 50)}...</div>
         </div>
       )
    },
    {
      key: 'status',
      header: 'Status',
      accessor: (msg) => msg.status,
      render: (msg) => (
        <div className="flex items-center gap-2">
          {msg.status === 'read' ? (
            <CheckCheck size={16} className="text-green-600" />
          ) : (
            <Check size={16} className="text-gray-400" />
          )}
          <span className={`text-xs px-2 py-1 rounded-full ${
            msg.status === 'read' 
              ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300' 
              : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
          }`}>
            {msg.status}
          </span>
        </div>
      )
    },
    {
      key: 'created_at',
      header: 'Date',
      accessor: (msg) => msg.created_at,
      render: (msg) => (
        <div className="flex items-center gap-1">
          <Clock size={14} className="text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {new Date(msg.created_at).toLocaleDateString()}
          </span>
        </div>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (msg) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleViewMessage(msg)}
            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
            title="View Message"
          >
            <MessageSquare size={16} />
          </button>
          {/* Only show edit button for messages sent by current user */}
          {(() => {
            const currentUserData = JSON.parse(localStorage.getItem('currentUser') || '{}');
            const currentUserId = currentUserData.id || 1;
            return msg.sender.id === currentUserId || msg.sender.email === currentUserData.email;
          })() && (
            <button
              onClick={() => handleEditMessage(msg)}
              className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
              title="Edit Message"
            >
              <svg size={16} className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
        </div>
      )
    }
  ];

  const handleCompose = () => {
    setComposeData({
      recipient: '',
      subject: '',
      message: ''
    });
    setShowComposeModal(true);
  };

  const handleViewMessage = (message) => {
    setSelectedMessage(message);
    setShowViewModal(true);
    // Mark as read if unread
    if (message.status === 'unread') {
      markAsRead(message.id);
    }
  };

  const handleEditMessage = (message) => {
    setEditingMessage(message);
    setEditData({
      subject: message.subject,
      message: message.message
    });
    setShowEditModal(true);
  };

  const handleUpdateMessage = (e) => {
    e.preventDefault();
    
    if (editingMessage) {
      const updatedData = {
        subject: editData.subject,
        message: editData.message,
        edited_at: new Date().toISOString(),
        is_edited: true
      };
      
      // Update the message in the context
      updateMessage(editingMessage.id, updatedData);
      
      setShowEditModal(false);
      setEditingMessage(null);
      setEditData({ subject: '', message: '' });
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    const recipient = users.find(user => user.id === composeData.recipient);
    
    // Get current user from localStorage
    const currentUserData = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const currentUser = {
      id: currentUserData.id || 1,
      name: currentUserData.name || `${currentUserData.firstName || ''} ${currentUserData.lastName || ''}`.trim() || 'Current User',
      email: currentUserData.email || 'current@example.com'
    };
    
    const newMessage = {
      id: Date.now(),
      sender: currentUser,
      recipient: recipient,
      subject: composeData.subject,
      message: composeData.message,
      status: 'unread',
      created_at: new Date().toISOString(),
      read_at: null
    };
    
    addMessage(newMessage);
    setShowComposeModal(false);
    setComposeData({ recipient: '', subject: '', message: '' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setComposeData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const recipientOptions = users.map(user => ({
    value: user.id.toString(),
    label: `${user.name} (${user.email})`
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Messages</h1>
          <p className="text-gray-600 dark:text-gray-400">Send and receive messages within your organization</p>
        </div>
        <button
          onClick={handleCompose}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Compose Message
        </button>
      </div>

      {/* Data Table */}
      <DataTable
        data={messages}
        columns={columns}
        loading={loading}
        showSearch={true}
        showFilters={true}
        showExport={true}
        pageSize={10}
        pageSizeOptions={[5, 10, 25, 50]}
      />

      {/* Compose Message Modal */}
      <Modal
        isOpen={showComposeModal}
        onClose={() => setShowComposeModal(false)}
        title="Compose Message"
      >
        <form onSubmit={handleSendMessage} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              To
            </label>
            <Dropdown
              options={recipientOptions}
              value={composeData.recipient}
              onChange={(value) => setComposeData(prev => ({ ...prev, recipient: value }))}
              placeholder="Select recipient..."
              searchable={true}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Subject
            </label>
            <input
              type="text"
              name="subject"
              value={composeData.subject}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Message
            </label>
            <textarea
              name="message"
              value={composeData.message}
              onChange={handleInputChange}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowComposeModal(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Send size={16} />
              Send Message
            </button>
          </div>
        </form>
      </Modal>

      {/* View Message Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title={selectedMessage?.subject || 'Message'}
      >
        {selectedMessage && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">From:</span>
                <p className="text-gray-900 dark:text-white">{selectedMessage.sender.name}</p>
                <p className="text-gray-500 dark:text-gray-400">{selectedMessage.sender.email}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">To:</span>
                <p className="text-gray-900 dark:text-white">{selectedMessage.recipient.name}</p>
                <p className="text-gray-500 dark:text-gray-400">{selectedMessage.recipient.email}</p>
              </div>
            </div>
            
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Date:</span>
              <p className="text-gray-900 dark:text-white">
                {new Date(selectedMessage.created_at).toLocaleString()}
              </p>
            </div>
            
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Message:</span>
                           <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
               <p className="text-gray-900 dark:text-white whitespace-pre-wrap">{selectedMessage.message}</p>
               {selectedMessage.is_edited && (
                 <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                   Edited on {new Date(selectedMessage.edited_at).toLocaleString()}
                 </p>
               )}
             </div>
           </div>
           
                       <div className="flex justify-end gap-2 pt-4">
              {(() => {
                const currentUserData = JSON.parse(localStorage.getItem('currentUser') || '{}');
                const currentUserId = currentUserData.id || 1;
                return selectedMessage.sender.id === currentUserId || selectedMessage.sender.email === currentUserData.email;
              })() && (
               <button
                 onClick={() => {
                   setShowViewModal(false);
                   handleEditMessage(selectedMessage);
                 }}
                 className="px-4 py-2 text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/20 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/40 transition-colors"
               >
                 Edit Message
               </button>
             )}
             <button
               onClick={() => setShowViewModal(false)}
               className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
             >
               Close
             </button>
           </div>
          </div>
                 )}
       </Modal>

       {/* Edit Message Modal */}
       <Modal
         isOpen={showEditModal}
         onClose={() => setShowEditModal(false)}
         title="Edit Message"
       >
         <form onSubmit={handleUpdateMessage} className="space-y-4">
           <div>
             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
               Subject
             </label>
             <input
               type="text"
               name="subject"
               value={editData.subject}
               onChange={handleEditInputChange}
               className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
               required
             />
           </div>
           
           <div>
             <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
               Message
             </label>
             <textarea
               name="message"
               value={editData.message}
               onChange={handleEditInputChange}
               rows={6}
               className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
               required
             />
           </div>
           
           <div className="flex justify-end gap-3 pt-4">
             <button
               type="button"
               onClick={() => setShowEditModal(false)}
               className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
             >
               Cancel
             </button>
             <button
               type="submit"
               className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
             >
               <svg size={16} className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
               </svg>
               Update Message
             </button>
           </div>
         </form>
       </Modal>
     </div>
   );
 };

export default Messages;
