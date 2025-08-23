import nodemailer from 'nodemailer';

// Create a test account for development (you can replace with real SMTP settings)
const createTestAccount = async () => {
  try {
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransporter({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  } catch (error) {
    console.error('Failed to create test email account:', error);
    return null;
  }
};

// Create transporter (use real SMTP in production)
const createTransporter = async () => {
  if (process.env.NODE_ENV === 'production') {
    // Use real SMTP settings in production
    return nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Use test account for development
    return await createTestAccount();
  }
};

export const sendWelcomeEmail = async (userEmail, username, password) => {
  try {
    const transporter = await createTransporter();
    if (!transporter) {
      console.error('Failed to create email transporter');
      return false;
    }

    const mailOptions = {
      from: process.env.SMTP_FROM || '"TrackNest Pro" <noreply@tracknest.com>',
      to: userEmail,
      subject: 'Welcome to TrackNest Pro - Your Account Details',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10b981, #3b82f6); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to TrackNest Pro!</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Your account has been successfully created</p>
          </div>
          
          <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2 style="color: #1f2937; margin-top: 0;">Account Information</h2>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
              <h3 style="color: #374151; margin-top: 0;">Login Credentials</h3>
              <p><strong>Username:</strong> <span style="font-family: monospace; background: #f3f4f6; padding: 4px 8px; border-radius: 4px;">${username}</span></p>
              <p><strong>Password:</strong> <span style="font-family: monospace; background: #f3f4f6; padding: 4px 8px; border-radius: 4px;">${password}</span></p>
            </div>
            
            <div style="background: #eff6ff; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6;">
              <h3 style="color: #1e40af; margin-top: 0;">Security Notice</h3>
              <p style="color: #374151; margin-bottom: 0;">
                For security reasons, we recommend changing your password after your first login. 
                You can do this by going to your profile settings once you're logged in.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" 
                 style="background: linear-gradient(135deg, #10b981, #3b82f6); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                Login to Your Account
              </a>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px;">
            <p>If you have any questions, please contact our support team.</p>
            <p>&copy; 2024 TrackNest Pro. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('📧 Welcome email sent (development):');
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    }
    
    return true;
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return false;
  }
};

export const sendOtpEmail = async (userEmail, otp, username) => {
  try {
    const transporter = await createTransporter();
    if (!transporter) {
      console.error('Failed to create email transporter');
      return false;
    }

    const mailOptions = {
      from: process.env.SMTP_FROM || '"TrackNest Pro" <noreply@tracknest.com>',
      to: userEmail,
      subject: 'TrackNest Pro - Password Reset OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #10b981, #3b82f6); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Password Reset Request</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Hello ${username || 'there'}!</p>
          </div>
          
          <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px;">
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              We received a request to reset your password for your TrackNest Pro account. 
              Use the OTP below to complete the password reset process.
            </p>
            
            <div style="background: white; padding: 30px; border-radius: 8px; margin: 30px 0; text-align: center; border: 2px dashed #10b981;">
              <h2 style="color: #1f2937; margin-top: 0; margin-bottom: 20px;">Your OTP Code</h2>
              <div style="font-family: monospace; font-size: 32px; font-weight: bold; color: #10b981; letter-spacing: 8px; background: #f0fdf4; padding: 20px; border-radius: 8px;">
                ${otp}
              </div>
              <p style="color: #6b7280; margin-top: 15px; font-size: 14px;">
                This code will expire in 10 minutes
              </p>
            </div>
            
            <div style="background: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b;">
              <h3 style="color: #92400e; margin-top: 0;">Security Notice</h3>
              <ul style="color: #374151; margin-bottom: 0; padding-left: 20px;">
                <li>Never share this OTP with anyone</li>
                <li>TrackNest Pro will never ask for your OTP via phone or email</li>
                <li>If you didn't request this reset, please ignore this email</li>
              </ul>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px;">
            <p>If you have any questions, please contact our support team.</p>
            <p>&copy; 2024 TrackNest Pro. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    
    if (process.env.NODE_ENV !== 'production') {
      console.log('📧 OTP email sent (development):');
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    }
    
    return true;
  } catch (error) {
    console.error('Failed to send OTP email:', error);
    return false;
  }
};
