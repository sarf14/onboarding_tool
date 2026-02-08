import nodemailer from 'nodemailer';
import { config } from '../config/env';

// Create reusable transporter
let transporter: nodemailer.Transporter | null = null;

async function getTransporter() {
  if (transporter) {
    console.log('[SMTP] Using existing transporter instance');
    return transporter;
  }

  console.log('[SMTP] Initializing SMTP transporter...');
  
  // Check if email is configured
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT;
  const smtpUser = process.env.SMTP_USER;
  const smtpPassword = process.env.SMTP_PASSWORD?.trim(); // Remove whitespace
  const smtpFrom = process.env.SMTP_FROM || smtpUser || 'noreply@autonex.com';

  // Debug: Log configuration status (without exposing password)
  console.log('[SMTP] Configuration check:');
  console.log(`   SMTP_HOST: ${smtpHost ? '✅ Set' : '❌ Missing'}`);
  console.log(`   SMTP_PORT: ${smtpPort || 'Using default 587'}`);
  console.log(`   SMTP_USER: ${smtpUser ? '✅ Set (' + smtpUser + ')' : '❌ Missing'}`);
  console.log(`   SMTP_PASSWORD: ${smtpPassword ? '✅ Set (' + smtpPassword.length + ' chars)' : '❌ Missing'}`);
  console.log(`   SMTP_FROM: ${smtpFrom}`);
  console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);

  // If no SMTP configured, use a test account (emails won't actually send)
  if (!smtpHost || !smtpUser || !smtpPassword) {
    console.warn('[SMTP] ⚠️  Email service not configured. Emails will be logged but not sent.');
    console.warn('[SMTP]    Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, and SMTP_FROM in backend/.env');
    console.warn('[SMTP]    For deployed environments, set these as environment variables in your hosting platform');
    
    // Create a test transporter that logs emails
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: 'test@ethereal.email',
        pass: 'test',
      },
    });
    
    console.log('[SMTP] Created test transporter (emails will not be sent)');
    return transporter;
  }

  console.log('[SMTP] Creating SMTP transporter with configuration:');
  console.log(`   Host: ${smtpHost}`);
  console.log(`   Port: ${smtpPort || '587'} (secure: ${smtpPort === '465'})`);
  console.log(`   User: ${smtpUser}`);
  console.log(`   Password length: ${smtpPassword.length} characters`);

  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: parseInt(smtpPort || '587', 10),
    secure: smtpPort === '465',
    auth: {
      user: smtpUser,
      pass: smtpPassword,
    },
    tls: {
      rejectUnauthorized: false // Allow self-signed certificates if needed
    },
    debug: process.env.NODE_ENV === 'development', // Enable debug mode in development
    logger: process.env.NODE_ENV === 'development', // Enable logging in development
  });

  // Verify transporter configuration
  console.log('[SMTP] Verifying SMTP connection...');
  try {
    const verifyResult = await transporter.verify();
    console.log('[SMTP] ✅ SMTP connection verified successfully');
    console.log(`[SMTP]    Host: ${smtpHost}:${smtpPort || '587'}`);
    console.log(`[SMTP]    User: ${smtpUser}`);
    console.log(`[SMTP]    Verification result:`, verifyResult);
  } catch (error: any) {
    console.error('[SMTP] ❌ SMTP verification failed:');
    console.error(`[SMTP]    Error: ${error.message}`);
    console.error(`[SMTP]    Code: ${error.code || 'N/A'}`);
    console.error(`[SMTP]    Command: ${error.command || 'N/A'}`);
    console.error(`[SMTP]    Response: ${error.response || 'N/A'}`);
    console.error(`[SMTP]    ResponseCode: ${error.responseCode || 'N/A'}`);
    if (error.stack) {
      console.error(`[SMTP]    Stack: ${error.stack.substring(0, 500)}`);
    }
    console.error('[SMTP]    Please check your SMTP credentials in backend/.env');
    console.error('[SMTP]    For Gmail: Make sure you\'re using an App Password (not your regular password)');
    console.error('[SMTP]    App Password should be 16 characters (spaces are OK, they will be trimmed)');
    console.error('[SMTP]    For deployed environments, ensure environment variables are set correctly');
  }

  return transporter;
}

export interface MentorAssignmentEmailData {
  mentorName: string;
  mentorEmail: string;
  menteeName: string;
  menteeEmail: string;
  portalUrl: string;
  loginCredentials: {
    email?: string;
    name: string;
    password: string;
  };
}

export async function sendMentorAssignmentEmails(data: MentorAssignmentEmailData): Promise<void> {
  const transporter = await getTransporter();
  const smtpFrom = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@autonex.com';
  // Use the provided portal URL or fallback to config
  const portalUrl = 'https://onboarding-tool-psi.vercel.app';
  const loginUrl = `${portalUrl}/login`;

  // Check if SMTP is properly configured
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPassword = process.env.SMTP_PASSWORD;
  const isConfigured = !!(smtpHost && smtpUser && smtpPassword);

  if (!isConfigured) {
    console.warn('⚠️  EMAIL SERVICE NOT CONFIGURED');
    console.warn('   To enable email sending, add these to backend/.env:');
    console.warn('   SMTP_HOST=smtp.gmail.com (or your SMTP server)');
    console.warn('   SMTP_PORT=587');
    console.warn('   SMTP_USER=your-email@gmail.com');
    console.warn('   SMTP_PASSWORD=your-app-password');
    console.warn('   SMTP_FROM=noreply@autonex.com (optional)');
    console.warn('');
    console.warn('   Email details that would be sent:');
    console.warn(`   - To Mentor (${data.mentorEmail || 'N/A'}): New mentee ${data.menteeName} assigned`);
    console.warn(`   - To Mentee (${data.menteeEmail || 'N/A'}): Mentor ${data.mentorName} assigned`);
    console.warn('');
    return; // Exit early if not configured
  }

  console.log('[SMTP] 📧 Starting mentor assignment email process...');
  console.log(`[SMTP]    Mentor: ${data.mentorName} (${data.mentorEmail || 'no email'})`);
  console.log(`[SMTP]    Mentee: ${data.menteeName} (${data.menteeEmail || 'no email'})`);
  console.log(`[SMTP]    Portal URL: ${portalUrl}`);
  console.log(`[SMTP]    Login URL: ${loginUrl}`);
  console.log(`[SMTP]    From address: ${smtpFrom}`);

  // Email to mentor
  if (data.mentorEmail) {
    console.log(`[SMTP] Preparing email to mentor: ${data.mentorEmail}`);
    const mentorMailOptions = {
      from: smtpFrom,
      to: data.mentorEmail,
      subject: `New Mentee Assigned: ${data.menteeName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #163791; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">New Mentee Assignment</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border: 1px solid #ddd;">
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Hello <strong>${data.mentorName}</strong>,</p>
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
              You have been assigned a new mentee: <strong style="color: #163791;">${data.menteeName}</strong>.
            </p>
            <p style="font-size: 16px; color: #333; margin-bottom: 30px;">
              As their mentor, you will guide them through the onboarding process, track their progress, and provide support as they complete their training sections.
            </p>
            
            <div style="background: white; padding: 20px; border-left: 4px solid #163791; margin: 20px 0;">
              <h3 style="color: #163791; margin-top: 0;">Your Responsibilities:</h3>
              <ul style="color: #555; line-height: 1.8;">
                <li>Monitor mentee progress through all training sections</li>
                <li>Provide guidance and answer questions</li>
                <li>Review quiz scores and learning outcomes</li>
                <li>Support mentee success throughout the program</li>
              </ul>
            </div>
            
            <div style="background: #fff3cd; padding: 20px; border-radius: 4px; margin: 20px 0; border: 1px solid #ffc107;">
              <h3 style="margin-top: 0; color: #856404;">Mentee Contact Information:</h3>
              <p style="margin: 10px 0; color: #856404; font-size: 16px;">
                <strong>Name:</strong> ${data.menteeName}
              </p>
              <p style="margin: 10px 0; color: #856404; font-size: 16px;">
                <strong>Email:</strong> ${data.menteeEmail || 'Not provided'}
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${loginUrl}" 
                 style="display: inline-block; padding: 14px 32px; background: #163791; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px;">
                Access Mentor Portal
              </a>
            </div>
            
            <div style="background: #e8f4f8; padding: 15px; border-radius: 4px; margin-top: 20px;">
              <p style="margin: 0; color: #555; font-size: 14px;">
                <strong>Portal URL:</strong> <a href="${loginUrl}" style="color: #163791;">${loginUrl}</a>
              </p>
              <p style="margin: 10px 0 0 0; color: #555; font-size: 14px;">
                <strong>Login:</strong> Use your name and password to access the portal
              </p>
            </div>
          </div>
          <div style="background: #f5f5f5; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #ddd;">
            <p style="margin: 0; color: #999; font-size: 12px;">
              This is an automated notification from Autonex Onboarding Platform
            </p>
          </div>
        </div>
      `,
      text: `
        New Mentee Assignment
        
        Hello ${data.mentorName},
        
        You have been assigned a new mentee: ${data.menteeName}.
        
        As their mentor, you will guide them through the onboarding process, track their progress, and provide support as they complete their training sections.
        
        Your Responsibilities:
        - Monitor mentee progress through all training sections
        - Provide guidance and answer questions
        - Review quiz scores and learning outcomes
        - Support mentee success throughout the program
        
        Mentee Contact Information:
        Name: ${data.menteeName}
        Email: ${data.menteeEmail || 'Not provided'}
        
        Access the Mentor Portal: ${loginUrl}
        Portal URL: ${loginUrl}
        Login: Use your name and password to access the portal
        
        This is an automated notification from Autonex Onboarding Platform
      `,
    };

    try {
      console.log(`[SMTP] Attempting to send email to mentor: ${data.mentorEmail}`);
      console.log(`[SMTP]    Subject: ${mentorMailOptions.subject}`);
      console.log(`[SMTP]    From: ${mentorMailOptions.from}`);
      console.log(`[SMTP]    To: ${mentorMailOptions.to}`);
      
      const startTime = Date.now();
      const info = await transporter.sendMail(mentorMailOptions);
      const duration = Date.now() - startTime;
      
      console.log(`[SMTP] ✅ Email sent successfully to mentor: ${data.mentorEmail}`);
      console.log(`[SMTP]    Message ID: ${info.messageId}`);
      console.log(`[SMTP]    Response: ${info.response || 'N/A'}`);
      console.log(`[SMTP]    Duration: ${duration}ms`);
      
      if (process.env.NODE_ENV === 'development') {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
          console.log(`[SMTP]    Preview URL: ${previewUrl}`);
        }
      }
    } catch (error: any) {
      console.error(`[SMTP] ❌ Failed to send email to mentor ${data.mentorEmail}:`);
      console.error(`[SMTP]    Error message: ${error.message}`);
      console.error(`[SMTP]    Error code: ${error.code || 'N/A'}`);
      console.error(`[SMTP]    Error name: ${error.name || 'N/A'}`);
      console.error(`[SMTP]    Command: ${error.command || 'N/A'}`);
      console.error(`[SMTP]    Response: ${error.response || 'N/A'}`);
      console.error(`[SMTP]    ResponseCode: ${error.responseCode || 'N/A'}`);
      if (error.response) {
        console.error(`[SMTP]    Full response: ${JSON.stringify(error.response, null, 2)}`);
      }
      if (error.stack) {
        console.error(`[SMTP]    Stack trace: ${error.stack.substring(0, 1000)}`);
      }
      console.error(`[SMTP]    SMTP Host: ${process.env.SMTP_HOST}`);
      console.error(`[SMTP]    SMTP Port: ${process.env.SMTP_PORT}`);
      console.error(`[SMTP]    SMTP User: ${process.env.SMTP_USER}`);
      // Don't throw - email failure shouldn't break mentor assignment
    }
  } else {
    console.warn(`[SMTP] ⚠️  Mentor ${data.mentorName} has no email address. Skipping email notification.`);
  }

  // Email to mentee
  if (data.menteeEmail) {
    console.log(`[SMTP] Preparing email to mentee: ${data.menteeEmail}`);
    const loginMethod = data.loginCredentials.email 
      ? `Email: ${data.loginCredentials.email}`
      : `Name: ${data.loginCredentials.name}`;
    
    const menteeMailOptions = {
      from: smtpFrom,
      to: data.menteeEmail,
      subject: `Welcome! Your Mentor Assignment - ${data.mentorName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #163791; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">Welcome to Autonex Onboarding Platform</h1>
          </div>
          <div style="background: #f9f9f9; padding: 30px; border: 1px solid #ddd;">
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Hello <strong>${data.menteeName}</strong>,</p>
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
              Great news! You have been assigned a mentor: <strong style="color: #163791;">${data.mentorName}</strong>.
            </p>
            <p style="font-size: 16px; color: #333; margin-bottom: 30px;">
              Your mentor will guide you through the onboarding process, track your progress, answer your questions, and help you succeed in completing all training sections.
            </p>
            
            <div style="background: white; padding: 20px; border-left: 4px solid #163791; margin: 20px 0;">
              <h3 style="color: #163791; margin-top: 0;">What to Expect:</h3>
              <ul style="color: #555; line-height: 1.8;">
                <li>Complete 5 training sections covering annotation fundamentals</li>
                <li>Take quizzes at the end of each section (90% passing score required)</li>
                <li>Receive guidance and support from your mentor</li>
                <li>Track your progress through the dashboard</li>
              </ul>
            </div>
            
            <div style="background: #fff3cd; padding: 20px; border-radius: 4px; margin: 20px 0; border: 1px solid #ffc107;">
              <h3 style="margin-top: 0; color: #856404;">Your Login Credentials:</h3>
              <p style="margin: 10px 0; color: #856404; font-size: 16px;">
                <strong>${loginMethod}</strong>
              </p>
              <p style="margin: 10px 0; color: #856404; font-size: 16px;">
                <strong>Password:</strong> Please use your existing password. If you need assistance or have forgotten your password, please contact your administrator.
              </p>
            </div>
            
            <div style="background: #e8f4f8; padding: 20px; border-radius: 4px; margin: 20px 0; border: 1px solid #163791;">
              <h3 style="margin-top: 0; color: #163791;">Mentor Contact Information:</h3>
              <p style="margin: 10px 0; color: #555; font-size: 16px;">
                <strong>Name:</strong> ${data.mentorName}
              </p>
              <p style="margin: 10px 0; color: #555; font-size: 16px;">
                <strong>Email:</strong> ${data.mentorEmail || 'Not provided'}
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${loginUrl}" 
                 style="display: inline-block; padding: 14px 32px; background: #163791; color: #ffffff; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px;">
                Log In to Portal
              </a>
            </div>
            
            <div style="background: #e8f4f8; padding: 15px; border-radius: 4px; margin-top: 20px;">
              <p style="margin: 0; color: #555; font-size: 14px;">
                <strong>Portal URL:</strong> <a href="${loginUrl}" style="color: #163791;">${loginUrl}</a>
              </p>
              <p style="margin: 10px 0 0 0; color: #555; font-size: 14px;">
                <strong>Need Help?</strong> Contact your mentor (${data.mentorName}) at ${data.mentorEmail || 'contact admin'} or the admin team for assistance.
              </p>
            </div>
          </div>
          <div style="background: #f5f5f5; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; border-top: 1px solid #ddd;">
            <p style="margin: 0; color: #999; font-size: 12px;">
              This is an automated notification from Autonex Onboarding Platform
            </p>
          </div>
        </div>
      `,
      text: `
        Welcome to Autonex Onboarding Platform
        
        Hello ${data.menteeName},
        
        Great news! You have been assigned a mentor: ${data.mentorName}.
        
        Your mentor will guide you through the onboarding process, track your progress, answer your questions, and help you succeed in completing all training sections.
        
        What to Expect:
        - Complete 5 training sections covering annotation fundamentals
        - Take quizzes at the end of each section (90% passing score required)
        - Receive guidance and support from your mentor
        - Track your progress through the dashboard
        
        Your Login Credentials:
        ${loginMethod}
        Password: Please use your existing password. If you need assistance or have forgotten your password, please contact your administrator.
        
        Mentor Contact Information:
        Name: ${data.mentorName}
        Email: ${data.mentorEmail || 'Not provided'}
        
        Log In to Portal: ${loginUrl}
        Portal URL: ${loginUrl}
        
        Need Help? Contact your mentor (${data.mentorName}) at ${data.mentorEmail || 'contact admin'} or the admin team for assistance.
        
        This is an automated notification from Autonex Onboarding Platform
      `,
    };

    try {
      console.log(`[SMTP] Attempting to send email to mentee: ${data.menteeEmail}`);
      console.log(`[SMTP]    Subject: ${menteeMailOptions.subject}`);
      console.log(`[SMTP]    From: ${menteeMailOptions.from}`);
      console.log(`[SMTP]    To: ${menteeMailOptions.to}`);
      
      const startTime = Date.now();
      const info = await transporter.sendMail(menteeMailOptions);
      const duration = Date.now() - startTime;
      
      console.log(`[SMTP] ✅ Email sent successfully to mentee: ${data.menteeEmail}`);
      console.log(`[SMTP]    Message ID: ${info.messageId}`);
      console.log(`[SMTP]    Response: ${info.response || 'N/A'}`);
      console.log(`[SMTP]    Duration: ${duration}ms`);
      
      if (process.env.NODE_ENV === 'development') {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
          console.log(`[SMTP]    Preview URL: ${previewUrl}`);
        }
      }
    } catch (error: any) {
      console.error(`[SMTP] ❌ Failed to send email to mentee ${data.menteeEmail}:`);
      console.error(`[SMTP]    Error message: ${error.message}`);
      console.error(`[SMTP]    Error code: ${error.code || 'N/A'}`);
      console.error(`[SMTP]    Error name: ${error.name || 'N/A'}`);
      console.error(`[SMTP]    Command: ${error.command || 'N/A'}`);
      console.error(`[SMTP]    Response: ${error.response || 'N/A'}`);
      console.error(`[SMTP]    ResponseCode: ${error.responseCode || 'N/A'}`);
      if (error.response) {
        console.error(`[SMTP]    Full response: ${JSON.stringify(error.response, null, 2)}`);
      }
      if (error.stack) {
        console.error(`[SMTP]    Stack trace: ${error.stack.substring(0, 1000)}`);
      }
      console.error(`[SMTP]    SMTP Host: ${process.env.SMTP_HOST}`);
      console.error(`[SMTP]    SMTP Port: ${process.env.SMTP_PORT}`);
      console.error(`[SMTP]    SMTP User: ${process.env.SMTP_USER}`);
      // Don't throw - email failure shouldn't break mentor assignment
    }
  } else {
    console.warn(`[SMTP] ⚠️  Mentee ${data.menteeName} has no email address. Skipping email notification.`);
  }
  
  console.log('[SMTP] 📧 Mentor assignment email process completed');
}
