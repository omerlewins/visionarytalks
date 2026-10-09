import { NextResponse, type NextRequest } from "next/server";
import redirects from "./data/legacy-redirects.json";
export function proxy(request: NextRequest) {
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
