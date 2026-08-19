import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/mongodb';
import User from '@/models/User';
import { signAdminToken, ADMIN_COOKIE_NAME } from '@/lib/auth';

export async function POST(request) {
  const { username, password } = await request.json();

  if (!username || !password) {
    return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
  }

  await connectDB();
  const user = await User.findOne({ username: username.toLowerCase().trim() });
  const validPassword = user && (await bcrypt.compare(password, user.password));

  if (!user || !validPassword) {
    return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
  }

  const token = signAdminToken(user);
  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  return response;
}
