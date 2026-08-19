import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';

// One-time setup: creates the first admin user. Permanently disabled once any
// admin account already exists, so this is safe to leave deployed.
export async function POST(request) {
  await connectDB();

  const existingCount = await User.countDocuments();
  if (existingCount > 0) {
    return NextResponse.json({ error: 'An admin account already exists' }, { status: 403 });
  }

  const { username, password } = await request.json();
  if (!username || !password) {
    return NextResponse.json({ error: 'username and password are required' }, { status: 400 });
  }

  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({
    username: username.toLowerCase().trim(),
    password: hash,
    role: 'admin',
  });

  return NextResponse.json({ success: true, username: user.username });
}
