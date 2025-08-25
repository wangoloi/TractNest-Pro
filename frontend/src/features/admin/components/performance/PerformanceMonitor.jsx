import React, { useState, useEffect } from 'react';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Server,
  Database,
  Cpu,
  HardDrive,
  Wifi,
  Users,
  DollarSign,
  BarChart3,
  RefreshCw,
  Eye,
  Settings,
  Zap,
  Shield,
  Globe
} from 'lucide-react';
import { toast } from 'react-toastify';

const PerformanceMonitor = () => {
  const [performanceData, setPerformanceData] = useState({});
  const [systemHealth, setSystemHealth] = useState({});
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');

  // Mock performance data
  useEffect(() => {
    const mockPerformanceData = {
      systemMetrics: {
        cpu: {
          current: 45,
          average: 38,
          peak: 78,
          status: 'normal'
        },
        memory: {
          current: 62,
          average: 58,
          peak: 85,
          status: 'warning'
        },
        disk: {
          current: 34,
          average: 32,
          peak: 67,
          status: 'normal'
        },
        network: {
          current: 28,
          average: 25,
          peak: 45,
          status: 'normal'
        }
      },
      applicationMetrics: {
        responseTime: {
          current: 245,
          average: 220,
          peak: 890,
          status: 'warning'
        },
        throughput: {
          current: 1250,
          average: 1180,
          peak: 2100,
          status: 'normal'
        },
        errorRate: {
          current: 0.8,
          average: 0.5,
          peak: 2.1,
          status: 'normal'
        },
        activeUsers: {
          current: 156,
          average: 142,
          peak: 234,
          status: 'normal'
        }
      },
      businessMetrics: {
        sales: {
          current: 45,
          average: 38,
          peak: 67,
          trend: 'up'
        },
        revenue: {
          current: 12500,
          average: 10800,
          peak: 18900,
          trend: 'up'
        },
        customers: {
          current: 23,
          average: 19,
          peak: 34,
          trend: 'up'
        },
        transactions: {
          current: 89,
          average: 76,
          peak: 123,
          trend: 'up'
        }
      }
    };

    const mockSystemHealth = {
      overall: 'healthy',
      services: [
        { name: 'Web Server', status: 'healthy', uptime: '99.9%', lastCheck: '2 min ago' },
        { name: 'Database', status: 'healthy', uptime: '99.8%', lastCheck: '1 min ago' },
        { name: 'API Gateway', status: 'warning', uptime: '98.5%', lastCheck: '30 sec ago' },
        { name: 'File Storage', status: 'healthy', uptime: '99.7%', lastCheck: '5 min ago' },
        { name: 'Email Service', status: 'healthy', uptime: '99.6%', lastCheck: '1 min ago' },
        { name: 'Payment Gateway', status: 'healthy', uptime: '99.9%', lastCheck: '1 min ago' }
      ],
      lastUpdated: new Date().toISOString()
    };

    const mockAlerts = [
      {
        id: 1,
        type: 'warning',
        title: 'High Memory Usage',
        message: 'Memory usage has reached 85% capacity',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        severity: 'medium',
        resolved: false
      },
      {
        id: 2,
        type: 'info',
        title: 'System Maintenance',
        message: 'Scheduled maintenance completed successfully',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        severity: 'low',
        resolved: true
      },
      {
        id: 3,
        type: 'error',
        title: 'API Response Time',
        message: 'API response time exceeded 800ms threshold',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        severity: 'high',
        resolved: false
      }
    ];

    setPerformanceData(mockPerformanceData);
    setSystemHealth(mockSystemHealth);
    setAlerts(mockAlerts);
    setLoading(false);
  }, []);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // Simulate real-time updates
      setPerformanceData(prev => ({
        ...prev,
        systemMetrics: {
          ...prev.systemMetrics,
          cpu: {
            ...prev.systemMetrics.cpu,
            current: Math.floor(Math.random() * 30) + 30
          }
        }
      }));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'error': return 'text-red-600 bg-red-100 border-red-200';
      case 'warning': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'info': return 'text-blue-600 bg-blue-100 border-blue-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'high': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'medium': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'low': return <CheckCircle className="h-4 w-4 text-blue-600" />;
      default: return <CheckCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const refreshData = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Performance data refreshed');
    }, 1000);
  };

  const resolveAlert = (alertId) => {
    setAlerts(alerts.map(alert =>
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ));
    toast.success('Alert resolved');
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
          <RefreshCw className="h-8 w-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading performance data...</p>
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
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Performance Monitor</h1>
              <p className="text-gray-600">Real-time system performance and health monitoring</p>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="1h">Last Hour</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
              <button
                onClick={refreshData}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* System Health Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">System Health</h3>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(systemHealth.overall)}`}>
                {systemHealth.overall}
              </span>
            </div>
            <div className="space-y-3">
              {systemHealth.services.map((service, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-3 ${
                      service.status === 'healthy' ? 'bg-green-500' :
                      service.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                    <span className="text-sm font-medium text-gray-900">{service.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-900">{service.uptime}</div>
                    <div className="text-xs text-gray-500">{service.lastCheck}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Alerts */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Active Alerts</h3>
              <span className="text-sm text-gray-500">{alerts.filter(a => !a.resolved).length} active</span>
            </div>
            <div className="space-y-3">
              {alerts.filter(alert => !alert.resolved).slice(0, 5).map((alert) => (
                <div key={alert.id} className={`p-3 rounded-lg border ${getAlertColor(alert.type)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start">
                      {getSeverityIcon(alert.severity)}
                      <div className="ml-2">
                        <p className="text-sm font-medium">{alert.title}</p>
                        <p className="text-xs mt-1">{alert.message}</p>
                        <p className="text-xs mt-1">{formatTimeAgo(alert.timestamp)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => resolveAlert(alert.id)}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      Resolve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                <Settings className="h-4 w-4 mr-2" />
                System Settings
              </button>
              <button className="w-full flex items-center px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                <Shield className="h-4 w-4 mr-2" />
                Security Scan
              </button>
              <button className="w-full flex items-center px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                <Database className="h-4 w-4 mr-2" />
                Database Backup
              </button>
              <button className="w-full flex items-center px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                <Globe className="h-4 w-4 mr-2" />
                Network Status
              </button>
            </div>
          </div>
        </div>

        {/* System Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Cpu className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">CPU Usage</p>
                <p className="text-2xl font-bold text-gray-900">{performanceData.systemMetrics?.cpu?.current}%</p>
                <p className="text-xs text-gray-500">Peak: {performanceData.systemMetrics?.cpu?.peak}%</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${performanceData.systemMetrics?.cpu?.current}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <HardDrive className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Memory Usage</p>
                <p className="text-2xl font-bold text-gray-900">{performanceData.systemMetrics?.memory?.current}%</p>
                <p className="text-xs text-gray-500">Peak: {performanceData.systemMetrics?.memory?.peak}%</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${performanceData.systemMetrics?.memory?.current}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Database className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Disk Usage</p>
                <p className="text-2xl font-bold text-gray-900">{performanceData.systemMetrics?.disk?.current}%</p>
                <p className="text-xs text-gray-500">Peak: {performanceData.systemMetrics?.disk?.peak}%</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full" 
                  style={{ width: `${performanceData.systemMetrics?.disk?.current}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Wifi className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Network</p>
                <p className="text-2xl font-bold text-gray-900">{performanceData.systemMetrics?.network?.current}%</p>
                <p className="text-xs text-gray-500">Peak: {performanceData.systemMetrics?.network?.peak}%</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-600 h-2 rounded-full" 
                  style={{ width: `${performanceData.systemMetrics?.network?.current}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Application Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Performance</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Response Time</span>
                <span className="text-sm font-medium text-gray-900">{performanceData.applicationMetrics?.responseTime?.current}ms</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Throughput</span>
                <span className="text-sm font-medium text-gray-900">{performanceData.applicationMetrics?.throughput?.current} req/s</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Error Rate</span>
                <span className="text-sm font-medium text-gray-900">{performanceData.applicationMetrics?.errorRate?.current}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active Users</span>
                <span className="text-sm font-medium text-gray-900">{performanceData.applicationMetrics?.activeUsers?.current}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Metrics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Sales Today</span>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-900">{performanceData.businessMetrics?.sales?.current}</span>
                  {performanceData.businessMetrics?.sales?.trend === 'up' ? (
                    <TrendingUp className="h-4 w-4 text-green-600 ml-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600 ml-1" />
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Revenue Today</span>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-900">${performanceData.businessMetrics?.revenue?.current.toLocaleString()}</span>
                  {performanceData.businessMetrics?.revenue?.trend === 'up' ? (
                    <TrendingUp className="h-4 w-4 text-green-600 ml-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600 ml-1" />
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">New Customers</span>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-900">{performanceData.businessMetrics?.customers?.current}</span>
                  {performanceData.businessMetrics?.customers?.trend === 'up' ? (
                    <TrendingUp className="h-4 w-4 text-green-600 ml-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600 ml-1" />
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Transactions</span>
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-900">{performanceData.businessMetrics?.transactions?.current}</span>
                  {performanceData.businessMetrics?.transactions?.trend === 'up' ? (
                    <TrendingUp className="h-4 w-4 text-green-600 ml-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600 ml-1" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Auto-refresh toggle */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">Auto-refresh every 30 seconds</label>
            </div>
            <div className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMonitor;
