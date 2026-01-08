import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getSessionsCollection, SESSION_COOKIE_NAME } from "@/lib/sessions";

export async function POST() {
    const response = NextResponse.json({ ok: true });
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (sessionId) {
        const sessions = await getSessionsCollection();
        await sessions.deleteOne({ _id: sessionId });
    }

    response.cookies.set(SESSION_COOKIE_NAME, "", {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 0,
    });

    return response;
}
