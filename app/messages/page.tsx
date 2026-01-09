import Link from "next/link";
import AppShell from "@/components/AppShell";
import { getCurrentUser } from "@/lib/auth";
import { getConversationsCollection } from "@/lib/conversations";
import { getUsersCollection } from "@/lib/users";

type ConversationCard = {
    id: string;
    name: string;
    lastMessage: string;
    updatedAt: Date;
};

export default async function MessagesPage() {
    const user = await getCurrentUser();
    const cards: ConversationCard[] = [];

    if (user?._id) {
        const users = await getUsersCollection();
        await users.updateOne(
            { _id: user._id },
            { $set: { lastSeenMessagesAt: new Date() } },
        );
        const conversations = await getConversationsCollection();
        const list = await conversations
            .find({ participants: user._id })
            .sort({ updatedAt: -1 })
            .limit(50)
            .toArray();

        for (const conversation of list) {
            const otherId = conversation.participants.find(
                (participant) => participant.toString() !== user._id?.toString(),
            );
            const otherUser = otherId
                ? await users.findOne({ _id: otherId })
                : null;
            cards.push({
                id: conversation._id?.toString() ?? "",
                name: otherUser?.name ?? "Użytkownik",
                lastMessage: conversation.lastMessageSnippet ?? "Brak wiadomości",
                updatedAt: conversation.updatedAt,
            });
        }
    }

    return (
        <AppShell label="Wiadomości" title="Twoje rozmowy">
            <div className="rounded-3xl border border-slate-900/80 bg-slate-900/60 p-8 shadow-xl shadow-slate-950/40">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
                            Rozmowy
                        </p>
                        <h2 className="mt-3 text-3xl font-semibold">Twoje wiadomości</h2>
                        <p className="mt-2 text-sm text-slate-400">
                            Lista aktywnych rozmów.
                        </p>
                    </div>
                    <Link
                        href="/dashboard"
                        className="rounded-full border border-slate-800 px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-400 transition hover:border-slate-600 hover:text-slate-200"
                    >
                        Przeglądaj profile
                    </Link>
                </div>

                <div className="mt-8 space-y-3">
                    {cards.length === 0 ? (
                        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 px-5 py-6 text-sm text-slate-400">
                            Brak rozmów.
                        </div>
                    ) : (
                        cards.map((card) => (
                            <Link
                                key={card.id}
                                href={`/messages/${card.id}`}
                                className="block rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 transition hover:border-slate-600"
                            >
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-semibold">{card.name}</p>
                                    <span className="text-xs text-slate-500">
                                        {card.updatedAt.toLocaleDateString("pl-PL")}
                                    </span>
                                </div>
                                <p className="mt-1 text-xs text-slate-400">{card.lastMessage}</p>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </AppShell>
    );
}
