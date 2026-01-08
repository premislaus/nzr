import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getUsersCollection } from "@/lib/users";

type SettingsPayload = {
    lookingFor?: string;
    ageRange?: string;
};

export async function GET() {
    const user = await getCurrentUser();

    if (!user) {
        return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });
    }

    return NextResponse.json({
        preferences: {
            lookingFor: user.lookingFor ?? "",
            ageRange: user.ageRange ?? "",
        },
    });
}

export async function PATCH(request: Request) {
    const user = await getCurrentUser();

    if (!user) {
        return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });
    }

    let payload: SettingsPayload;

    try {
        payload = (await request.json()) as SettingsPayload;
    } catch {
        return NextResponse.json({ error: "Nieprawidłowe dane." }, { status: 400 });
    }

    const lookingFor = payload.lookingFor?.trim() ?? "";
    const ageRange = payload.ageRange?.trim() ?? "";

    if (lookingFor && lookingFor !== "woman" && lookingFor !== "man") {
        return NextResponse.json({ error: "Wybierz poprawną wartość." }, { status: 400 });
    }

    const update: Record<string, unknown> = {
        updatedAt: new Date(),
    };
    const unset: Record<string, ""> = {};

    if (lookingFor) {
        update.lookingFor = lookingFor;
    } else {
        unset.lookingFor = "";
    }

    if (ageRange) {
        update.ageRange = ageRange;
    } else {
        unset.ageRange = "";
    }

    const users = await getUsersCollection();
    await users.updateOne(
        { _id: user._id },
        {
            ...(Object.keys(update).length > 0 ? { $set: update } : {}),
            ...(Object.keys(unset).length > 0 ? { $unset: unset } : {}),
        },
    );

    return NextResponse.json({ ok: true });
}
