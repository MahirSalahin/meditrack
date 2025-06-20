import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import {
    publicRoutes,
    authRoutes,
    apiAuthPrefix,
    DEFAUTL_UNAUTH_REDIRECT
} from './routes';
import { auth } from './auth';
import { UserType } from './types/user';

/**
 * Authentication middleware for Next.js 15
 * Handles route protection and redirects based on authentication status
 */
export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check if the pathname is in the public routes or API auth routes
    // These routes are accessible without authentication
    const isPublicRoute = publicRoutes.includes(pathname);
    const isApiAuthRoute = pathname.startsWith(apiAuthPrefix);
    const isAuthRoute = authRoutes.includes(pathname);

    // Allow public routes and API auth routes to pass through
    if (isPublicRoute || isApiAuthRoute) {
        return NextResponse.next();
    }

    // Get the session token from the request
    const session = await auth();
    const isAuthenticated = !!session;

    const userType = session?.user.user_type as UserType;

    function redirectToDashboard() {
        if (userType === UserType.DOCTOR) {
            return NextResponse.redirect(new URL('/doctor/dashboard', request.url));
        } else if (userType === UserType.PATIENT) {
            return NextResponse.redirect(new URL('/patient/dashboard', request.url));
        } else if (userType === UserType.SYSTEM_ADMIN) {
            return NextResponse.redirect(new URL('/admin/dashboard', request.url));
        }
    }

    // Handle auth routes (login, register)
    if (isAuthRoute) {
        if (isAuthenticated) {
            // Check if it's the login page with a callback URL
            if (pathname === '/auth/login') {
                const callbackUrl = request.nextUrl.searchParams.get('callbackUrl')
                if (callbackUrl) {
                    // Redirect to the callback URL
                    return NextResponse.redirect(new URL(callbackUrl, request.url))
                }
            }
            // If no callback URL or not login page, redirect to dashboard
            return redirectToDashboard()
        }
        // User is not authenticated, allow access to auth routes
        return NextResponse.next();
    }

    // Handle protected routes
    // Redirect to login if user is not authenticated
    if (!isAuthenticated) {
        const redirectUrl = new URL(DEFAUTL_UNAUTH_REDIRECT, request.url);
        // Preserve the original URL as a callback parameter
        redirectUrl.searchParams.set('callbackUrl', pathname);
        return NextResponse.redirect(redirectUrl);
    }

    // Check if user is accessing routes appropriate for their user type
    if (!pathname.startsWith(`/${userType}`)) return redirectToDashboard()


    return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
    matcher: [
        // Match all routes except for:
        // - API routes that don't start with the auth prefix
        // - Static files (assets, images, etc.)
        // - Favicon
        '/((?!api/(?!auth)|_next/static|_next/image|favicon.ico).*)',
    ],
};