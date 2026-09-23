import { NextResponse } from "next/server";

export async function GET() {
    try {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}${process.env.NEXT_PUBLIC_END_POINT}get-system-languages-codes`,
            { cache: "force-cache", next: { tags: ["lang-codes"] } }
        );

        const data = await res.json();

        const defaultLangCode = (
            data?.data?.default_language_code || "en"
        ).toLowerCase();

        const supportedLangs = (data?.data?.language_codes || []).map((lng) =>
            lng.toLowerCase()
        );

        if (!supportedLangs.includes(defaultLangCode)) {
            supportedLangs.push(defaultLangCode);
        }

        return NextResponse.json({ supportedLangs, defaultLangCode });
    } catch {
        return NextResponse.json({
            supportedLangs: ["en"],
            defaultLangCode: "en",
        });
    }
}
