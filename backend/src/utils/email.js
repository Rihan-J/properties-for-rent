const nodemailer = require('nodemailer');
const { SMTP_EMAIL, SMTP_PASSWORD, FRONTEND_URL } = require('../config/env');

/**
 * Send a verification email using Nodemailer and Gmail SMTP.
 * Gives you 500 emails/day for free.
 *
 * @param {string} toEmail - Recipient email address
 * @param {string} name - User's display name
 * @param {string} verificationToken - The one-time token for email verification
 * @returns {Promise<boolean>} true if sent successfully
 */
async function sendVerificationEmail(toEmail, name, verificationToken) {
  const verifyUrl = `${FRONTEND_URL}/auth/verify?token=${encodeURIComponent(verificationToken)}`;

  const htmlBody = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="font-size: 24px; color: #1a1815; margin: 0;">Properties for Rents</h1>
      </div>
      <p style="font-size: 16px; color: #333; line-height: 1.6;">Hi ${name},</p>
      <p style="font-size: 16px; color: #333; line-height: 1.6;">
        Welcome! Please verify your email address to activate your account.
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${verifyUrl}"
           style="display: inline-block; background: #1a1815; color: #ffffff; font-weight: 700; font-size: 14px; padding: 14px 32px; border-radius: 12px; text-decoration: none;">
          Verify Email Address
        </a>
      </div>
      <p style="font-size: 13px; color: #888; line-height: 1.5;">
        This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.
      </p>
      <hr style="border: none; border-top: 1px solid #e8e2db; margin: 24px 0;" />
      <p style="font-size: 12px; color: #aaa; text-align: center;">
        Properties for Rents &copy; ${new Date().getFullYear()}
      </p>
    </div>
  `;

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: SMTP_EMAIL,
        pass: SMTP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"Properties for Rents" <${SMTP_EMAIL}>`,
      to: toEmail,
      subject: 'Verify your email — Properties for Rents',
      html: htmlBody,
    });

    console.log(`[EMAIL] Verification email sent to ${toEmail}`);
    return true;
  } catch (err) {
    console.error('[EMAIL] Failed to send verification email via Nodemailer:', err.message);
    return false;
  }
}

module.exports = { sendVerificationEmail };
