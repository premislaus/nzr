import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getUsersCollection } from "@/lib/users";

type ProfilePayload = {
    name?: string;
    city?: string;
    birthYear?: string | number;
    height?: string | number;
    bio?: string;
    interests?: string[] | string;
};

export async function GET() {
    const user = await getCurrentUser();

    if (!user) {
        return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });
    }

    return NextResponse.json({
        profile: {
            name: user.name ?? "",
            email: user.email ?? "",
            gender: user.gender ?? "",
            city: user.city ?? "",
            birthYear: user.birthYear ?? "",
            height: user.height ?? "",
            bio: user.bio ?? "",
            interests: user.interests ?? [],
        },
    });
}

export async function PATCH(request: Request) {
    const user = await getCurrentUser();

    if (!user) {
        return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });
    }

    let payload: ProfilePayload;

    try {
        payload = (await request.json()) as ProfilePayload;
    } catch {
        return NextResponse.json({ error: "Nieprawidłowe dane." }, { status: 400 });
    }

    const set: Record<string, unknown> = {};
    const unset: Record<string, ""> = {};

    const setOrUnset = (key: string, value: unknown) => {
        if (value === null || value === undefined || value === "") {
            unset[key] = "";
            return;
        }
        set[key] = value;
    };

    const normalizeText = (value: unknown) =>
        typeof value === "string" ? value.trim() : value;

    setOrUnset("name", normalizeText(payload.name));
    setOrUnset("city", normalizeText(payload.city));
    setOrUnset("bio", normalizeText(payload.bio));
    const normalizeInterests = (value: ProfilePayload["interests"]) => {
        if (!value) {
            return [];
        }
        if (Array.isArray(value)) {
            return value
                .map((item) => (typeof item === "string" ? item.trim() : ""))
                .filter(Boolean);
        }
        return value
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);
    };

    if (payload.interests !== undefined) {
        const interests = normalizeInterests(payload.interests).slice(0, 12);
        if (interests.length === 0) {
            unset.interests = "";
        } else {
            set.interests = interests;
        }
    }
    if (payload.birthYear !== undefined) {
        if (payload.birthYear === "" || payload.birthYear === null) {
            unset.birthYear = "";
        } else {
            const birthYearValue =
                typeof payload.birthYear === "string"
                    ? Number(payload.birthYear)
                    : payload.birthYear;
            const currentYear = new Date().getFullYear();
            const minYear = currentYear - 99;
            const maxYear = currentYear - 18;

            if (
                !Number.isFinite(birthYearValue) ||
                birthYearValue < minYear ||
                birthYearValue > maxYear
            ) {
                return NextResponse.json(
                    { error: "Rok urodzenia musi oznaczać wiek 18-99." },
                    { status: 400 },
                );
            }
            set.birthYear = birthYearValue;
        }
    }

    if (payload.height !== undefined) {
        if (payload.height === "" || payload.height === null) {
            unset.height = "";
        } else {
            const heightValue =
                typeof payload.height === "string" ? Number(payload.height) : payload.height;
            if (!Number.isFinite(heightValue) || heightValue < 120 || heightValue > 230) {
                return NextResponse.json(
                    { error: "Wzrost musi być w zakresie 120-230 cm." },
                    { status: 400 },
                );
            }
            set.height = heightValue;
        }
    }

    set.updatedAt = new Date();

    const users = await getUsersCollection();
    await users.updateOne(
        { _id: user._id },
        {
            ...(Object.keys(set).length > 0 ? { $set: set } : {}),
            ...(Object.keys(unset).length > 0 ? { $unset: unset } : {}),
        },
    );

    return NextResponse.json({ ok: true });
}
