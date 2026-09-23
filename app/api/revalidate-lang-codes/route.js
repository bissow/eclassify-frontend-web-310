import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function POST() {
    revalidateTag("lang-codes", "max");
    return NextResponse.json({ revalidated: true });
}
