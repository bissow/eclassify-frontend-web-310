import { NextResponse } from "next/server";
import { SEED_COOKIE, SEED_HEADER } from "@/lib/constants";

// No max-age → session cookie: one seed per browser session, shared across tabs,
// surviving refresh and gone when the browser closes. 16 hex chars (64 bits) is
// plenty of entropy for a shuffle seed and keeps the header short.
const mintSeedKey = (request) =>
    request.cookies.get(SEED_COOKIE)?.value ||
    crypto.randomUUID().replace(/-/g, "").slice(0, 16);

const withSessionCookies = (response, lang, seedKey) => {
    response.cookies.set("lang", lang, { path: "/", httpOnly: false });
    // Not httpOnly — the browser's get-reels calls read it back in
    // AxiosInterceptors so client pagination keeps the server's shuffle.
    response.cookies.set(SEED_COOKIE, seedKey, {
        path: "/",
        httpOnly: false,
        sameSite: "lax",
    });
    return response;
};

async function getLangCodes(request) {
    const host = request.headers.get("host");
    const proto = (request.headers.get("x-forwarded-proto") || "https").split(",")[0].trim();
    try {
        const res = await fetch(`${proto}://${host}/api/lang-codes`);
        if (!res.ok) throw new Error(`lang-codes fetch failed: ${res.status}`);
        return res.json();
    } catch {
        const res = await fetch(`${process.env.NEXT_PUBLIC_WEB_URL}/api/lang-codes`);
        return res.json();
    }
}

export async function proxy(request) {
    const { supportedLangs, defaultLangCode } = await getLangCodes(request);

    const { pathname } = request.nextUrl;
    const firstSegment = pathname.split("/").filter(Boolean)[0]?.toLowerCase();
    const seedKey = mintSeedKey(request);

    // Step 2: default lang prefix → strip and redirect
    if (firstSegment === defaultLangCode) {
        const segments = pathname.split("/").filter(Boolean);
        const rest = segments.slice(1).join("/");
        const newPath = rest ? `/${rest}` : "/";
        const redirectUrl = new URL(newPath, request.url);
        redirectUrl.search = request.nextUrl.search;
        return withSessionCookies(
            NextResponse.redirect(redirectUrl, { status: 301 }),
            defaultLangCode,
            seedKey
        );
    }

    // Expose pathname to Server Components (RSC headers() can't read it) — the
    // layout uses it to detect the home route for the landing redirect.
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-pathname", pathname);
    // Same reason: a cookie set on the response isn't visible to cookies() during
    // this render, so the first visit would fetch reels without a seed.
    requestHeaders.set(SEED_HEADER, seedKey);

    // Step 3: valid non-default lang prefix → pass through as-is
    if (firstSegment && supportedLangs.includes(firstSegment)) {
        return withSessionCookies(
            NextResponse.next({ request: { headers: requestHeaders } }),
            firstSegment,
            seedKey
        );
    }

    // Step 4: no lang prefix → rewrite internally to /{defaultLang}{pathname}
    const rewritePath = pathname === "/" ? `/${defaultLangCode}` : `/${defaultLangCode}${pathname}`;
    const rewriteUrl = new URL(rewritePath, request.url);
    rewriteUrl.search = request.nextUrl.search;
    return withSessionCookies(
        NextResponse.rewrite(rewriteUrl, { request: { headers: requestHeaders } }),
        defaultLangCode,
        seedKey
    );
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
