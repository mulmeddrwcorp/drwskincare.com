import { NextResponse } from 'next/server';

// Root middleware is intentionally minimal. The app-level middleware lives in `src/middleware.ts`.
export default function middleware(req: Request) {
	return NextResponse.next();
}

export const config = {
	matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

