// Vercel Edge Middleware for SPA fallback
import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  // Allow static files, API routes, and root
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.match(/\.[^/]+$/) ||
    pathname === '/'
  ) {
    return NextResponse.next();
  }
  // Remove trailing slash for SPA routes (except root)
  if (pathname.length > 1 && pathname.endsWith('/')) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace(/\/$/, '');
    return NextResponse.redirect(url);
  }
  // Rewrite all other requests to /index.html for SPA routing
  return NextResponse.rewrite(new URL('/index.html', request.url));
}