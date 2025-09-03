import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  Search,
  Filter,
  User,
  Clock,
  Eye,
  Trash2,
  Reply,
  Mail,
  Users,
  Plus,
  Archive,
  Star,
  MoreVertical,
  AlertCircle,
  CheckCircle,
  Edit,
  Save,
  X
} from 'lucide-react';
import { toast } from 'react-toastify';
import Modal from '../../../../components/ui/modals/Modal';

const AdminCommunications = () => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [activeFilter, setActiveFilter] = useState('all');
  const [newMessage, setNewMessage] = useState({
    recipientId: '',
    subject: '',
    content: '',
    priority: 'normal'
  });
  const [editForm, setEditForm] = useState({
    subject: '',
    content: '',
    priority: 'normal'
  });

  // Mock data for users and messages
  useEffect(() => {
    const mockUsers = [
      { id: 1, name: 'Alice Johnson', email: 'alice.johnson@company.com', status: 'active' },
      { id: 2, name: 'Bob Smith', email: 'bob.smith@company.com', status: 'active' },
      { id: 3, name: 'Carol Davis', email: 'carol.davis@company.com', status: 'inactive' }
    ];

    const mockMessages = [
      {
        id: 1,
        senderId: 1,
        senderName: 'Alice Johnson',
        senderEmail: 'alice.johnson@company.com',
        recipientId: 'admin',
        recipientName: 'Admin',
        subject: 'Product Availability Question',
        content: 'Hi Admin, I was wondering if you have any laptops in stock? I need one for my business and would like to know the current availability and pricing.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        status: 'unread',
        priority: 'medium',
        type: 'incoming'
      },
      {
        id: 2,
        senderId: 'admin',
        senderName: 'Admin',
        senderEmail: 'admin@company.com',
        recipientId: 2,
        recipientName: 'Bob Smith',
        recipientEmail: 'bob.smith@company.com',
        subject: 'Order Confirmation #12345',
        content: 'Hi Bob, your order #12345 has been confirmed and is being processed. You will receive a tracking number once it ships. Thank you for your business!',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        status: 'read',
        priority: 'normal',
        type: 'outgoing'
      },
      {
        id: 3,
        senderId: 2,
        senderName: 'Bob Smith',
        senderEmail: 'bob.smith@company.com',
        recipientId: 'admin',
        recipientName: 'Admin',
        subject: 'Payment Issue',
        content: 'Hello Admin, I\'m having trouble with my payment method. The system keeps declining my card. Can you help me resolve this issue?',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'read',
        priority: 'high',
        type: 'incoming'
      },
      {
        id: 4,
        senderId: 'admin',
        senderName: 'Admin',
        senderEmail: 'admin@company.com',
        recipientId: 1,
        recipientName: 'Alice Johnson',
        recipientEmail: 'alice.johnson@company.com',
        subject: 'Laptop Availability Update',
        content: 'Hi Alice, regarding your inquiry about laptops, we currently have 5 units in stock. The price is $1,200 each. Would you like me to reserve one for you?',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'read',
        priority: 'normal',
        type: 'outgoing'
      }
    ];

    setUsers(mockUsers);
    setMessages(mockMessages);
  }, []);

  const filteredMessages = messages.filter(message => {
    const matchesSearch = 
      message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.recipientName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || message.status === filterStatus;
    
    // Apply active filter from stats cards
    let matchesActiveFilter = true;
    if (activeFilter === 'unread') {
      matchesActiveFilter = message.status === 'unread';
    } else if (activeFilter === 'incoming') {
      matchesActiveFilter = message.type === 'incoming';
    } else if (activeFilter === 'outgoing') {
      matchesActiveFilter = message.type === 'outgoing';
    }
    
    return matchesSearch && matchesStatus && matchesActiveFilter;
  });

  const stats = {
    totalMessages: messages.length,
    unreadMessages: messages.filter(m => m.status === 'unread').length,
    incomingMessages: messages.filter(m => m.type === 'incoming').length,
    outgoingMessages: messages.filter(m => m.type === 'outgoing').length
  };

  const handleSendMessage = () => {
    if (!newMessage.recipientId || !newMessage.subject || !newMessage.content) {
      toast.error('Please fill in all required fields');
      return;
    }

    const recipient = users.find(user => user.id === parseInt(newMessage.recipientId));
    const message = {
      id: Date.now(),
      senderId: 'admin',
      senderName: 'Admin',
      senderEmail: 'admin@company.com',
      recipientId: parseInt(newMessage.recipientId),
      recipientName: recipient.name,
      recipientEmail: recipient.email,
      subject: newMessage.subject,
      content: newMessage.content,
      timestamp: new Date().toISOString(),
      status: 'sent',
      priority: newMessage.priority,
      type: 'outgoing'
    };

    setMessages([message, ...messages]);
    setNewMessage({
      recipientId: '',
      subject: '',
      content: '',
      priority: 'normal'
    });
    setShowComposeModal(false);
    toast.success('Message sent successfully!');
  };

  const viewMessage = (message) => {
    setSelectedMessage(message);
    if (message.status === 'unread') {
      setMessages(messages.map(m =>
        m.id === message.id ? { ...m, status: 'read' } : m
      ));
    }
    setShowMessageModal(true);
  };

  const deleteMessage = (messageId) => {
    setMessages(messages.filter(m => m.id !== messageId));
    toast.success('Message deleted');
  };

  const replyToMessage = (message) => {
    setNewMessage({
      recipientId: message.senderId.toString(),
      subject: `Re: ${message.subject}`,
      content: '',
      priority: 'normal'
    });
    setShowComposeModal(true);
    setShowMessageModal(false);
  };

  // Edit message functionality
  const editMessage = (message) => {
    // Only allow editing of outgoing messages that are recent (within 24 hours)
    const messageAge = Date.now() - new Date(message.timestamp).getTime();
    const oneDayInMs = 24 * 60 * 60 * 1000;
    
    if (message.type !== 'outgoing') {
      toast.error('You can only edit messages you sent');
      return;
    }
    
    if (messageAge > oneDayInMs) {
      toast.error('You can only edit messages sent within the last 24 hours');
      return;
    }
    
    setEditingMessage(message);
    setEditForm({
      subject: message.subject,
      content: message.content,
      priority: message.priority
    });
    setShowEditModal(true);
    setShowMessageModal(false);
  };

  const handleEditMessage = () => {
    if (!editForm.subject.trim() || !editForm.content.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    const updatedMessage = {
      ...editingMessage,
      subject: editForm.subject,
      content: editForm.content,
      priority: editForm.priority,
      editedAt: new Date().toISOString(),
      isEdited: true
    };

    setMessages(messages.map(m => 
      m.id === editingMessage.id ? updatedMessage : m
    ));

    setShowEditModal(false);
    setEditingMessage(null);
    setEditForm({
      subject: '',
      content: '',
      priority: 'normal'
    });
    toast.success('Message updated successfully!');
  };

  const cancelEdit = () => {
    setShowEditModal(false);
    setEditingMessage(null);
    setEditForm({
      subject: '',
      content: '',
      priority: 'normal'
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'normal': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'unread': return 'text-blue-600 bg-blue-100';
      case 'read': return 'text-gray-600 bg-gray-100';
      case 'sent': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">User Communications</h1>
              <p className="text-gray-600">Communicate with your business users</p>
            </div>
            <button
              onClick={() => setShowComposeModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Plus className="h-4 w-4 mr-2" />
              Compose Message
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <button
            onClick={() => setActiveFilter('all')}
            className={`bg-white rounded-lg shadow p-6 transition-all duration-200 hover:shadow-md ${
              activeFilter === 'all' ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${
                activeFilter === 'all' ? 'bg-blue-200' : 'bg-blue-100'
              }`}>
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Messages</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalMessages}</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setActiveFilter('unread')}
            className={`bg-white rounded-lg shadow p-6 transition-all duration-200 hover:shadow-md ${
              activeFilter === 'unread' ? 'ring-2 ring-yellow-500 bg-yellow-50' : 'hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${
                activeFilter === 'unread' ? 'bg-yellow-200' : 'bg-yellow-100'
              }`}>
                <Mail className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Unread Messages</p>
                <p className="text-2xl font-bold text-gray-900">{stats.unreadMessages}</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setActiveFilter('incoming')}
            className={`bg-white rounded-lg shadow p-6 transition-all duration-200 hover:shadow-md ${
              activeFilter === 'incoming' ? 'ring-2 ring-green-500 bg-green-50' : 'hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${
                activeFilter === 'incoming' ? 'bg-green-200' : 'bg-green-100'
              }`}>
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Incoming</p>
                <p className="text-2xl font-bold text-gray-900">{stats.incomingMessages}</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setActiveFilter('outgoing')}
            className={`bg-white rounded-lg shadow p-6 transition-all duration-200 hover:shadow-md ${
              activeFilter === 'outgoing' ? 'ring-2 ring-purple-500 bg-purple-50' : 'hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${
                activeFilter === 'outgoing' ? 'bg-purple-200' : 'bg-purple-100'
              }`}>
                <Send className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Outgoing</p>
                <p className="text-2xl font-bold text-gray-900">{stats.outgoingMessages}</p>
              </div>
            </div>
          </button>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search messages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* Active Filter Indicator */}
                {activeFilter !== 'all' && (
                  <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    <span>
                      {activeFilter === 'unread' && 'Unread Messages'}
                      {activeFilter === 'incoming' && 'Incoming Messages'}
                      {activeFilter === 'outgoing' && 'Outgoing Messages'}
                    </span>
                    <button
                      onClick={() => setActiveFilter('all')}
                      className="ml-1 hover:text-blue-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Messages</option>
                  <option value="unread">Unread</option>
                  <option value="read">Read</option>
                  <option value="sent">Sent</option>
                </select>
              </div>
            </div>
          </div>

          {/* Messages List */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {filteredMessages.length} of {messages.length} messages
                {activeFilter !== 'all' && (
                  <span className="ml-2 text-blue-600 font-medium">
                    (filtered by {activeFilter})
                  </span>
                )}
              </p>
              {filteredMessages.length === 0 && (
                <p className="text-sm text-gray-500">No messages found matching your criteria</p>
              )}
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {filteredMessages.map((message) => (
              <div key={message.id} className={`p-6 hover:bg-gray-50 cursor-pointer ${message.status === 'unread' ? 'bg-blue-50' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {message.type === 'incoming' ? message.senderName : message.recipientName}
                          </p>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(message.priority)}`}>
                            {message.priority}
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(message.status)}`}>
                            {message.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-900 font-medium mt-1">{message.subject}</p>
                        <p className="text-sm text-gray-500 mt-1 truncate">{message.content}</p>
                        <div className="flex items-center mt-2 text-xs text-gray-500">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatTimeAgo(message.timestamp)}
                          {message.isEdited && (
                            <span className="ml-2 text-orange-600 font-medium">(edited)</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        viewMessage(message);
                      }}
                      className="text-blue-600 hover:text-blue-900"
                      title="View Message"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    {message.type === 'incoming' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          replyToMessage(message);
                        }}
                        className="text-green-600 hover:text-green-900"
                        title="Reply"
                      >
                        <Reply className="h-4 w-4" />
                      </button>
                    )}
                    {message.type === 'outgoing' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          editMessage(message);
                        }}
                        className="text-orange-600 hover:text-orange-900"
                        title="Edit Message"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteMessage(message.id);
                      }}
                      className="text-red-600 hover:text-red-900"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Compose Message Modal */}
      <Modal
        isOpen={showComposeModal}
        onClose={() => setShowComposeModal(false)}
        size="lg"
      >
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">Compose Message</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To (User) *
              </label>
              <select
                value={newMessage.recipientId}
                onChange={(e) => setNewMessage({ ...newMessage, recipientId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a user</option>
                {users.filter(user => user.status === 'active').map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject *
              </label>
              <input
                type="text"
                value={newMessage.subject}
                onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter subject"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={newMessage.priority}
                onChange={(e) => setNewMessage({ ...newMessage, priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="normal">Normal</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message *
              </label>
              <textarea
                value={newMessage.content}
                onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your message"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => setShowComposeModal(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleSendMessage}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Send Message
            </button>
          </div>
        </div>
      </Modal>

      {/* View Message Modal */}
      <Modal
        isOpen={showMessageModal}
        onClose={() => setShowMessageModal(false)}
        size="lg"
      >
        {selectedMessage && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{selectedMessage.subject}</h2>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(selectedMessage.priority)}`}>
                  {selectedMessage.priority}
                </span>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedMessage.status)}`}>
                  {selectedMessage.status}
                </span>
              </div>
            </div>
            
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedMessage.type === 'incoming' ? 'From:' : 'To:'} {selectedMessage.type === 'incoming' ? selectedMessage.senderName : selectedMessage.recipientName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {selectedMessage.type === 'incoming' ? selectedMessage.senderEmail : selectedMessage.recipientEmail}
                  </p>
                </div>
                <div className="text-sm text-gray-500">
                  {formatTimeAgo(selectedMessage.timestamp)}
                  {selectedMessage.isEdited && (
                    <div className="text-orange-600 font-medium">(edited)</div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-900 whitespace-pre-wrap">{selectedMessage.content}</p>
            </div>
            
            <div className="flex justify-end space-x-3">
              {selectedMessage.type === 'incoming' && (
                <button
                  onClick={() => {
                    replyToMessage(selectedMessage);
                    setShowMessageModal(false);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Reply
                </button>
              )}
              <button
                onClick={() => setShowMessageModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
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
        onClose={cancelEdit}
        size="lg"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Edit Message</h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Original sent: {editingMessage && formatTimeAgo(editingMessage.timestamp)}</span>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To *
              </label>
              <input
                type="text"
                value={editingMessage ? editingMessage.recipientName : ''}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject *
              </label>
              <input
                type="text"
                value={editForm.subject}
                onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter subject"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={editForm.priority}
                onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="normal">Normal</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message *
              </label>
              <textarea
                value={editForm.content}
                onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your message"
              />
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800">Message Editing</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    You can only edit messages sent within the last 24 hours. The recipient will see that this message has been edited.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={cancelEdit}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleEditMessage}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            >
              Update Message
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminCommunications;
