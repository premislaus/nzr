import { cookies } from "next/headers";
import { getSessionsCollection, SESSION_COOKIE_NAME } from "@/lib/sessions";
import { getUsersCollection } from "@/lib/users";

export async function getCurrentUser() {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
    if (!sessionCookie?.value) {
        return null;
    }

    const sessions = await getSessionsCollection();
    const session = await sessions.findOne({ _id: sessionCookie.value });

    if (!session) {
        return null;
    }

    if (session.expiresAt <= new Date()) {
        await sessions.deleteOne({ _id: session._id });
        return null;
    }

    const users = await getUsersCollection();
    const user = await users.findOne({ _id: session.userId });

    if (!user) {
        await sessions.deleteOne({ _id: session._id });
        return null;
    }

    return user;
}
