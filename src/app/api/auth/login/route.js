import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { signAdminToken, ADMIN_COOKIE_NAME } from '@/lib/auth';

export async function POST(request) {
  const { username, password } = await request.json();

  const validUsername = username === process.env.ADMIN_USERNAME;
  const validPassword =
    validUsername &&
    (await bcrypt.compare(password || '', process.env.ADMIN_PASSWORD_HASH));

  if (!validUsername || !validPassword) {
    return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
  }

  const token = signAdminToken();
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
