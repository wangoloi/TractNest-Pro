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
  MoreVertical
} from 'lucide-react';
import { toast } from 'react-toastify';
import Modal from '../../shared/Modal';

const OwnerCommunications = () => {
  const [messages, setMessages] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState({
    recipientId: '',
    subject: '',
    content: '',
    priority: 'normal'
  });

  // Mock data for admins and messages
  useEffect(() => {
    const mockAdmins = [
      { id: 1, name: 'John Doe', email: 'john.doe@company.com', status: 'active' },
      { id: 2, name: 'Jane Smith', email: 'jane.smith@company.com', status: 'active' },
      { id: 3, name: 'Mike Johnson', email: 'mike.johnson@company.com', status: 'inactive' }
    ];

    const mockMessages = [
      {
        id: 1,
        senderId: 1,
        senderName: 'John Doe',
        senderEmail: 'john.doe@company.com',
        recipientId: 'owner',
        recipientName: 'Owner',
        subject: 'System Performance Issue',
        content: 'Hi Owner, I noticed some performance issues with the sales module. The response time has increased significantly. Can you please investigate?',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        status: 'unread',
        priority: 'high',
        type: 'incoming'
      },
      {
        id: 2,
        senderId: 'owner',
        senderName: 'Owner',
        senderEmail: 'owner@company.com',
        recipientId: 2,
        recipientName: 'Jane Smith',
        recipientEmail: 'jane.smith@company.com',
        subject: 'Monthly Performance Review',
        content: 'Hi Jane, I wanted to discuss your monthly performance. You\'ve been doing great with customer management. Let\'s schedule a call to discuss further improvements.',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        status: 'read',
        priority: 'normal',
        type: 'outgoing'
      },
      {
        id: 3,
        senderId: 2,
        senderName: 'Jane Smith',
        senderEmail: 'jane.smith@company.com',
        recipientId: 'owner',
        recipientName: 'Owner',
        subject: 'Subscription Renewal Request',
        content: 'Hello Owner, I would like to request an upgrade to the Premium plan. Our team has grown and we need the additional features. Please let me know the process.',
        timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'read',
        priority: 'medium',
        type: 'incoming'
      },
      {
        id: 4,
        senderId: 'owner',
        senderName: 'Owner',
        senderEmail: 'owner@company.com',
        recipientId: 1,
        recipientName: 'John Doe',
        recipientEmail: 'john.doe@company.com',
        subject: 'System Maintenance Notice',
        content: 'Hi John, we will be performing system maintenance this weekend. The system will be unavailable from 2 AM to 6 AM on Sunday. Please inform your team.',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'read',
        priority: 'high',
        type: 'outgoing'
      }
    ];

    setAdmins(mockAdmins);
    setMessages(mockMessages);
    setLoading(false);
  }, []);

  const filteredMessages = messages.filter(message => {
    const matchesSearch = 
      message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.recipientName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || message.status === filterStatus;
    
    return matchesSearch && matchesStatus;
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

    const recipient = admins.find(admin => admin.id === parseInt(newMessage.recipientId));
    const message = {
      id: Date.now(),
      senderId: 'owner',
      senderName: 'Owner',
      senderEmail: 'owner@company.com',
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

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading communications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Owner Communications</h1>
              <p className="text-gray-600">Communicate with your admin team</p>
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
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Messages</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalMessages}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Mail className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Unread Messages</p>
                <p className="text-2xl font-bold text-gray-900">{stats.unreadMessages}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Incoming</p>
                <p className="text-2xl font-bold text-gray-900">{stats.incomingMessages}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Send className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Outgoing</p>
                <p className="text-2xl font-bold text-gray-900">{stats.outgoingMessages}</p>
              </div>
            </div>
          </div>
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

          {/* Messages List */}
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
                To (Admin) *
              </label>
              <select
                value={newMessage.recipientId}
                onChange={(e) => setNewMessage({ ...newMessage, recipientId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select an admin</option>
                {admins.filter(admin => admin.status === 'active').map(admin => (
                  <option key={admin.id} value={admin.id}>
                    {admin.name} ({admin.email})
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
    </div>
  );
};

export default OwnerCommunications;
