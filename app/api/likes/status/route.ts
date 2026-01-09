import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getCurrentUser } from "@/lib/auth";
import { getUsersCollection } from "@/lib/users";
import { getLikesCollection } from "@/lib/likes";

export async function GET(request: Request) {
    const user = await getCurrentUser();
    if (!user) {
        return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const targetIdParam = searchParams.get("toUserId");
    if (!targetIdParam) {
        return NextResponse.json({ error: "Brak odbiorcy." }, { status: 400 });
    }

    let targetId: ObjectId;
    try {
        targetId = new ObjectId(targetIdParam);
    } catch {
        return NextResponse.json({ error: "Nieprawidłowy identyfikator." }, { status: 400 });
    }

    const users = await getUsersCollection();
    const target = await users.findOne({ _id: targetId });
    if (!target) {
        return NextResponse.json({ error: "Profil nie istnieje." }, { status: 404 });
    }

    const likes = await getLikesCollection();
    const liked = await likes.findOne({ fromUserId: user._id!, toUserId: targetId });
    const canLike = user.gender === "woman" && target.gender === "man";
    const canMessage = user.gender === "man" && target.gender === "woman";

    return NextResponse.json({
        canLike,
        canMessage,
        liked: !!liked,
        targetGender: target.gender,
    });
}
