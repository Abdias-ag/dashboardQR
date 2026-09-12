import { NextResponse } from 'next/server';

const PUBLIC_PATHS = ['/login', '/forgot-password', '/reset-password', '/register', '/verify-email'];
const ADMIN_PATHS = ['/admin'];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Laisser passer les chemins publics et la page d'accueil
  if (pathname === '/') return NextResponse.next();
  const isPublic = PUBLIC_PATHS.some(p => pathname.startsWith(p));
  if (isPublic) return NextResponse.next();

  // Vérification du token dans les cookies (le localStorage n'est pas disponible côté serveur)
  // On utilise un cookie "accessToken" posé lors du login
  const token = request.cookies.get('accessToken')?.value;

  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Pour les routes admin, vérifier le rôle dans un cookie dédié
  const isAdminPath = ADMIN_PATHS.some(p => pathname.startsWith(p));
  if (isAdminPath) {
    const userRole = request.cookies.get('userRole')?.value;
    if (userRole !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api|uploads).*)',
  ],
};
