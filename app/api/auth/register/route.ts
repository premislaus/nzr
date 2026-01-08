import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { ensureUserIndexes, getUsersCollection } from "@/lib/users";

type RegisterPayload = {
    name?: string;
    email?: string;
    password?: string;
    gender?: "man" | "woman";
};

export async function POST(request: Request) {
    let payload: RegisterPayload;

    try {
        payload = (await request.json()) as RegisterPayload;
    } catch {
        return NextResponse.json({ error: "Nieprawidłowe dane." }, { status: 400 });
    }

    const name = payload.name?.trim() ?? "";
    const email = payload.email?.trim().toLowerCase() ?? "";
    const password = payload.password ?? "";
    const gender = payload.gender ?? null;

    if (!name || !email || !password || !gender) {
        return NextResponse.json({ error: "Wszystkie pola są wymagane." }, { status: 400 });
    }

    if (!email.includes("@")) {
        return NextResponse.json({ error: "Podaj poprawny adres e-mail." }, { status: 400 });
    }

    if (password.length < 8) {
        return NextResponse.json(
            { error: "Hasło musi mieć co najmniej 8 znaków." },
            { status: 400 },
        );
    }

    if (gender !== "man" && gender !== "woman") {
        return NextResponse.json({ error: "Wybierz płeć." }, { status: 400 });
    }

    await ensureUserIndexes();
    const users = await getUsersCollection();
    const passwordHash = await bcrypt.hash(password, 12);

    try {
        const result = await users.insertOne({
            name,
            email,
            gender,
            passwordHash,
            createdAt: new Date(),
        });

        return NextResponse.json(
            { user: { id: result.insertedId.toString(), name, email, gender } },
            { status: 201 },
        );
    } catch (error) {
        if (error instanceof Error && error.message.includes("E11000")) {
            return NextResponse.json({ error: "Ten e-mail już istnieje." }, { status: 409 });
        }

        return NextResponse.json({ error: "Błąd serwera." }, { status: 500 });
    }
}
