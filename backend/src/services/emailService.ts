import nodemailer from 'nodemailer';
import { config } from '../config/env';

// Create reusable transporter
let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;

  // Check if email is configured
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT;
  const smtpUser = process.env.SMTP_USER;
  const smtpPassword = process.env.SMTP_PASSWORD;
  const smtpFrom = process.env.SMTP_FROM || smtpUser || 'noreply@autonex.com';

  // If no SMTP configured, use a test account (emails won't actually send)
  if (!smtpHost || !smtpUser || !smtpPassword) {
    console.warn('⚠️  Email service not configured. Emails will be logged but not sent.');
    console.warn('   Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, and SMTP_FROM in .env');
    
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
    
    return transporter;
  }

  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: parseInt(smtpPort || '587', 10),
    secure: smtpPort === '465',
    auth: {
      user: smtpUser,
      pass: smtpPassword,
    },
  });

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
  const transporter = getTransporter();
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

  console.log('📧 Sending mentor assignment emails...');
  console.log(`   Mentor: ${data.mentorName} (${data.mentorEmail || 'no email'})`);
  console.log(`   Mentee: ${data.menteeName} (${data.menteeEmail || 'no email'})`);

  // Email to mentor
  if (data.mentorEmail) {
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
      const info = await transporter.sendMail(mentorMailOptions);
      console.log(`✅ Email sent successfully to mentor: ${data.mentorEmail}`);
      console.log(`   Message ID: ${info.messageId}`);
      if (process.env.NODE_ENV === 'development') {
        console.log(`   Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      }
    } catch (error: any) {
      console.error(`❌ Failed to send email to mentor ${data.mentorEmail}:`);
      console.error(`   Error: ${error.message}`);
      console.error(`   Code: ${error.code || 'N/A'}`);
      if (error.response) {
        console.error(`   Response: ${JSON.stringify(error.response)}`);
      }
      // Don't throw - email failure shouldn't break mentor assignment
    }
  } else {
    console.warn(`⚠️  Mentor ${data.mentorName} has no email address. Skipping email notification.`);
  }

  // Email to mentee
  if (data.menteeEmail) {
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
      const info = await transporter.sendMail(menteeMailOptions);
      console.log(`✅ Email sent successfully to mentee: ${data.menteeEmail}`);
      console.log(`   Message ID: ${info.messageId}`);
      if (process.env.NODE_ENV === 'development') {
        console.log(`   Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
      }
    } catch (error: any) {
      console.error(`❌ Failed to send email to mentee ${data.menteeEmail}:`);
      console.error(`   Error: ${error.message}`);
      console.error(`   Code: ${error.code || 'N/A'}`);
      if (error.response) {
        console.error(`   Response: ${JSON.stringify(error.response)}`);
      }
      // Don't throw - email failure shouldn't break mentor assignment
    }
  } else {
    console.warn(`⚠️  Mentee ${data.menteeName} has no email address. Skipping email notification.`);
  }
}
