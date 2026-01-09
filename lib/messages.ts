import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

export type MessageDocument = {
    _id?: ObjectId;
    conversationId: ObjectId;
    senderId: ObjectId;
    body: string;
    createdAt: Date;
};

let ensureIndexesPromise: Promise<void> | null = null;

export async function getMessagesCollection() {
    const client = await clientPromise;
    const db = client.db();
    return db.collection<MessageDocument>("messages");
}

export async function ensureMessageIndexes() {
    if (!ensureIndexesPromise) {
        ensureIndexesPromise = getMessagesCollection().then(async (collection) => {
            await collection.createIndex({ conversationId: 1, createdAt: 1 });
            await collection.createIndex({ senderId: 1 });
        });
    }

    await ensureIndexesPromise;
}
