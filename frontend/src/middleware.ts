import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');
  
  const isLoginPage = request.nextUrl.pathname === '/login';
  const isSetupPage = request.nextUrl.pathname === '/setup';
  const isDashboardPage = request.nextUrl.pathname.startsWith('/dashboard');
  
  // Redirect to login if accessing dashboard without token
  if (isDashboardPage && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Redirect to dashboard if accessing login or setup with valid token
  if ((isLoginPage || isSetupPage) && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/setup']
};