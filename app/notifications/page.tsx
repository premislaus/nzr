import Link from "next/link";
import AppShell from "@/components/AppShell";
import { getCurrentUser } from "@/lib/auth";
import { getConversationsCollection } from "@/lib/conversations";
import { getLikesCollection } from "@/lib/likes";
import { getUsersCollection } from "@/lib/users";

type NotificationItem = {
    id: string;
    type: "like" | "message";
    title: string;
    subtitle: string;
    date: Date;
    href: string;
};

export default async function NotificationsPage() {
    const user = await getCurrentUser();
    const items: NotificationItem[] = [];

    if (user?._id) {
        const users = await getUsersCollection();
        await users.updateOne(
            { _id: user._id },
            { $set: { lastSeenLikesAt: new Date(), lastSeenMessagesAt: new Date() } },
        );
        const likes = await getLikesCollection();
        const conversations = await getConversationsCollection();

        const recentLikes = await likes
            .find({ toUserId: user._id })
            .sort({ createdAt: -1 })
            .limit(10)
            .toArray();

        for (const like of recentLikes) {
            const sender = await users.findOne({ _id: like.fromUserId });
            if (!sender) {
                continue;
            }
            items.push({
                id: like._id?.toString() ?? "",
                type: "like",
                title: `${sender.name} wysłała serce`,
                subtitle: sender.city ?? "Miasto",
                date: like.createdAt,
                href: `/profiles/${sender._id?.toString() ?? ""}`,
            });
        }

        const recentConversations = await conversations
            .find({ participants: user._id })
            .sort({ updatedAt: -1 })
            .limit(10)
            .toArray();

        for (const conversation of recentConversations) {
            const otherId = conversation.participants.find(
                (participant) => participant.toString() !== user._id?.toString(),
            );
            const otherUser = otherId ? await users.findOne({ _id: otherId }) : null;
            if (!otherUser) {
                continue;
            }
            items.push({
                id: conversation._id?.toString() ?? "",
                type: "message",
                title: `Nowa wiadomość od ${otherUser.name}`,
                subtitle: conversation.lastMessageSnippet ?? "Brak treści",
                date: conversation.updatedAt,
                href: `/messages/${conversation._id?.toString() ?? ""}`,
            });
        }
    }

    const sorted = items.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 20);

    return (
        <AppShell label="Powiadomienia" title="Twoje aktywności">
            <div className="rounded-3xl border border-slate-900/80 bg-slate-900/60 p-8 shadow-xl shadow-slate-950/40">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
                            Powiadomienia
                        </p>
                        <h2 className="mt-3 text-3xl font-semibold">Aktywności</h2>
                        <p className="mt-2 text-sm text-slate-400">
                            Najnowsze serca i wiadomości.
                        </p>
                    </div>
                    <Link
                        href="/messages"
                        className="rounded-full border border-slate-800 px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-400 transition hover:border-slate-600 hover:text-slate-200"
                    >
                        Wiadomości
                    </Link>
                </div>

                <div className="mt-8 space-y-3">
                    {sorted.length === 0 ? (
                        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 px-5 py-6 text-sm text-slate-400">
                            Brak powiadomień.
                        </div>
                    ) : (
                        sorted.map((item) => (
                            <Link
                                key={`${item.type}-${item.id}`}
                                href={item.href}
                                className="block rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 transition hover:border-slate-600"
                            >
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-semibold">{item.title}</p>
                                    <span className="text-xs text-slate-500">
                                        {item.date.toLocaleDateString("pl-PL")}
                                    </span>
                                </div>
                                <p className="mt-1 text-xs text-slate-400">{item.subtitle}</p>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </AppShell>
    );
}
