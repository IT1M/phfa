import nodemailer from 'nodemailer';
import { logger } from './logger';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendEmail = async (
  to: string,
  subject: string,
  html: string
): Promise<boolean> => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });
    logger.info(`Email sent to ${to}`);
    return true;
  } catch (error) {
    logger.error('Email sending error:', error);
    return false;
  }
};

export const sendWelcomeEmail = async (email: string): Promise<boolean> => {
  const html = `
    <h1>Welcome to Medical Document Management</h1>
    <p>Thank you for registering. You can now upload and manage your medical documents securely.</p>
    <p>Your data is encrypted and compliant with HIPAA and Saudi MOH standards.</p>
  `;
  return sendEmail(email, 'Welcome to Medical Document Management', html);
};
