import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow static files, Next.js internals, and public assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  const authSession = request.cookies.get('bukhari_erp_auth_session')?.value;

  // If user is not authenticated and trying to access protected routes, redirect to /login
  if (!authSession && pathname !== '/login') {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // If already authenticated and visits /login, redirect to main dashboard
  if (authSession && pathname === '/login') {
    const dashboardUrl = new URL('/', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // Role-Based Access Control (RBAC)
  if (authSession) {
    const userRole = request.cookies.get('bukhari_user_role')?.value;
    const adminOnlyPaths = ['/admin'];
    
    const isTryingToAccessAdminRoute = adminOnlyPaths.some(p => pathname.startsWith(p));
    
    if (isTryingToAccessAdminRoute && userRole !== 'Admin') {
      // Redirect staff back to dashboard if they try to access admin pages
      const dashboardUrl = new URL('/', request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
