import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getUsersCollection } from "@/lib/users";
import {
    ensureSessionIndexes,
    getSessionsCollection,
    SESSION_COOKIE_NAME,
    SESSION_MAX_AGE_SECONDS,
} from "@/lib/sessions";

type LoginPayload = {
    email?: string;
    password?: string;
};

export async function POST(request: Request) {
    let payload: LoginPayload;

    try {
        payload = (await request.json()) as LoginPayload;
    } catch {
        return NextResponse.json({ error: "Nieprawidłowe dane." }, { status: 400 });
    }

    const email = payload.email?.trim().toLowerCase() ?? "";
    const password = payload.password ?? "";

    if (!email || !password) {
        return NextResponse.json({ error: "E-mail i hasło są wymagane." }, { status: 400 });
    }

    const users = await getUsersCollection();
    const user = await users.findOne({ email });

    if (!user) {
        return NextResponse.json(
            { error: "Nieprawidłowy e-mail lub hasło." },
            { status: 401 },
        );
    }

    const matches = await bcrypt.compare(password, user.passwordHash);

    if (!matches) {
        return NextResponse.json(
            { error: "Nieprawidłowy e-mail lub hasło." },
            { status: 401 },
        );
    }

    await ensureSessionIndexes();
    const sessions = await getSessionsCollection();
    const sessionId = randomBytes(32).toString("hex");
    const now = new Date();
    const expiresAt = new Date(now.getTime() + SESSION_MAX_AGE_SECONDS * 1000);

    await sessions.insertOne({
        _id: sessionId,
        userId: user._id!,
        createdAt: now,
        expiresAt,
    });

    const response = NextResponse.json({
        user: { id: user._id?.toString(), name: user.name, email: user.email },
    });

    response.cookies.set(SESSION_COOKIE_NAME, sessionId, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: SESSION_MAX_AGE_SECONDS,
    });

    return response;
}
