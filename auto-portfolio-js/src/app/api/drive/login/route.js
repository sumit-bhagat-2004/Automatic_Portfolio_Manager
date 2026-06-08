import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const { password } = await request.json();
    const drivePassword = process.env.DRIVE_PASSWORD || process.env.ADMIN_PASSWORD || 'admin123';
    
    if (password === drivePassword) {
      const cookieStore = await cookies();
      cookieStore.set('drive_authenticated', 'true', {
        httpOnly: true,
        secure: request.url.startsWith('https:'),
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      });
      
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
