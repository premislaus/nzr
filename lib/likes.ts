import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";

export type LikeDocument = {
    _id?: ObjectId;
    fromUserId: ObjectId;
    toUserId: ObjectId;
    createdAt: Date;
};

let ensureIndexesPromise: Promise<void> | null = null;

export async function getLikesCollection() {
    const client = await clientPromise;
    const db = client.db();
    return db.collection<LikeDocument>("likes");
}

export async function ensureLikeIndexes() {
    if (!ensureIndexesPromise) {
        ensureIndexesPromise = getLikesCollection().then((collection) =>
            collection.createIndex({ fromUserId: 1, toUserId: 1 }, { unique: true }),
        );
    }

    await ensureIndexesPromise;
}
