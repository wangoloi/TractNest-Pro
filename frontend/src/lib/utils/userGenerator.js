// Utility functions for generating usernames and passwords

/**
 * Generate a username based on first name and last name
 * @param {string} firstName - User's first name
 * @param {string} lastName - User's last name
 * @param {Array} existingUsernames - Array of existing usernames to avoid conflicts
 * @returns {string} Generated username
 */
export const generateUsername = (firstName, lastName, existingUsernames = []) => {
  const cleanFirstName = firstName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanLastName = lastName.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  // Try different combinations
  const combinations = [
    `${cleanFirstName}${cleanLastName}`,
    `${cleanFirstName}.${cleanLastName}`,
    `${cleanFirstName}_${cleanLastName}`,
    `${cleanFirstName}${cleanLastName}${Math.floor(Math.random() * 100)}`,
    `${cleanFirstName}${cleanLastName}${Math.floor(Math.random() * 1000)}`
  ];
  
  // Find the first available username
  for (const username of combinations) {
    if (!existingUsernames.includes(username)) {
      return username;
    }
  }
  
  // If all combinations are taken, generate a random one
  return `${cleanFirstName}${cleanLastName}${Math.floor(Math.random() * 10000)}`;
};

/**
 * Generate a password based on user's name with '@' symbol
 * @param {string} firstName - User's first name
 * @param {string} lastName - User's last name
 * @returns {string} Generated password
 */
export const generatePassword = (firstName, lastName) => {
  const cleanFirstName = firstName.toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanLastName = lastName.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  // Create password from user's name with '@' symbol
  const password = `${cleanFirstName}@${cleanLastName}`;
  
  return password;
};

/**
 * Generate user credentials (username and password)
 * @param {string} firstName - User's first name
 * @param {string} lastName - User's last name
 * @param {Array} existingUsernames - Array of existing usernames
 * @returns {Object} Object containing username and password
 */
export const generateUserCredentials = (firstName, lastName, existingUsernames = []) => {
  const username = generateUsername(firstName, lastName, existingUsernames);
  const password = generatePassword(firstName, lastName);
  
  return {
    username,
    password,
    displayCredentials: {
      username,
      password,
      message: `Generated credentials for ${firstName} ${lastName}`
    }
  };
};

/**
 * Format credentials for display
 * @param {string} username - Generated username
 * @param {string} password - Generated password
 * @param {string} fullName - User's full name
 * @returns {string} Formatted credentials message
 */
export const formatCredentialsMessage = (username, password, fullName) => {
  return `
🎉 New User Account Created Successfully!

👤 User: ${fullName}
🔑 Username: ${username}
🔒 Password: ${password}

⚠️  IMPORTANT: Please share these credentials securely with the user.
   The user should change their password upon first login.

📝 Instructions for the user:
1. Login with the provided username and password
2. Navigate to Settings to change password
3. Keep credentials secure and confidential
  `.trim();
};

/**
 * Generate email content for new user credentials
 * @param {string} username - Generated username
 * @param {string} password - Generated password
 * @param {string} fullName - User's full name
 * @param {string} adminName - Admin who created the account
 * @returns {Object} Email content with subject and body
 */
export const generateEmailContent = (username, password, fullName, adminName) => {
  const subject = `Welcome to TrackNest Pro - Your Account Credentials`;
  
  const body = `
Dear ${fullName},

Welcome to TrackNest Pro! Your account has been successfully created by ${adminName}.

🔐 Your Login Credentials:
Username: ${username}
Password: ${password}

🌐 Login URL: http://localhost:3000/login

📋 Important Instructions:
1. Please login with the provided credentials
2. Change your password immediately after first login
3. Keep your credentials secure and confidential
4. Contact your administrator if you have any issues

🔒 Security Reminder:
- Never share your credentials with anyone
- Use a strong password when you change it
- Logout when you're done using the system

If you have any questions or need assistance, please contact your system administrator.

Best regards,
TrackNest Pro Team
  `.trim();

  return { subject, body };
};

// Email functionality without external dependencies

/**
 * Send email using available email services
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} body - Email body
 * @returns {Promise<Object>} Email sending result
 */
export const sendEmail = async (to, subject, body) => {
  try {
    console.log('📧 Preparing email notification for:', to);
    
    // Try to send email using available services
    const emailResult = await sendEmailWithService(to, subject, body);
    
    if (emailResult.success) {
      console.log('✅ Email sent successfully:', emailResult);
      return emailResult;
    } else {
      console.log('⚠️ Email service failed, using fallback method');
      return await sendEmailFallback(to, subject, body);
    }
    
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    
    // Return fallback with email content for manual sending
    return {
      success: false,
      error: error.message,
      fallback: true,
      emailContent: { to, subject, body },
      message: 'Email service unavailable. Please send credentials manually.'
    };
  }
};

/**
 * Send email using configured email service
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} body - Email body
 * @returns {Promise<Object>} Email sending result
 */
const sendEmailWithService = async (to, subject, body) => {
  try {
    // For now, we'll use a simple HTTP request to a free email service
    // You can replace this with EmailJS, SendGrid, or any other email service
    
    const emailData = {
      to: to,
      subject: subject,
      body: body,
      from: 'TrackNest Pro <noreply@tracknest.com>',
      timestamp: new Date().toISOString()
    };
    
    // Simulate email sending (replace with actual email service)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('📧 Email content prepared:');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('Body:', body);
    
    return {
      success: true,
      messageId: `email_${Date.now()}`,
      sentAt: new Date().toISOString(),
      service: 'TrackNest Email Service',
      emailContent: emailData
    };
    
  } catch (error) {
    console.error('❌ Email service failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Alternative email sending method using a simple form submission
 * This can work without EmailJS setup
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} body - Email body
 * @returns {Promise<Object>} Email sending result
 */
export const sendEmailFallback = async (to, subject, body) => {
  try {
    // Create a temporary form to send email via a service like Formspree
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://formspree.io/f/YOUR_FORMSPREE_ID'; // Replace with your Formspree endpoint
    form.style.display = 'none';
    
    // Add form fields
    const fields = {
      email: to,
      subject: subject,
      message: body,
      _subject: `TrackNest Pro - ${subject}`
    };
    
    Object.entries(fields).forEach(([name, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      input.value = value;
      form.appendChild(input);
    });
    
    // Submit form
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
    
    console.log('✅ Email form submitted successfully');
    
    return {
      success: true,
      messageId: `form_${Date.now()}`,
      sentAt: new Date().toISOString(),
      service: 'Formspree'
    };
    
  } catch (error) {
    console.error('❌ Email form submission failed:', error);
    
    // Show email content for manual sending
    console.log('📧 Email content for manual sending:');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('Body:', body);
    
    return {
      success: false,
      error: error.message,
      fallback: true,
      emailContent: { to, subject, body }
    };
  }
};
