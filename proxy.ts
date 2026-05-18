import { NextResponse, type NextRequest } from "next/server";
import { locales, defaultLocale, type Locale } from "./app/i18n/config";

const LOCALE_COOKIE = "lang";

function pickLocale(request: NextRequest): Locale {
  const cookie = request.cookies.get(LOCALE_COOKIE)?.value;
  if (cookie && (locales as readonly string[]).includes(cookie)) {
    return cookie as Locale;
  }
  const header = request.headers.get("accept-language");
  if (!header) return defaultLocale;
  const candidates = header
    .split(",")
    .map((entry) => {
      const [tag, q] = entry.trim().split(";q=");
      return { tag: tag.toLowerCase(), q: q ? parseFloat(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);
  for (const { tag } of candidates) {
    const exact = locales.find((l) => l.toLowerCase() === tag);
    if (exact) return exact;
  }
  for (const { tag } of candidates) {
    const base = tag.split("-")[0];
    if (base === "pt") {
      // Pick BR for ambiguous "pt" — larger speaker base.
      return "pt-BR";
    }
    const match = locales.find((l) => l.split("-")[0] === base);
    if (match) return match;
  }
  return defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasLocale = locales.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`),
  );
  if (hasLocale) return NextResponse.next();

  const locale = pickLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  const response = NextResponse.redirect(url, 308);
  response.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return response;
}

export const config = {
  matcher: ["/((?!_next|api|favicon|.*\\.[\\w]+$).*)"],
};
