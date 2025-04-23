import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that don't require authentication
const publicRoutes = ['/login', '/register']

export function middleware(request: NextRequest) {
	// Get the path from the request URL
	const path = request.nextUrl.pathname

	// Check if it's a public route
	const isPublicRoute = publicRoutes.some(route => path.startsWith(route))

	// Get token from cookies
	const token = request.cookies.get('token')?.value

	// If the route is not public and there's no token, redirect to login
	if (!isPublicRoute && !token) {
		// Store the original URL to redirect back after login
		const url = new URL('/login', request.url)
		url.searchParams.set('callbackUrl', encodeURI(request.url))

		return NextResponse.redirect(url)
	}

	// If there's a token and the user is on a login/register page, redirect to home
	if (isPublicRoute && token) {
		return NextResponse.redirect(new URL('/', request.url))
	}

	return NextResponse.next()
}

// Configure which routes the middleware applies to
export const config = {
	matcher: [
		// Apply to all routes except _next, api, static files, and public assets
		'/((?!_next/static|_next/image|favicon.ico|api|.*\\.).*)'
	]
}
