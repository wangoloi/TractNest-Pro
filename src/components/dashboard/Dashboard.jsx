import React from 'react';
import { Printer } from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  // Dummy data for dashboard cards
  const dashboardStats = [
    { title: 'Total Stock Value', value: 'UGX 1,250,000', change: '+12% from last month', icon: '📦' },
    { title: 'Total Sales', value: 'UGX 850,000', change: '+8% from last month', icon: '💰' },
    { title: 'Total Profit', value: 'UGX 220,000', change: '+15% from last month', icon: '📈' },
    { title: 'Active Items', value: '42', change: '3 new items added', icon: '✅' },
  ];

  // Handle print functionality
  const handlePrint = () => {
    // Create a new jsPDF instance
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Dashboard Report', 105, 20, { align: 'center' });
    
    // Add date
    doc.setFontSize(12);
    doc.text(new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }), 105, 30, { align: 'center' });
    
    // Add dashboard stats as a table
    doc.setFontSize(16);
    doc.text('Dashboard Statistics', 20, 45);
    
    const statsData = dashboardStats.map(stat => [
      stat.title,
      stat.value,
      stat.change
    ]);
    
    autoTable(doc, {
      startY: 50,
      head: [['Title', 'Value', 'Change']],
      body: statsData,
      theme: 'grid',
      styles: {
        fontSize: 10
      },
      headStyles: {
        fillColor: [72, 187, 120] // Green color
      }
    });
    
    // Add recent activity section
    const finalY = doc.lastAutoTable.finalY || 50;
    doc.setFontSize(16);
    doc.text('Recent Activity', 20, finalY + 20);
    
    const activityData = [
      ['New stock added', '150 kg of Apples received from Fresh Fruits Ltd', '2 hours ago'],
      ['Sale completed', 'UGX 45,000 sale to Local Market', '5 hours ago'],
      ['Inventory updated', 'Stock levels adjusted for seasonal items', '1 day ago']
    ];
    
    autoTable(doc, {
      startY: finalY + 25,
      head: [['Activity', 'Details', 'Time']],
      body: activityData,
      theme: 'grid',
      styles: {
        fontSize: 10
      },
      headStyles: {
        fillColor: [72, 187, 120] // Green color
      }
    });
    
    // Save the PDF
    doc.save('dashboard-report.pdf');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center print:hidden"
          >
            <Printer size={16} className="mr-2" />
            Print Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm font-medium">{stat.title}</p>
                <h3 className="text-2xl font-bold mt-2">{stat.value}</h3>
                <p className="text-green-500 text-xs mt-1">{stat.change}</p>
              </div>
              <div className="text-2xl">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <div className="mr-3 text-green-500">➕</div>
            <div className="flex-1">
              <p className="font-medium">New stock added</p>
              <p className="text-sm text-gray-500">150 kg of Apples received from Fresh Fruits Ltd</p>
            </div>
            <div className="text-sm text-gray-500">2 hours ago</div>
          </div>
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <div className="mr-3 text-blue-500">💰</div>
            <div className="flex-1">
              <p className="font-medium">Sale completed</p>
              <p className="text-sm text-gray-500">UGX 45,000 sale to Local Market</p>
            </div>
            <div className="text-sm text-gray-500">5 hours ago</div>
          </div>
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <div className="mr-3 text-purple-500">📊</div>
            <div className="flex-1">
              <p className="font-medium">Inventory updated</p>
              <p className="text-sm text-gray-500">Stock levels adjusted for seasonal items</p>
            </div>
            <div className="text-sm text-gray-500">1 day ago</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <button
            className="flex flex-col items-center justify-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            onClick={() => navigate('/stocking')}
          >
            <div className="text-2xl mb-2">📦</div>
            <span className="font-medium">Add Stock</span>
          </button>
          <button
            className="flex flex-col items-center justify-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            onClick={() => navigate('/sales')}
          >
            <div className="text-2xl mb-2">💰</div>
            <span className="font-medium">Record Sale</span>
          </button>
          <button
            className="flex flex-col items-center justify-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            onClick={() => navigate('/statements')}
          >
            <div className="text-2xl mb-2">📋</div>
            <span className="font-medium">View Reports</span>
          </button>
          <button
            className="flex flex-col items-center justify-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
            onClick={() => alert('Settings feature coming soon!')}
          >
            <div className="text-2xl mb-2">⚙️</div>
            <span className="font-medium">Settings</span>
          </button>
        </div>
      </div>
      
    </div>
  );
};

export default Dashboard;