import { NextResponse } from 'next/server';

export function middleware(request) {
  const url = request.nextUrl;
  const isAdminRoute = url.pathname.startsWith('/admin');
  const isLoginPage = url.pathname === '/admin/login';

  if (isAdminRoute && !isLoginPage) {
    const auth = request.cookies.get('admin-auth')?.value;
    if (auth !== 'yes') {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
