// Utility functions for admin management

export const getStatusColor = (status) => {
  switch (status) {
    case 'active': return 'text-green-600 bg-green-100';
    case 'inactive': return 'text-gray-600 bg-gray-100';
    case 'suspended': return 'text-red-600 bg-red-100';
    default: return 'text-gray-600 bg-gray-100';
  }
};

export const getSubscriptionColor = (status) => {
  switch (status) {
    case 'active': return 'text-green-600 bg-green-100';
    case 'trial': return 'text-blue-600 bg-blue-100';
    case 'expired': return 'text-orange-600 bg-orange-100';
    case 'cancelled': return 'text-red-600 bg-red-100';
    default: return 'text-gray-600 bg-gray-100';
  }
};

export const copyToClipboard = (text) => {
  navigator.clipboard.writeText(text);
  return true;
};

export const printAdminDetails = (admin) => {
  const printWindow = window.open('', '_blank');
  const printContent = `
    <html>
      <head>
        <title>Admin Details - ${admin.firstName} ${admin.lastName}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .section { margin-bottom: 20px; }
          .section h3 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 5px; }
          .info-row { margin: 10px 0; }
          .label { font-weight: bold; color: #555; }
          .value { margin-left: 10px; }
          .status { padding: 5px 10px; border-radius: 15px; font-size: 12px; font-weight: bold; }
          .status.active { background-color: #d4edda; color: #155724; }
          .status.inactive { background-color: #f8d7da; color: #721c24; }
          .status.blocked { background-color: #fff3cd; color: #856404; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Admin Details Report</h1>
          <p>Generated on: ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="section">
          <h3>Admin Information</h3>
          <div class="info-row">
            <span class="label">Full Name:</span>
            <span class="value">${admin.firstName} ${admin.lastName}</span>
          </div>
          <div class="info-row">
            <span class="label">Email:</span>
            <span class="value">${admin.email}</span>
          </div>
          <div class="info-row">
            <span class="label">Phone:</span>
            <span class="value">${admin.phone || 'N/A'}</span>
          </div>
          <div class="info-row">
            <span class="label">Username:</span>
            <span class="value">${admin.username}</span>
          </div>
          <div class="info-row">
            <span class="label">Status:</span>
            <span class="value">
              <span class="status ${admin.status}">${admin.status}</span>
            </span>
          </div>
          <div class="info-row">
            <span class="label">Business ID:</span>
            <span class="value">${admin.businessId}</span>
          </div>
        </div>
        
        <div class="section">
          <h3>Business Information</h3>
          <div class="info-row">
            <span class="label">Business Name:</span>
            <span class="value">${admin.businessName}</span>
          </div>
          <div class="info-row">
            <span class="label">Business Type:</span>
            <span class="value">${admin.businessType}</span>
          </div>
          <div class="info-row">
            <span class="label">Business Address:</span>
            <span class="value">${admin.businessAddress || 'N/A'}</span>
          </div>
          <div class="info-row">
            <span class="label">Business Phone:</span>
            <span class="value">${admin.businessPhone || 'N/A'}</span>
          </div>
          <div class="info-row">
            <span class="label">Business Email:</span>
            <span class="value">${admin.businessEmail || 'N/A'}</span>
          </div>
          <div class="info-row">
            <span class="label">Sub-Users:</span>
            <span class="value">${admin.subUsers.length} users</span>
          </div>
        </div>
        
        <div class="section">
          <h3>Subscription Information</h3>
          <div class="info-row">
            <span class="label">Plan:</span>
            <span class="value">${admin.subscription.plan}</span>
          </div>
          <div class="info-row">
            <span class="label">Status:</span>
            <span class="value">
              <span class="status ${admin.subscription.status}">${admin.subscription.status}</span>
            </span>
          </div>
          <div class="info-row">
            <span class="label">Amount:</span>
            <span class="value">$${admin.subscription.amount}</span>
          </div>
          <div class="info-row">
            <span class="label">Expires:</span>
            <span class="value">${new Date(admin.subscription.expiresAt).toLocaleDateString()}</span>
          </div>
        </div>
        
        <div class="section">
          <h3>Performance Metrics</h3>
          <div class="info-row">
            <span class="label">Sales Count:</span>
            <span class="value">${admin.performance.salesCount}</span>
          </div>
          <div class="info-row">
            <span class="label">Revenue:</span>
            <span class="value">$${admin.performance.revenue.toLocaleString()}</span>
          </div>
          <div class="info-row">
            <span class="label">Customers:</span>
            <span class="value">${admin.performance.customers}</span>
          </div>
        </div>
        
        ${admin.generatedCredentials ? `
        <div class="section">
          <h3>Generated Credentials</h3>
          <div class="info-row">
            <span class="label">Username:</span>
            <span class="value">${admin.generatedCredentials.username}</span>
          </div>
          <div class="info-row">
            <span class="label">Generated By:</span>
            <span class="value">${admin.generatedCredentials.generatedBy}</span>
          </div>
          <div class="info-row">
            <span class="label">Generated At:</span>
            <span class="value">${new Date(admin.generatedCredentials.generatedAt).toLocaleString()}</span>
          </div>
        </div>
        ` : ''}
        
        <div class="no-print" style="margin-top: 30px; text-align: center;">
          <button onclick="window.print()">Print Report</button>
          <button onclick="window.close()">Close</button>
        </div>
      </body>
    </html>
  `;
  
  printWindow.document.write(printContent);
  printWindow.document.close();
};
