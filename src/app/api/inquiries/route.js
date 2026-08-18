import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireAdmin } from '@/lib/auth';
import Inquiry from '@/models/Inquiry';

// Public: any visitor can submit an inquiry from the product page's order modal.
export async function POST(request) {
  await connectDB();
  const body = await request.json();

  if (!body.name || !body.email || !body.quantity || !body.productTitle) {
    return NextResponse.json({ error: 'name, email, quantity and productTitle are required' }, { status: 400 });
  }

  const inquiry = await Inquiry.create({
    name: body.name,
    email: body.email,
    phone: body.phone || '',
    quantity: body.quantity,
    message: body.message || '',
    productTitle: body.productTitle,
    productSlug: body.productSlug || '',
  });

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
