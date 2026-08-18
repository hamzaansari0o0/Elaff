import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { requireAdmin } from '@/lib/auth';
import Inquiry from '@/models/Inquiry';

export async function PATCH(request, { params }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  const { id } = await params;
  const body = await request.json();

  const inquiry = await Inquiry.findByIdAndUpdate(
    id,
    { status: body.status },
    { returnDocument: 'after', runValidators: true }
  );
  if (!inquiry) {
    return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
  }
  return NextResponse.json(inquiry);
}

export async function DELETE(request, { params }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  const { id } = await params;
  const inquiry = await Inquiry.findByIdAndDelete(id);
  if (!inquiry) {
    return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
