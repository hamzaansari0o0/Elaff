import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireAdmin } from '@/lib/auth';
import Inquiry from '@/models/Inquiry';

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
