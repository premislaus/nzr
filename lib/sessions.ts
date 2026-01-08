import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

export const SESSION_COOKIE_NAME = "nzr_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export type SessionDocument = {
    _id: string;
    userId: ObjectId;
    createdAt: Date;
    expiresAt: Date;
};

let ensureIndexesPromise: Promise<void> | null = null;

export async function getSessionsCollection() {
    const client = await clientPromise;
    const db = client.db();
    return db.collection<SessionDocument>("sessions");
}

export async function ensureSessionIndexes() {
    if (!ensureIndexesPromise) {
        ensureIndexesPromise = getSessionsCollection().then(async (collection) => {
            await collection.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
            await collection.createIndex({ userId: 1 });
        });
    }

    await ensureIndexesPromise;
}
