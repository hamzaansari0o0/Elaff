import nodemailer from 'nodemailer';

let transporter;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }
  return transporter;
}

// Best-effort — callers should not let a failed send block the action that triggered it
// (e.g. an inquiry must still save even if notifying the admin fails).
export async function sendMail({ to, subject, html, text }) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.error('sendMail skipped: GMAIL_USER / GMAIL_APP_PASSWORD not configured');
    return { skipped: true };
  }

  await getTransporter().sendMail({
    from: `"Elaff Trade Co." <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html,
    text,
  });
  console.log(`Email sent to ${to}: "${subject}"`);
  return { skipped: false };
}
