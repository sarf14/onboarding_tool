import nodemailer from 'nodemailer';
import { config } from '../config/env';
import dns from 'dns';
import { promisify } from 'util';
import { Resend } from 'resend';

const resolve4 = promisify(dns.resolve4);

// Initialize Resend API client (if API key is available)
let resendClient: Resend | null = null;
const resendApiKey = process.env.RESEND_API_KEY;
if (resendApiKey) {
  resendClient = new Resend(resendApiKey);
  console.log('[Email] ✅ Resend API client initialized (using API instead of SMTP)');
}

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

  // Force IPv4 connections ONLY for Gmail to avoid IPv6 connectivity issues
  // Other SMTP providers (like Resend) work fine without IPv4 forcing
  let resolvedHost = smtpHost;
  let useCustomLookup = false;
  
  if (smtpHost === 'smtp.gmail.com') {
    console.log('[SMTP] Gmail detected - resolving to IPv4 address to avoid IPv6 issues...');
    useCustomLookup = true;
    try {
      // Resolve Gmail SMTP to IPv4 address before creating transporter
      const addresses = await resolve4(smtpHost);
      if (addresses && addresses.length > 0) {
        resolvedHost = addresses[0];
        console.log(`[SMTP] ✅ Resolved smtp.gmail.com to IPv4: ${resolvedHost}`);
      } else {
        console.warn(`[SMTP] ⚠️  Could not resolve IPv4, will use hostname with IPv4-only lookup`);
      }
    } catch (resolveError: any) {
      console.warn(`[SMTP] ⚠️  DNS resolution error, will use custom lookup:`, resolveError.message);
      // Continue with hostname and custom lookup
    }
  } else {
    console.log(`[SMTP] Using standard SMTP connection for ${smtpHost} (no IPv4 forcing needed)`);
  }

  // Use custom lookup function ONLY for Gmail to force IPv4 resolution
  const customLookup = (hostname: string, options: any, callback: any) => {
    console.log(`[SMTP] Custom DNS lookup for ${hostname} (forcing IPv4)...`);
    dns.lookup(hostname, { family: 4, all: false }, (err, address, family) => {
      if (err) {
        console.error(`[SMTP] DNS lookup failed for ${hostname}:`, err);
        return callback(err);
      }
      console.log(`[SMTP] ✅ Resolved ${hostname} to IPv4 address: ${address} (family: ${family})`);
      callback(null, address, family);
    });
  };

  const transporterConfig: any = {
    host: resolvedHost,
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
    // Connection timeout settings
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 10000, // 10 seconds
    socketTimeout: 10000, // 10 seconds
  };

  // Only add custom lookup and socket options for Gmail
  if (useCustomLookup) {
    transporterConfig.lookup = customLookup;
    transporterConfig.socket = {
      family: 4, // Force IPv4
    };
  }

  transporter = nodemailer.createTransport(transporterConfig);

  // Verify transporter configuration
  console.log('[SMTP] Verifying SMTP connection...');
  if (resolvedHost !== smtpHost) {
    console.log(`[SMTP]    Using resolved host: ${resolvedHost} (original: ${smtpHost})`);
  }
  console.log(`[SMTP]    Connection timeout: 10 seconds`);
  console.log(`[SMTP]    Socket timeout: 10 seconds`);
  
  try {
    // Set a timeout for the verification itself
    const verifyPromise = transporter.verify();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('SMTP verification timeout after 15 seconds')), 15000)
    );
    
    const verifyResult = await Promise.race([verifyPromise, timeoutPromise]);
    console.log('[SMTP] ✅ SMTP connection verified successfully');
    console.log(`[SMTP]    Host: ${resolvedHost}:${smtpPort || '587'}`);
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
    // Check if it's an IPv6 connectivity issue
    if (error.code === 'ESOCKET' && error.message?.includes('ENETUNREACH') && error.message?.includes('::')) {
      console.error('[SMTP]    ⚠️  IPv6 connectivity issue detected!');
      console.error('[SMTP]    The deployment environment may not support IPv6 connections.');
      console.error('[SMTP]    Solution: The code has been updated to force IPv4 (family: 4).');
      console.error('[SMTP]    Please redeploy your backend to apply the fix.');
    }
    
    // Check if it's a connection timeout
    if (error.code === 'ETIMEDOUT' || error.message?.includes('timeout')) {
      console.error('[SMTP]    ⚠️  Connection timeout detected!');
      console.error('[SMTP]    Possible causes:');
      console.error('[SMTP]    1. Firewall blocking SMTP port (587 or 465)');
      console.error('[SMTP]    2. Network restrictions on deployment platform');
      console.error('[SMTP]    3. SMTP server is unreachable from this network');
      console.error('[SMTP]    Solutions:');
      console.error('[SMTP]    - Try using Resend API instead of SMTP (recommended)');
      console.error('[SMTP]    - Check if port 587/465 is allowed in firewall');
      console.error('[SMTP]    - Consider using a different SMTP provider');
      console.error('[SMTP]    - For Resend: Use their API endpoint instead of SMTP');
    }
    
    console.error('[SMTP]    Please check your SMTP credentials in backend/.env');
    console.error('[SMTP]    For Gmail: Make sure you\'re using an App Password (not your regular password)');
    console.error('[SMTP]    App Password should be 16 characters (spaces are OK, they will be trimmed)');
    console.error('[SMTP]    For Resend: Consider using their API instead of SMTP if SMTP is blocked');
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
  const portalUrl = 'https://onboarding-tool-psi.vercel.app';
  const loginUrl = `${portalUrl}/login`;
  
  // Check if Brevo SMTP is configured (prefer Brevo over Resend API)
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPassword = process.env.SMTP_PASSWORD;
  const isBrevoConfigured = smtpHost === 'smtp-relay.brevo.com' && smtpUser && smtpPassword;
  
  // Use SMTP_FROM if set, otherwise default based on provider
  let fromEmail = process.env.SMTP_FROM;
  if (!fromEmail) {
    if (isBrevoConfigured) {
      fromEmail = smtpUser; // Use Brevo account email as from address
    } else {
      fromEmail = 'onboarding@resend.dev'; // Resend default (requires domain verification)
    }
  }

  // Prefer Brevo SMTP over Resend API (Brevo doesn't require domain verification)
  // Only use Resend API if Brevo is not configured
  if (resendClient && !isBrevoConfigured) {
    console.log('[Email] 📧 Using Resend API (no SMTP port needed)...');
    console.log(`[Email]    Mentor: ${data.mentorName} (${data.mentorEmail || 'no email'})`);
    console.log(`[Email]    Mentee: ${data.menteeName} (${data.menteeEmail || 'no email'})`);
    
    // Send email to mentor using Resend API
    if (data.mentorEmail) {
      try {
        const mentorResult = await resendClient.emails.send({
          from: fromEmail,
          to: data.mentorEmail,
          subject: `New Mentee Assigned: ${data.menteeName}`,
          html: getMentorEmailHTML(data, loginUrl),
          text: getMentorEmailText(data, loginUrl),
        });
        
        if (mentorResult.error) {
          const error = mentorResult.error as any;
          console.error(`[Email] ❌ Resend API error for mentor ${data.mentorEmail}:`, error);
          console.error(`[Email]    Error details:`, JSON.stringify(error, null, 2));
        } else if (mentorResult.data) {
          console.log(`[Email] ✅ Email sent successfully to mentor via Resend API: ${data.mentorEmail}`);
          console.log(`[Email]    Message ID: ${mentorResult.data.id || 'N/A'}`);
        }
      } catch (error: any) {
        console.error(`[Email] ❌ Failed to send email to mentor via Resend API:`, error.message);
      }
    }

    // Send email to mentee using Resend API
    if (data.menteeEmail) {
      try {
        const loginMethod = data.loginCredentials.email 
          ? `Email: ${data.loginCredentials.email}`
          : `Name: ${data.loginCredentials.name}`;
        
        console.log(`[Email] Attempting to send email to mentee: ${data.menteeEmail}`);
        console.log(`[Email]    From: ${fromEmail}`);
        console.log(`[Email]    Subject: Welcome! Your Mentor Assignment - ${data.mentorName}`);
        
        const menteeResult = await resendClient.emails.send({
          from: fromEmail,
          to: data.menteeEmail,
          subject: `Welcome! Your Mentor Assignment - ${data.mentorName}`,
          html: getMenteeEmailHTML(data, loginUrl, loginMethod),
          text: getMenteeEmailText(data, loginUrl, loginMethod),
        });
        
        // Log the full result for debugging
        console.log(`[Email] Resend API response for mentee:`, JSON.stringify(menteeResult, null, 2));
        
        if (menteeResult.error) {
          const error = menteeResult.error as any;
          console.error(`[Email] ❌ Resend API error for mentee ${data.menteeEmail}:`, error);
          console.error(`[Email]    Error details:`, JSON.stringify(error, null, 2));
          // Try to get more details about the error
          if (error.message) {
            console.error(`[Email]    Error message: ${error.message}`);
          }
          if (error.name) {
            console.error(`[Email]    Error name: ${error.name}`);
          }
          
          // Check if it's a domain verification error
          if (error.statusCode === 403 && error.message?.includes('verify a domain')) {
            console.error(`[Email]    ⚠️  DOMAIN VERIFICATION REQUIRED`);
            console.error(`[Email]    Resend free tier only allows sending to your own email address.`);
            console.error(`[Email]    To send to other recipients, verify a domain at https://resend.com/domains`);
            console.error(`[Email]    Then update SMTP_FROM to use your verified domain (e.g., noreply@yourdomain.com)`);
            console.error(`[Email]    See RESEND_DOMAIN_VERIFICATION.md for detailed instructions`);
          }
        } else if (menteeResult.data) {
          console.log(`[Email] ✅ Email sent successfully to mentee via Resend API: ${data.menteeEmail}`);
          console.log(`[Email]    Message ID: ${menteeResult.data.id || 'N/A'}`);
          if (menteeResult.data.id) {
            console.log(`[Email]    ✅ Confirmed: Email queued with ID ${menteeResult.data.id}`);
          }
        } else {
          console.warn(`[Email] ⚠️  Unexpected Resend API response format for mentee ${data.menteeEmail}`);
          console.warn(`[Email]    Response:`, JSON.stringify(menteeResult, null, 2));
        }
      } catch (error: any) {
        console.error(`[Email] ❌ Exception caught while sending email to mentee via Resend API:`, error.message);
        console.error(`[Email]    Error name: ${error.name || 'N/A'}`);
        console.error(`[Email]    Error stack:`, error.stack);
        console.error(`[Email]    Full error:`, JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      }
    }
    
    return; // Exit early - Resend API handled emails
  }

  // Use SMTP (Brevo or other SMTP provider)
  const transporter = await getTransporter();
  const smtpFrom = fromEmail || process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@autonex.com';

  // Check if SMTP is properly configured
  const isConfigured = !!(smtpHost && smtpUser && smtpPassword);

  if (!isConfigured) {
    console.warn('⚠️  EMAIL SERVICE NOT CONFIGURED');
    console.warn('   To enable email sending, add SMTP credentials to backend/.env:');
    console.warn('   For Brevo (Recommended - no domain verification needed):');
    console.warn('     SMTP_HOST=smtp-relay.brevo.com');
    console.warn('     SMTP_PORT=587');
    console.warn('     SMTP_USER=your-brevo-email@example.com');
    console.warn('     SMTP_PASSWORD=your-brevo-smtp-key');
    console.warn('     SMTP_FROM=your-brevo-email@example.com');
    console.warn('');
    console.warn('   Email details that would be sent:');
    console.warn(`   - To Mentor (${data.mentorEmail || 'N/A'}): New mentee ${data.menteeName} assigned`);
    console.warn(`   - To Mentee (${data.menteeEmail || 'N/A'}): Mentor ${data.mentorName} assigned`);
    console.warn('');
    return; // Exit early if not configured
  }

  const providerName = isBrevoConfigured ? 'Brevo' : 'SMTP';
  console.log(`[Email] 📧 Starting mentor assignment email process (using ${providerName})...`);
  console.log(`[Email]    Mentor: ${data.mentorName} (${data.mentorEmail || 'no email'})`);
  console.log(`[Email]    Mentee: ${data.menteeName} (${data.menteeEmail || 'no email'})`);
  console.log(`[Email]    Portal URL: ${portalUrl}`);
  console.log(`[Email]    Login URL: ${loginUrl}`);
  console.log(`[Email]    From address: ${smtpFrom}`);
  if (isBrevoConfigured) {
    console.log(`[Email]    ✅ Using Brevo SMTP (no domain verification needed)`);
  }

  // Helper functions for email content
  function getMentorEmailHTML(data: MentorAssignmentEmailData, loginUrl: string): string {
    return `
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
    `;
  }

  function getMentorEmailText(data: MentorAssignmentEmailData, loginUrl: string): string {
    return `
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
    `;
  }

  function getMenteeEmailHTML(data: MentorAssignmentEmailData, loginUrl: string, loginMethod: string): string {
    return `
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
    `;
  }

  function getMenteeEmailText(data: MentorAssignmentEmailData, loginUrl: string, loginMethod: string): string {
    return `
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
    `;
  }

  // Email to mentor (SMTP fallback)
  if (data.mentorEmail) {
    console.log(`[SMTP] Preparing email to mentor: ${data.mentorEmail}`);
    const mentorMailOptions = {
      from: smtpFrom,
      to: data.mentorEmail,
      subject: `New Mentee Assigned: ${data.menteeName}`,
      html: getMentorEmailHTML(data, loginUrl),
      text: getMentorEmailText(data, loginUrl),
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

  // Email to mentee (SMTP fallback)
  if (data.menteeEmail) {
    console.log(`[SMTP] Preparing email to mentee: ${data.menteeEmail}`);
    const loginMethod = data.loginCredentials.email 
      ? `Email: ${data.loginCredentials.email}`
      : `Name: ${data.loginCredentials.name}`;
    
    const menteeMailOptions = {
      from: smtpFrom,
      to: data.menteeEmail,
      subject: `Welcome! Your Mentor Assignment - ${data.mentorName}`,
      html: getMenteeEmailHTML(data, loginUrl, loginMethod),
      text: getMenteeEmailText(data, loginUrl, loginMethod),
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
