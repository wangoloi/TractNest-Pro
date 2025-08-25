import React, { useState, useEffect } from 'react';
import { Send, Plus, Search, Filter, RefreshCw, User, MessageSquare, Clock, Check, CheckCheck } from 'lucide-react';
import DataTable from '../ui/tables/DataTable';
import Modal from '../ui/modals/Modal';
import Dropdown from '../ui/forms/Dropdown';
import { useMessages } from '../../app/providers/MessageContext';

const Messages = () => {
  const { messages, markAsRead, addMessage } = useMessages();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [composeData, setComposeData] = useState({
    recipient: '',
    subject: '',
    message: ''
  });

  // Mock data for users in the same tenant
  const mockUsers = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'user' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'admin' },
    { id: 3, name: 'Bob Wilson', email: 'bob@example.com', role: 'user' },
    { id: 4, name: 'Alice Johnson', email: 'alice@example.com', role: 'user' }
  ];



  useEffect(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setUsers(mockUsers);
      setLoading(false);
    }, 1000);
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
            <div className="font-medium text-gray-900">{msg.sender.name}</div>
            <div className="text-sm text-gray-500">{msg.sender.email}</div>
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
            <div className="font-medium text-gray-900">{msg.recipient.name}</div>
            <div className="text-sm text-gray-500">{msg.recipient.email}</div>
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
          <div className="font-medium text-gray-900 truncate">{msg.subject}</div>
          <div className="text-sm text-gray-500 truncate">{msg.message.substring(0, 50)}...</div>
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
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
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
          <span className="text-sm text-gray-600">
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
            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
          >
            <MessageSquare size={16} />
          </button>
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

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    const recipient = users.find(user => user.id === parseInt(composeData.recipient));
    const currentUser = { id: 1, name: 'Current User', email: 'current@example.com' }; // Mock current user
    
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
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600">Send and receive messages within your organization</p>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject
            </label>
            <input
              type="text"
              name="subject"
              value={composeData.subject}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <textarea
              name="message"
              value={composeData.message}
              onChange={handleInputChange}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowComposeModal(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
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
                <span className="font-medium text-gray-700">From:</span>
                <p className="text-gray-900">{selectedMessage.sender.name}</p>
                <p className="text-gray-500">{selectedMessage.sender.email}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">To:</span>
                <p className="text-gray-900">{selectedMessage.recipient.name}</p>
                <p className="text-gray-500">{selectedMessage.recipient.email}</p>
              </div>
            </div>
            
            <div>
              <span className="font-medium text-gray-700">Date:</span>
              <p className="text-gray-900">
                {new Date(selectedMessage.created_at).toLocaleString()}
              </p>
            </div>
            
            <div>
              <span className="font-medium text-gray-700">Message:</span>
              <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                <p className="text-gray-900 whitespace-pre-wrap">{selectedMessage.message}</p>
              </div>
            </div>
            
            <div className="flex justify-end pt-4">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Messages;
