import React, { useState, useEffect } from 'react';
import { Settings, Save, RefreshCw, Mail, MessageSquare, Bell } from 'lucide-react';
import api from '@utils/api';
import { toast } from 'react-toastify';

const AppSettings = () => {

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/settings');
      const settingsData = response.data;
      
      // Initialize form data with current settings
      const initialData = {};
      settingsData.forEach(setting => {
        initialData[setting.setting_key] = setting.setting_value;
      });
      setFormData(initialData);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const settingsToUpdate = Object.entries(formData).map(([key, value]) => ({
        key,
        value: value.toString(),
        type: 'string'
      }));

      await api.post('/api/settings/bulk', { settings: settingsToUpdate });
      toast.success('Settings saved successfully');
      fetchSettings(); // Refresh settings
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getDefaultSettings = () => {
    return [
      {
        setting_key: 'app_name',
        setting_value: 'TrackNest Enterprise',
        description: 'Application name displayed in the interface'
      },
      {
        setting_key: 'company_name',
        setting_value: 'Your Company Name',
        description: 'Company name for receipts and invoices'
      },
      {
        setting_key: 'company_email',
        setting_value: 'admin@company.com',
        description: 'Primary contact email for customer communications'
      },
      {
        setting_key: 'company_phone',
        setting_value: '+1234567890',
        description: 'Primary contact phone number'
      },
      {
        setting_key: 'default_currency',
        setting_value: 'UGX',
        description: 'Default currency for transactions'
      },
      {
        setting_key: 'low_stock_threshold',
        setting_value: '10',
        description: 'Minimum stock level before low stock alerts'
      },
      {
        setting_key: 'auto_backup_enabled',
        setting_value: 'true',
        description: 'Enable automatic database backups'
      },
      {
        setting_key: 'email_notifications',
        setting_value: 'true',
        description: 'Enable email notifications for important events'
      },
      {
        setting_key: 'whatsapp_integration',
        setting_value: 'false',
        description: 'Enable WhatsApp integration for customer communications'
      },
      {
        setting_key: 'session_timeout',
        setting_value: '30',
        description: 'Session timeout in minutes'
      },
      {
        setting_key: 'password_policy',
        setting_value: 'medium',
        description: 'Password strength policy'
      },
      {
        setting_key: 'two_factor_auth',
        setting_value: 'false',
        description: 'Enable two-factor authentication'
      },
      {
        setting_key: 'backup_frequency',
        setting_value: 'daily',
        description: 'Backup frequency'
      },
      {
        setting_key: 'data_retention',
        setting_value: '90',
        description: 'Data retention period in days'
      }
    ];
  };

  const initializeDefaultSettings = async () => {
    try {
      const defaultSettings = getDefaultSettings();
      await api.post('/api/settings/bulk', { settings: defaultSettings });
      toast.success('Default settings initialized');
      fetchSettings();
    } catch (error) {
      console.error('Error initializing default settings:', error);
      toast.error('Failed to initialize default settings');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Settings size={24} className="text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">Application Settings</h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={initializeDefaultSettings}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Initialize Defaults
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* General Settings */}
        <div className="space-y-6">
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Settings size={20} className="text-gray-600" />
              General Settings
            </h3>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Application Name
            </label>
            <input
              type="text"
              value={formData.app_name || ''}
              onChange={(e) => handleInputChange('app_name', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="TrackNest Enterprise"
            />
            <p className="text-xs text-gray-500 mt-1">Application name displayed in the interface</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Name
            </label>
            <input
              type="text"
              value={formData.company_name || ''}
              onChange={(e) => handleInputChange('company_name', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Your Company Name"
            />
            <p className="text-xs text-gray-500 mt-1">Company name for receipts and invoices</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Currency
            </label>
            <select
              value={formData.default_currency || 'UGX'}
              onChange={(e) => handleInputChange('default_currency', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="UGX">UGX (Ugandan Shilling)</option>
              <option value="USD">USD (US Dollar)</option>
              <option value="EUR">EUR (Euro)</option>
              <option value="GBP">GBP (British Pound)</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Default currency for transactions</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Low Stock Threshold
            </label>
            <input
              type="number"
              value={formData.low_stock_threshold || '10'}
              onChange={(e) => handleInputChange('low_stock_threshold', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
            />
            <p className="text-xs text-gray-500 mt-1">Minimum stock level before low stock alerts</p>
          </div>
        </div>

        {/* Communication Settings */}
        <div className="space-y-6">
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <MessageSquare size={20} className="text-gray-600" />
              Communication Settings
            </h3>
          </div>
        </div>

        {/* Security & Backup Settings */}
        <div className="space-y-6">
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Shield size={20} className="text-gray-600" />
              Security & Backup
            </h3>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Timeout (minutes)
            </label>
            <input
              type="number"
              value={formData.session_timeout || '30'}
              onChange={(e) => handleInputChange('session_timeout', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="5"
              max="480"
            />
            <p className="text-xs text-gray-500 mt-1">Auto-logout after inactivity</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password Policy
            </label>
            <select
              value={formData.password_policy || 'medium'}
              onChange={(e) => handleInputChange('password_policy', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Low (6+ characters)</option>
              <option value="medium">Medium (8+ characters, mixed case)</option>
              <option value="high">High (10+ characters, special chars)</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Password strength requirements</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Two-Factor Authentication
            </label>
            <select
              value={formData.two_factor_auth || 'false'}
              onChange={(e) => handleInputChange('two_factor_auth', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="true">Enabled</option>
              <option value="false">Disabled</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Require 2FA for admin accounts</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Backup Frequency
            </label>
            <select
              value={formData.backup_frequency || 'daily'}
              onChange={(e) => handleInputChange('backup_frequency', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">How often to create backups</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data Retention (days)
            </label>
            <input
              type="number"
              value={formData.data_retention || '90'}
              onChange={(e) => handleInputChange('data_retention', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="30"
              max="3650"
            />
            <p className="text-xs text-gray-500 mt-1">How long to keep backup data</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Email
            </label>
            <input
              type="email"
              value={formData.company_email || ''}
              onChange={(e) => handleInputChange('company_email', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="admin@company.com"
            />
            <p className="text-xs text-gray-500 mt-1">Primary contact email for customer communications</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Phone
            </label>
            <input
              type="tel"
              value={formData.company_phone || ''}
              onChange={(e) => handleInputChange('company_phone', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="+1234567890"
            />
            <p className="text-xs text-gray-500 mt-1">Primary contact phone number</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Notifications
            </label>
            <select
              value={formData.email_notifications || 'true'}
              onChange={(e) => handleInputChange('email_notifications', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="true">Enabled</option>
              <option value="false">Disabled</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Enable email notifications for important events</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              WhatsApp Integration
            </label>
            <select
              value={formData.whatsapp_integration || 'false'}
              onChange={(e) => handleInputChange('whatsapp_integration', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="true">Enabled</option>
              <option value="false">Disabled</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Enable WhatsApp integration for customer communications</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Auto Backup
            </label>
            <select
              value={formData.auto_backup_enabled || 'true'}
              onChange={(e) => handleInputChange('auto_backup_enabled', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="true">Enabled</option>
              <option value="false">Disabled</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Enable automatic database backups</p>
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="font-semibold text-blue-800 mb-2">Settings Information</h3>
        <div className="text-sm text-blue-700 space-y-1">
          <p>• Changes to settings will take effect immediately</p>
          <p>• Some settings may require a page refresh to see changes</p>
          <p>• Contact your system administrator for advanced configuration</p>
        </div>
      </div>
    </div>
  );
};

export default AppSettings;
