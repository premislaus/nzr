import Link from "next/link";
import { notFound } from "next/navigation";
import { ObjectId } from "mongodb";
import AppShell from "@/components/AppShell";
import MessageThreadClient from "@/components/messages/MessageThreadClient";
import { getCurrentUser } from "@/lib/auth";
import { getConversationsCollection } from "@/lib/conversations";
import { getMessagesCollection } from "@/lib/messages";
import { getUsersCollection } from "@/lib/users";

export default async function MessageThreadPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const resolvedParams = await params;
    const user = await getCurrentUser();
    if (!user?._id) {
        notFound();
    }

    let conversationId: ObjectId;
    try {
        conversationId = new ObjectId(resolvedParams.id);
    } catch {
        notFound();
    }

    const conversations = await getConversationsCollection();
    const conversation = await conversations.findOne({ _id: conversationId });
    if (!conversation) {
        notFound();
    }

    const isParticipant = conversation.participants.some(
        (participant) => participant.toString() === user._id?.toString(),
    );
    if (!isParticipant) {
        notFound();
    }

    const users = await getUsersCollection();
    await users.updateOne(
        { _id: user._id },
        { $set: { lastSeenMessagesAt: new Date() } },
    );

    const otherId = conversation.participants.find(
        (participant) => participant.toString() !== user._id?.toString(),
    );
    const otherUser = otherId ? await users.findOne({ _id: otherId }) : null;

    const messagesCollection = await getMessagesCollection();
    const messages = await messagesCollection
        .find({ conversationId })
        .sort({ createdAt: 1 })
        .limit(200)
        .toArray();
    const initialMessages = messages.map((message) => ({
        id: message._id?.toString() ?? "",
        senderId: message.senderId.toString(),
        body: message.body,
        createdAt: message.createdAt.toISOString(),
        conversationId: conversationId.toString(),
    }));

    return (
        <AppShell label="Wiadomości" title={otherUser?.name ?? "Rozmowa"}>
            <div className="rounded-3xl border border-slate-900/80 bg-slate-900/60 p-8 shadow-xl shadow-slate-950/40">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
                            Rozmowa
                        </p>
                        <h2 className="mt-3 text-3xl font-semibold">
                            {otherUser?.name ?? "Użytkownik"}
                        </h2>
                        <p className="mt-2 text-sm text-slate-400">
                            {otherUser?.city ?? "Miasto"}
                        </p>
                    </div>
                    <Link
                        href="/messages"
                        className="rounded-full border border-slate-800 px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-400 transition hover:border-slate-600 hover:text-slate-200"
                    >
                        Wszystkie rozmowy
                    </Link>
                </div>

                <MessageThreadClient
                    conversationId={conversationId.toString()}
                    currentUserId={user._id?.toString() ?? ""}
                    initialMessages={initialMessages}
                />
            </div>
        </AppShell>
    );
}
