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
// Pass replyTo as the customer's email so Gmail treats this as a legitimate reply-chain
// notification rather than unsolicited bulk mail, which helps avoid the spam folder.
export async function sendMail({ to, subject, html, text, replyTo }) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.error('sendMail skipped: GMAIL_USER / GMAIL_APP_PASSWORD not configured');
    return { skipped: true };
  }

  const mailOptions = {
    from: `"Elaff Trade Co. Notifications" <${process.env.GMAIL_USER}>`,
    to,
    subject,
    html,
    text,
    headers: {
      'X-Priority': '1',
      'X-MSMail-Priority': 'High',
      'Importance': 'high',
      'Precedence': 'first-class',
    },
  };

  if (replyTo) {
    mailOptions.replyTo = replyTo;
  }

  await getTransporter().sendMail(mailOptions);
  console.log(`Email sent to ${to}: "${subject}"`);
  return { skipped: false };
}
