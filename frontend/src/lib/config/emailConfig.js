// Email configuration for TrackNest Pro
// This file contains all email-related settings and can be easily customized

export const EMAIL_CONFIG = {
  // EmailJS Configuration (Primary method)
  emailjs: {
    serviceId: 'YOUR_EMAILJS_SERVICE_ID', // Replace with your EmailJS service ID
    templateId: 'YOUR_EMAILJS_TEMPLATE_ID', // Replace with your EmailJS template ID
    publicKey: 'YOUR_EMAILJS_PUBLIC_KEY', // Replace with your EmailJS public key
    enabled: false // Set to true when you have EmailJS configured
  },
  
  // Formspree Configuration (Fallback method)
  formspree: {
    endpoint: 'https://formspree.io/f/YOUR_FORMSPREE_ID', // Replace with your Formspree endpoint
    enabled: false // Set to true when you have Formspree configured
  },
  
  // Email Templates
  templates: {
    newUserCredentials: {
      subject: 'Welcome to TrackNest Pro - Your Account Credentials',
      fromName: 'TrackNest Pro System',
      replyTo: 'noreply@tracknest.com'
    },
    adminNotification: {
      subject: 'TrackNest Pro - New User Account Created',
      fromName: 'TrackNest Pro System',
      replyTo: 'admin@tracknest.com'
    }
  },
  
  // System Settings
  system: {
    appName: 'TrackNest Pro',
    loginUrl: 'http://localhost:3000/login',
    supportEmail: 'support@tracknest.com'
  }
};

// Helper function to check if email is enabled
export const isEmailEnabled = () => {
  return EMAIL_CONFIG.emailjs.enabled || EMAIL_CONFIG.formspree.enabled;
};

// Helper function to get email service configuration
export const getEmailServiceConfig = () => {
  if (EMAIL_CONFIG.emailjs.enabled) {
    return {
      type: 'emailjs',
      config: EMAIL_CONFIG.emailjs
    };
  } else if (EMAIL_CONFIG.formspree.enabled) {
    return {
      type: 'formspree',
      config: EMAIL_CONFIG.formspree
    };
  }
  return null;
};
