import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getCurrentUser } from "@/lib/auth";
import { getUsersCollection } from "@/lib/users";
import {
    buildParticipantsKey,
    ensureConversationIndexes,
    getConversationsCollection,
} from "@/lib/conversations";
import { ensureMessageIndexes, getMessagesCollection } from "@/lib/messages";
import { getSocketServer } from "@/lib/socket";

type StartPayload = {
    toUserId?: string;
    body?: string;
};

export async function POST(request: Request) {
    const user = await getCurrentUser();
    if (!user) {
        return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });
    }

    let payload: StartPayload;
    try {
        payload = (await request.json()) as StartPayload;
    } catch {
        return NextResponse.json({ error: "Nieprawidłowe dane." }, { status: 400 });
    }

    if (!payload.toUserId || !payload.body?.trim()) {
        return NextResponse.json({ error: "Uzupełnij wiadomość." }, { status: 400 });
    }

    let targetId: ObjectId;
    try {
        targetId = new ObjectId(payload.toUserId);
    } catch {
        return NextResponse.json({ error: "Nieprawidłowy identyfikator." }, { status: 400 });
    }

    if (user._id?.toString() === targetId.toString()) {
        return NextResponse.json({ error: "Nie możesz pisać do siebie." }, { status: 400 });
    }

    const users = await getUsersCollection();
    const target = await users.findOne({ _id: targetId });
    if (!target) {
        return NextResponse.json({ error: "Profil nie istnieje." }, { status: 404 });
    }

    if (user.gender !== "man" || target.gender !== "woman") {
        return NextResponse.json(
            { error: "Wiadomość może wysłać tylko mężczyzna do kobiety." },
            { status: 403 },
        );
    }

    await ensureConversationIndexes();
    await ensureMessageIndexes();
    const conversations = await getConversationsCollection();
    const messages = await getMessagesCollection();
    const participantsKey = buildParticipantsKey(user._id!, targetId);
    const now = new Date();

    const existing = await conversations.findOne({ participantsKey });
    let conversationId = existing?._id;

    if (!existing) {
        const insertResult = await conversations.insertOne({
            participants: [user._id!, targetId],
            participantsKey,
            createdAt: now,
            updatedAt: now,
            lastMessageAt: now,
            lastMessageSnippet: payload.body.trim().slice(0, 120),
        });
        conversationId = insertResult.insertedId;
    }

    const messageInsert = await messages.insertOne({
            conversationId: conversationId!,
            senderId: user._id!,
            body: payload.body.trim(),
            createdAt: now,
    });

    if (existing) {
        await conversations.updateOne(
            { _id: conversationId },
            {
                $set: {
                    updatedAt: now,
                    lastMessageAt: now,
                    lastMessageSnippet: payload.body.trim().slice(0, 120),
                },
            },
        );
    }

    const io = getSocketServer();
    if (io && conversationId) {
        io.to(conversationId.toString()).emit("message:new", {
            id: messageInsert.insertedId.toString(),
            conversationId: conversationId.toString(),
            senderId: user._id?.toString(),
            body: payload.body.trim(),
            createdAt: now.toISOString(),
        });
    }

    return NextResponse.json({ conversationId: conversationId?.toString() });
}
