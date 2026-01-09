import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

export type ConversationDocument = {
    _id?: ObjectId;
    participants: ObjectId[];
    participantsKey: string;
    createdAt: Date;
    updatedAt: Date;
    lastMessageAt?: Date;
    lastMessageSnippet?: string;
};

let ensureIndexesPromise: Promise<void> | null = null;

export async function getConversationsCollection() {
    const client = await clientPromise;
    const db = client.db();
    return db.collection<ConversationDocument>("conversations");
}

export async function ensureConversationIndexes() {
    if (!ensureIndexesPromise) {
        ensureIndexesPromise = getConversationsCollection().then(async (collection) => {
            await collection.createIndex({ participantsKey: 1 }, { unique: true });
            await collection.createIndex({ participants: 1 });
            await collection.createIndex({ updatedAt: -1 });
        });
    }

    await ensureIndexesPromise;
}

export function buildParticipantsKey(a: ObjectId, b: ObjectId) {
    return [a.toString(), b.toString()].sort().join(":");
}
