const nodemailer = require('nodemailer');

let transporter;
let transporterVerified = false;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  return transporter;
};

/**
 * Verify email transporter connection on first use.
 * Logs a clear success/failure message to help diagnose Gmail App Password issues.
 */
const verifyTransporter = async () => {
  if (transporterVerified) return true;

  try {
    await getTransporter().verify();
    console.log('✅ Email transporter verified — Gmail connection is working');
    transporterVerified = true;
    return true;
  } catch (err) {
    console.error('❌ Email transporter verification failed:', err.message);

    if (err.message.includes('Invalid login') || err.message.includes('AUTH')) {
      console.error(
        '💡 Gmail requires an App Password (not your regular password).\n' +
        '   1. Enable 2-Step Verification on your Google account\n' +
        '   2. Go to https://myaccount.google.com/apppasswords\n' +
        '   3. Generate an App Password for "Mail"\n' +
        '   4. Set EMAIL_PASS in your .env to that 16-character password'
      );
    }

    return false;
  }
};

const sendEmail = async (to, subject, html) => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('⚠️  Email credentials are not configured (EMAIL_USER / EMAIL_PASS missing)');
      return null;
    }

    // Verify connection on first email send
    const isVerified = await verifyTransporter();
    if (!isVerified) {
      console.error(`⚠️  Skipping email to ${to} — transporter not verified`);
      return null;
    }

    const mailOptions = {
      from: `"Eventora" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    const result = await getTransporter().sendMail(mailOptions);
    console.log(`📧 Email sent to ${to}: ${subject}`);
    return result;
  } catch (err) {
    console.error(`❌ Email send failed to ${to}:`, err.message);

    // Reset transporter on auth errors so it re-verifies next time
    if (err.message.includes('Invalid login') || err.message.includes('AUTH')) {
      transporter = null;
      transporterVerified = false;
    }

    return null;
  }
};

module.exports = sendEmail;
