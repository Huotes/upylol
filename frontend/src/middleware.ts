import { NextResponse, type NextRequest } from "next/server";

const VALID_REGIONS = new Set([
  "br1", "na1", "euw1", "eun1", "kr", "jp1",
  "la1", "la2", "oc1", "tr1", "ru",
]);

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Validate region in player routes
  const match = pathname.match(/^\/player\/([^/]+)\//);
  if (match && !VALID_REGIONS.has(match[1])) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/player/:region/:path*"],
};
