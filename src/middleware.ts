import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';

// List of paths that require authentication
const protectedPaths = [
  '/profile',
  '/settings',
  '/library',
  '/social',
  '/playlists/create',
  '/music-management',
];

// List of paths that are only accessible to non-authenticated users
const authPaths = ['/login', '/register', '/forgot-password'];

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const isAuthenticated = !!token;
  const path = request.nextUrl.pathname;

  // Check if the path is protected and user is not authenticated
  const isProtectedPath = protectedPaths.some(protectedPath =>
    path === protectedPath || path.startsWith(`${protectedPath}/`)
  );

  if (isProtectedPath && !isAuthenticated) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('callbackUrl', encodeURI(request.url));
    return NextResponse.redirect(redirectUrl);
  }

  // Check if the path is for non-authenticated users and user is authenticated
  const isAuthPath = authPaths.some(authPath =>
    path === authPath || path.startsWith(`${authPath}/`)
  );

  if (isAuthPath && isAuthenticated) {
    return NextResponse.redirect(new URL('/', request.url));
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
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
  ],
};
