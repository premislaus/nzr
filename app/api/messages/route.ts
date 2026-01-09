import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getCurrentUser } from "@/lib/auth";
import { getConversationsCollection } from "@/lib/conversations";
import { ensureMessageIndexes, getMessagesCollection } from "@/lib/messages";
import { getSocketServer } from "@/lib/socket";

type MessagePayload = {
    conversationId?: string;
    body?: string;
};

export async function POST(request: Request) {
    const user = await getCurrentUser();
    if (!user) {
        return NextResponse.json({ error: "Brak autoryzacji." }, { status: 401 });
    }

    let payload: MessagePayload;
    try {
        payload = (await request.json()) as MessagePayload;
    } catch {
        return NextResponse.json({ error: "Nieprawidłowe dane." }, { status: 400 });
    }

    if (!payload.conversationId || !payload.body?.trim()) {
        return NextResponse.json({ error: "Brak wiadomości." }, { status: 400 });
    }

    let conversationId: ObjectId;
    try {
        conversationId = new ObjectId(payload.conversationId);
    } catch {
        return NextResponse.json({ error: "Nieprawidłowa rozmowa." }, { status: 400 });
    }

    const conversations = await getConversationsCollection();
    const conversation = await conversations.findOne({ _id: conversationId });
    if (!conversation) {
        return NextResponse.json({ error: "Rozmowa nie istnieje." }, { status: 404 });
    }

    const isParticipant = conversation.participants.some(
        (participant) => participant.toString() === user._id?.toString(),
    );
    if (!isParticipant) {
        return NextResponse.json({ error: "Brak dostępu." }, { status: 403 });
    }

    await ensureMessageIndexes();
    const messages = await getMessagesCollection();
    const now = new Date();
    const insertResult = await messages.insertOne({
        conversationId,
        senderId: user._id!,
        body: payload.body.trim(),
        createdAt: now,
    });

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

    const io = getSocketServer();
    if (io) {
        io.to(conversationId.toString()).emit("message:new", {
            id: insertResult.insertedId.toString(),
            conversationId: conversationId.toString(),
            senderId: user._id?.toString(),
            body: payload.body.trim(),
            createdAt: now.toISOString(),
        });
    }

    return NextResponse.json({
        ok: true,
        message: {
            id: insertResult.insertedId.toString(),
            conversationId: conversationId.toString(),
            senderId: user._id?.toString(),
            body: payload.body.trim(),
            createdAt: now.toISOString(),
        },
    });
}
