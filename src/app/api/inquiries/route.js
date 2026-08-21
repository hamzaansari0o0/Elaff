import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireAdmin } from '@/lib/auth';
import Inquiry from '@/models/Inquiry';
import { sendMail } from '@/lib/mailer';

function buildNotificationEmail(inquiry, adminUrl) {
  const itemRows = inquiry.items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #E2E8F0;font-size:13px;color:#0F172A;">${item.productTitle}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #E2E8F0;font-size:13px;color:#475569;">${item.quantity}</td>
        </tr>`
    )
    .join('');

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;">
      <div style="background:#0F172A;padding:20px 24px;border-radius:8px 8px 0 0;">
        <p style="margin:0;color:#fff;font-size:16px;font-weight:bold;">New Inquiry Received</p>
      </div>
      <div style="border:1px solid #E2E8F0;border-top:none;padding:24px;border-radius:0 0 8px 8px;">
        <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
          <tr><td style="padding:4px 0;font-size:13px;color:#64748B;width:90px;">Name</td><td style="padding:4px 0;font-size:13px;color:#0F172A;font-weight:bold;">${inquiry.name}</td></tr>
          <tr><td style="padding:4px 0;font-size:13px;color:#64748B;">Email</td><td style="padding:4px 0;font-size:13px;color:#0F172A;"><a href="mailto:${inquiry.email}" style="color:#0D9488;">${inquiry.email}</a></td></tr>
          ${inquiry.phone ? `<tr><td style="padding:4px 0;font-size:13px;color:#64748B;">Phone</td><td style="padding:4px 0;font-size:13px;color:#0F172A;">${inquiry.phone}</td></tr>` : ''}
        </table>

        <p style="font-size:12px;font-weight:bold;color:#64748B;text-transform:uppercase;letter-spacing:0.05em;margin:0 0 8px;">Products</p>
        <table style="width:100%;border-collapse:collapse;background:#F8FAFC;border-radius:6px;overflow:hidden;margin-bottom:16px;">
          <tr>
            <th style="text-align:left;padding:8px 12px;font-size:11px;color:#64748B;text-transform:uppercase;border-bottom:1px solid #E2E8F0;">Product</th>
            <th style="text-align:left;padding:8px 12px;font-size:11px;color:#64748B;text-transform:uppercase;border-bottom:1px solid #E2E8F0;">Quantity</th>
          </tr>
          ${itemRows}
        </table>

        ${
          inquiry.message
            ? `<p style="font-size:12px;font-weight:bold;color:#64748B;text-transform:uppercase;letter-spacing:0.05em;margin:0 0 6px;">Message</p>
               <p style="font-size:13px;color:#334155;line-height:1.5;margin:0 0 16px;white-space:pre-line;">${inquiry.message}</p>`
            : ''
        }

        <a href="${adminUrl}" style="display:inline-block;background:#0D9488;color:#fff;text-decoration:none;font-size:13px;font-weight:bold;padding:10px 18px;border-radius:6px;">View in Admin Panel</a>
      </div>
    </div>
  `;

  const text = `New inquiry from ${inquiry.name} (${inquiry.email}${inquiry.phone ? `, ${inquiry.phone}` : ''})\n\nProducts:\n${inquiry.items
    .map((i) => `- ${i.productTitle} x ${i.quantity}`)
    .join('\n')}\n\n${inquiry.message ? `Message: ${inquiry.message}\n\n` : ''}View in admin panel: ${adminUrl}`;

  return { html, text };
}

// Public: any visitor can submit an inquiry from the product page's order modal
// or the cart's "Inquire Now" bar — both send one or more items.
export async function POST(request) {
  await connectDB();
  const body = await request.json();

  if (!body.name || !body.email || !Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: 'name, email and at least one item are required' }, { status: 400 });
  }

  const items = body.items.map((item) => ({
    productTitle: item.productTitle,
    productSlug: item.productSlug || '',
    quantity: item.quantity,
  }));

  if (items.some((item) => !item.productTitle || !item.quantity)) {
    return NextResponse.json({ error: 'Each item needs a productTitle and quantity' }, { status: 400 });
  }

  const inquiry = await Inquiry.create({
    name: body.name,
    email: body.email,
    phone: body.phone || '',
    message: body.message || '',
    items,
  });

  // Notify the admin by email — best-effort, must never block the inquiry from being saved.
  const notifyTo = process.env.INQUIRY_NOTIFY_EMAIL;
  if (notifyTo) {
    const adminUrl = new URL('/admin/inquiries', request.nextUrl.origin).toString();
    const { html, text } = buildNotificationEmail(inquiry, adminUrl);
    sendMail({
      to: notifyTo,
      subject: `New Inquiry from ${inquiry.name} — Elaff Trade Co.`,
      html,
      text,
    }).catch((err) => console.error('Failed to send inquiry notification email:', err));
  }

  return NextResponse.json(inquiry, { status: 201 });
}

// Admin-only: view all submitted inquiries.
export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  const inquiries = await Inquiry.find().sort({ createdAt: -1 });
  return NextResponse.json(inquiries);
}
