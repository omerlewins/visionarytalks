import { NextResponse, type NextRequest } from "next/server";
import redirects from "./data/legacy-redirects.json";
import { legacyAuthorDestination } from "./lib/legacy-author-routes";
export function proxy(request: NextRequest) {
  const authorDestination = legacyAuthorDestination(request.nextUrl.pathname);
  if (authorDestination)
    return NextResponse.redirect(
      new URL(authorDestination + request.nextUrl.search, request.url),
      301,
    );
  const redirect = redirects.find((r) => r.source === request.nextUrl.pathname);
  if (redirect)
    return NextResponse.redirect(
      new URL(redirect.destination + request.nextUrl.search, request.url),
      301,
    );
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-visionary-path", request.nextUrl.pathname);
  return NextResponse.next({ request: { headers: requestHeaders } });
}
export const config = {
  matcher: ["/((?!api|admin|_next|reference|favicon.ico).*)"],
};
