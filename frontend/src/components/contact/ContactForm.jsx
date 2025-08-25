import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Users, Search, AlertCircle } from 'lucide-react';
import api from '@utils/api';
import { toast } from 'react-toastify';
import Dropdown from '../shared/Dropdown';

const ContactForm = () => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
    priority: 'medium',
    messageType: 'notification'
  });
  const [loading, setLoading] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(true);

  // Fetch customers on component mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoadingCustomers(true);
      const response = await api.get('/api/customers');
      setCustomers(response.data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error('Failed to load customers');
    } finally {
      setLoadingCustomers(false);
    }
  };

  const handleCustomerSelect = (customerId) => {
    setSelectedCustomers(prev => {
      if (prev.includes(customerId)) {
        return prev.filter(id => id !== customerId);
      } else {
        return [...prev, customerId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedCustomers.length === customers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(customers.map(c => c.id));
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.includes(searchTerm)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.subject.trim() || !formData.message.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (selectedCustomers.length === 0) {
      toast.error('Please select at least one customer');
      return;
    }

    setLoading(true);
    try {
      // Send message to each selected customer
      const promises = selectedCustomers.map(customerId =>
        api.post('/api/messages', {
          ...formData,
          customer_id: customerId
        })
      );
      
      await Promise.all(promises);
      
      toast.success(`Message sent successfully to ${selectedCustomers.length} customer(s)!`);
      setFormData({
        subject: '',
        message: '',
        priority: 'medium',
        messageType: 'notification'
      });
      setSelectedCustomers([]);
    } catch (error) {
      console.error('Error sending messages:', error);
      toast.error('Failed to send messages. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <MessageSquare size={24} className="text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800">Contact Customers</h2>
      </div>

      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start gap-3">
          <AlertCircle size={20} className="text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-800 mb-1">Send Messages to Customers</h3>
            <p className="text-blue-700 text-sm">
              Select one or more customers and send them notifications, updates, or important messages. 
              You can send to all customers or filter and select specific ones.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Selection */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Users size={20} />
              Select Customers
            </h3>
            <button
              type="button"
              onClick={handleSelectAll}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              {selectedCustomers.length === customers.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search customers by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Customer List */}
          <div className="border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
            {loadingCustomers ? (
              <div className="p-4 text-center text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                Loading customers...
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {searchTerm ? 'No customers found matching your search.' : 'No customers available.'}
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredCustomers.map((customer) => (
                  <label
                    key={customer.id}
                    className="flex items-center p-3 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCustomers.includes(customer.id)}
                      onChange={() => handleCustomerSelect(customer.id)}
                      className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {customer.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {customer.email && `${customer.email} • `}
                        {customer.phone && `${customer.phone} • `}
                        {customer.customer_type}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {selectedCustomers.length > 0 && (
            <div className="text-sm text-gray-600">
              Selected: {selectedCustomers.length} customer(s)
            </div>
          )}
        </div>

        {/* Message Form */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Compose Message</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject *
              </label>
              <input
                type="text"
                required
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                placeholder="Message subject..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message Type
              </label>
              <Dropdown
                options={[
                  { value: 'notification', label: 'Notification' },
                  { value: 'update', label: 'Update' },
                  { value: 'reminder', label: 'Reminder' },
                  { value: 'support', label: 'Support' },
                  { value: 'promotion', label: 'Promotion' }
                ]}
                value={formData.messageType}
                onChange={(value) => setFormData({...formData, messageType: value})}
                placeholder="Select message type..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <Dropdown
                options={[
                  { value: 'low', label: 'Low' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'high', label: 'High' },
                  { value: 'urgent', label: 'Urgent' }
                ]}
                value={formData.priority}
                onChange={(value) => setFormData({...formData, priority: value})}
                placeholder="Select priority..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message *
              </label>
              <textarea
                required
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                placeholder="Write your message here..."
                rows={6}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading || selectedCustomers.length === 0}
              className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Send to {selectedCustomers.length} Customer(s)
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-800 mb-2">Message Guidelines</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p>• Keep messages clear and professional</p>
          <p>• Use appropriate priority levels for different types of messages</p>
          <p>• Consider your customers' time when sending notifications</p>
          <p>• All messages are logged and can be viewed in the Messages section</p>
        </div>
      </div>
    </div>
  );
};

export default ContactForm;
