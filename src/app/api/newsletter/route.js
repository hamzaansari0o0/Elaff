import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireAdmin } from '@/lib/auth';
import Subscriber from '@/models/Subscriber';

// Public: anyone can subscribe from the homepage newsletter form.
export async function POST(request) {
  await connectDB();
  const { email } = await request.json();

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  try {
    await Subscriber.create({ email });
  } catch (err) {
    // Already subscribed — treat as success rather than an error.
    if (err.code !== 11000) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}

// Admin-only: view all subscribers.
export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  const subscribers = await Subscriber.find().sort({ createdAt: -1 });
  return NextResponse.json(subscribers);
}
