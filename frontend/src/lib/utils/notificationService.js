// Notification service for sending messages between users

/**
 * Send notification to owner about admin subscription
 * @param {Object} subscriptionData - Subscription information
 * @param {Object} adminData - Admin user information
 * @returns {Promise<Object>} Notification result
 */
export const sendOwnerNotification = async (subscriptionData, adminData) => {
  try {
    console.log('📧 Sending owner notification about subscription:', {
      adminName: adminData.name,
      adminEmail: adminData.email,
      plan: subscriptionData.plan,
      amount: subscriptionData.amount,
      billingCycle: subscriptionData.billingCycle
    });

    // Get existing messages from localStorage
    const existingMessages = JSON.parse(localStorage.getItem('tracknest_messages') || '[]');
    
    // Get payment destination info
    const paymentDestination = subscriptionData.paymentDestination;
    const paymentMethod = paymentDestination?.method;
    const ownerConfig = paymentDestination?.ownerConfig || {};
    const adminPaymentDetails = paymentDestination?.adminPaymentDetails || {};
    
    // Format payment destination message
    let paymentDestinationMsg = '';
    if (paymentMethod && ownerConfig) {
      paymentDestinationMsg = `
💰 Payment Destination:
Method: ${paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)}
${Object.entries(ownerConfig).map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`).join('\n')}

💳 Admin Payment Details:
${Object.entries(adminPaymentDetails).map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`).join('\n')}
      `;
    }
    
    // Create notification message
    const notification = {
      id: `notification_${Date.now()}`,
      from: adminData.username,
      to: 'bachawa', // Owner username
      subject: `Subscription Payment - ${adminData.name}`,
      message: `
🎉 New Subscription Payment Received!

Admin: ${adminData.name} (${adminData.email})
Plan: ${subscriptionData.plan.charAt(0).toUpperCase() + subscriptionData.plan.slice(1)}
Amount: $${subscriptionData.amount}
Billing Cycle: ${subscriptionData.billingCycle}
Status: ${subscriptionData.status}
Payment Method: ${subscriptionData.paymentMethod}

${paymentDestinationMsg}

✅ The admin has been automatically activated and now has full access to all app services.

Generated: ${new Date().toLocaleString()}
      `.trim(),
      timestamp: new Date().toISOString(),
      type: 'subscription_payment_notification',
      read: false,
      priority: 'high',
      paymentData: {
        adminId: adminData.username,
        amount: subscriptionData.amount,
        method: subscriptionData.paymentMethod,
        destination: paymentDestination
      }
    };

    // Add to messages
    const updatedMessages = [...existingMessages, notification];
    localStorage.setItem('tracknest_messages', JSON.stringify(updatedMessages));

    console.log('✅ Owner notification saved successfully');
    
    return {
      success: true,
      messageId: notification.id,
      timestamp: notification.timestamp
    };

  } catch (error) {
    console.error('❌ Failed to send owner notification:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Send notification to admin about subscription status
 * @param {Object} subscriptionData - Subscription information
 * @param {Object} adminData - Admin user information
 * @param {string} status - Status message
 * @returns {Promise<Object>} Notification result
 */
export const sendAdminNotification = async (subscriptionData, adminData, status) => {
  try {
    console.log('📧 Sending admin notification about subscription:', {
      adminName: adminData.name,
      status: status
    });

    // Get existing messages from localStorage
    const existingMessages = JSON.parse(localStorage.getItem('tracknest_messages') || '[]');
    
    // Create notification message
    const notification = {
      id: `notification_${Date.now()}`,
      from: 'bachawa', // Owner username
      to: adminData.username,
      subject: `Subscription ${status}`,
      message: `
📋 Subscription Update

Dear ${adminData.name},

Your subscription has been ${status.toLowerCase()}.

Plan: ${subscriptionData.plan.charAt(0).toUpperCase() + subscriptionData.plan.slice(1)}
Amount: $${subscriptionData.amount}
Billing Cycle: ${subscriptionData.billingCycle}

If you have any questions, please contact the system administrator.

Generated: ${new Date().toLocaleString()}
      `.trim(),
      timestamp: new Date().toISOString(),
      type: 'subscription_update',
      read: false,
      priority: 'medium'
    };

    // Add to messages
    const updatedMessages = [...existingMessages, notification];
    localStorage.setItem('tracknest_messages', JSON.stringify(updatedMessages));

    console.log('✅ Admin notification saved successfully');
    
    return {
      success: true,
      messageId: notification.id,
      timestamp: notification.timestamp
    };

  } catch (error) {
    console.error('❌ Failed to send admin notification:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get all notifications for a user
 * @param {string} username - Username to get notifications for
 * @returns {Array} Array of notifications
 */
export const getNotifications = (username) => {
  try {
    const messages = JSON.parse(localStorage.getItem('tracknest_messages') || '[]');
    return messages.filter(msg => 
      msg.to === username && 
      (msg.type === 'subscription_notification' || msg.type === 'subscription_update')
    );
  } catch (error) {
    console.error('❌ Failed to get notifications:', error);
    return [];
  }
};

/**
 * Mark notification as read
 * @param {string} messageId - Message ID to mark as read
 * @returns {boolean} Success status
 */
export const markNotificationAsRead = (messageId) => {
  try {
    const messages = JSON.parse(localStorage.getItem('tracknest_messages') || '[]');
    const updatedMessages = messages.map(msg => 
      msg.id === messageId ? { ...msg, read: true } : msg
    );
    localStorage.setItem('tracknest_messages', JSON.stringify(updatedMessages));
    return true;
  } catch (error) {
    console.error('❌ Failed to mark notification as read:', error);
    return false;
  }
};
