import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getCurrentUser } from "@/lib/auth";
import { getUsersCollection } from "@/lib/users";
import { ensureLikeIndexes, getLikesCollection } from "@/lib/likes";

type LikePayload = {
    toUserId?: string;
};

export async function POST(request: Request) {
    const user = await getCurrentUser();
    if (!user) {
        return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });
    }

    let payload: LikePayload;
    try {
        payload = (await request.json()) as LikePayload;
    } catch {
        return NextResponse.json({ error: "Nieprawidłowe dane." }, { status: 400 });
    }

    if (!payload.toUserId) {
        return NextResponse.json({ error: "Brak odbiorcy." }, { status: 400 });
    }

    let targetId: ObjectId;
    try {
        targetId = new ObjectId(payload.toUserId);
    } catch {
        return NextResponse.json({ error: "Nieprawidłowy identyfikator." }, { status: 400 });
    }

    if (user._id?.toString() === targetId.toString()) {
        return NextResponse.json({ error: "Nie możesz polubić siebie." }, { status: 400 });
    }

    const users = await getUsersCollection();
    const target = await users.findOne({ _id: targetId });

    if (!target) {
        return NextResponse.json({ error: "Profil nie istnieje." }, { status: 404 });
    }

    if (user.gender !== "woman" || target.gender !== "man") {
        return NextResponse.json(
            { error: "Serce mogą wysyłać tylko kobiety do mężczyzn." },
            { status: 403 },
        );
    }

    await ensureLikeIndexes();
    const likes = await getLikesCollection();

    await likes.updateOne(
        { fromUserId: user._id!, toUserId: targetId },
        { $setOnInsert: { fromUserId: user._id!, toUserId: targetId, createdAt: new Date() } },
        { upsert: true },
    );

    return NextResponse.json({ ok: true });
}
