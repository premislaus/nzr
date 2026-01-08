import clientPromise from "@/lib/mongodb";

export type UserDocument = {
  _id?: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
};

let ensureIndexesPromise: Promise<void> | null = null;

export async function getUsersCollection() {
  const client = await clientPromise;
  const db = client.db();
  return db.collection<UserDocument>("users");
}

export async function ensureUserIndexes() {
  if (!ensureIndexesPromise) {
    ensureIndexesPromise = getUsersCollection().then((collection) =>
      collection.createIndex({ email: 1 }, { unique: true }),
    );
  }

  await ensureIndexesPromise;
}
