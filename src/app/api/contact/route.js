import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireAdmin } from '@/lib/auth';
import ContactMessage from '@/models/ContactMessage';
import { sendMail } from '@/lib/mailer';

function buildNotificationEmail(msg, adminUrl) {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;">
      <div style="background:#0F172A;padding:20px 24px;border-radius:8px 8px 0 0;">
        <p style="margin:0;color:#fff;font-size:16px;font-weight:bold;">New Contact Message</p>
      </div>
      <div style="border:1px solid #E2E8F0;border-top:none;padding:24px;border-radius:0 0 8px 8px;">
        <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
          <tr><td style="padding:4px 0;font-size:13px;color:#64748B;width:90px;">Name</td><td style="padding:4px 0;font-size:13px;color:#0F172A;font-weight:bold;">${msg.name}</td></tr>
          <tr><td style="padding:4px 0;font-size:13px;color:#64748B;">Email</td><td style="padding:4px 0;font-size:13px;color:#0F172A;"><a href="mailto:${msg.email}" style="color:#0D9488;">${msg.email}</a></td></tr>
          ${msg.phone ? `<tr><td style="padding:4px 0;font-size:13px;color:#64748B;">Phone</td><td style="padding:4px 0;font-size:13px;color:#0F172A;">${msg.phone}</td></tr>` : ''}
        </table>
        <p style="font-size:12px;font-weight:bold;color:#64748B;text-transform:uppercase;letter-spacing:0.05em;margin:0 0 6px;">Message</p>
        <p style="font-size:13px;color:#334155;line-height:1.5;margin:0 0 16px;white-space:pre-line;">${msg.message}</p>
        <a href="${adminUrl}" style="display:inline-block;background:#0D9488;color:#fff;text-decoration:none;font-size:13px;font-weight:bold;padding:10px 18px;border-radius:6px;">View in Admin Panel</a>
      </div>
    </div>
  `;

  const text = `New contact message from ${msg.name} (${msg.email}${msg.phone ? `, ${msg.phone}` : ''})\n\n${msg.message}\n\nView in admin panel: ${adminUrl}`;

  return { html, text };
}

// Public: visitors submit this from the /contact page form.
export async function POST(request) {
  await connectDB();
  const body = await request.json();

  if (!body.name || !body.email || !body.message) {
    return NextResponse.json({ error: 'name, email and message are required' }, { status: 400 });
  }

  const contactMessage = await ContactMessage.create({
    name: body.name,
    email: body.email,
    phone: body.phone || '',
    message: body.message,
  });

  // Notify the admin by email — best-effort, must never block the message from being saved.
  const notifyTo = process.env.INQUIRY_NOTIFY_EMAIL;
  if (notifyTo) {
    const adminUrl = new URL('/admin/contact-messages', request.nextUrl.origin).toString();
    const { html, text } = buildNotificationEmail(contactMessage, adminUrl);
    sendMail({
      to: notifyTo,
      subject: `New Contact Message from ${contactMessage.name} — Elaff Trade Co.`,
      html,
      text,
    }).catch((err) => console.error('Failed to send contact notification email:', err));
  }

  return NextResponse.json(contactMessage, { status: 201 });
}

// Admin-only: view all submitted contact messages.
export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  const messages = await ContactMessage.find().sort({ createdAt: -1 });
  return NextResponse.json(messages);
}
