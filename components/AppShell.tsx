import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getConversationsCollection } from "@/lib/conversations";
import { getLikesCollection } from "@/lib/likes";
import { getUsersCollection } from "@/lib/users";
import HeaderQuickActions from "./HeaderQuickActions";
import UserMenu from "./UserMenu";

type AppShellProps = {
    label: string;
    title: string;
    children: ReactNode;
};

export default async function AppShell({ label, title, children }: AppShellProps) {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/auth");
    }

    if (
        label !== "Onboarding" &&
        (!user.ageRange || !/^\d{2}-\d{2}$/.test(user.ageRange) || !user.maxDistanceKm)
    ) {
        redirect("/onboarding");
    }

    const lastSeenLikesAt = user.lastSeenLikesAt ?? new Date(0);
    const lastSeenMessagesAt = user.lastSeenMessagesAt ?? new Date(0);

    const [likesCount, messagesCount, matchesCount] = await Promise.all([
        getLikesCollection().then((collection) =>
            collection.countDocuments({ toUserId: user._id, createdAt: { $gt: lastSeenLikesAt } }),
        ),
        getConversationsCollection().then((collection) =>
            collection.countDocuments({
                participants: user._id,
                updatedAt: { $gt: lastSeenMessagesAt },
            }),
        ),
        getConversationsCollection().then((collection) =>
            collection.countDocuments({
                participants: user._id,
                createdAt: { $gt: lastSeenMessagesAt },
            }),
        ),
    ]);

    const users = await getUsersCollection();
    const [recentLikes, recentConversations, recentMatches] = await Promise.all([
        getLikesCollection().then((collection) =>
            collection.find({ toUserId: user._id }).sort({ createdAt: -1 }).limit(5).toArray(),
        ),
        getConversationsCollection().then((collection) =>
            collection
                .find({ participants: user._id })
                .sort({ updatedAt: -1 })
                .limit(5)
                .toArray(),
        ),
        getConversationsCollection().then((collection) =>
            collection
                .find({ participants: user._id })
                .sort({ createdAt: -1 })
                .limit(5)
                .toArray(),
        ),
    ]);

    const likeItems = [];
    for (const like of recentLikes) {
        const sender = await users.findOne({ _id: like.fromUserId });
        if (!sender) {
            continue;
        }
        likeItems.push({
            id: like._id?.toString() ?? "",
            title: `${sender.name} wysłała serce`,
            subtitle: sender.city ?? "Miasto",
            href: `/profiles/${sender._id?.toString() ?? ""}`,
        });
    }

    const messageItems = [];
    for (const conversation of recentConversations) {
        const otherId = conversation.participants.find(
            (participant) => participant.toString() !== user._id?.toString(),
        );
        const otherUser = otherId ? await users.findOne({ _id: otherId }) : null;
        if (!otherUser) {
            continue;
        }
        messageItems.push({
            id: conversation._id?.toString() ?? "",
            title: `Nowa wiadomość od ${otherUser.name}`,
            subtitle: conversation.lastMessageSnippet ?? "Brak treści",
            href: `/messages/${conversation._id?.toString() ?? ""}`,
        });
    }

    const matchItems = [];
    for (const conversation of recentMatches) {
        const otherId = conversation.participants.find(
            (participant) => participant.toString() !== user._id?.toString(),
        );
        const otherUser = otherId ? await users.findOne({ _id: otherId }) : null;
        if (!otherUser) {
            continue;
        }
        matchItems.push({
            id: conversation._id?.toString() ?? "",
            title: `Dopasowanie z ${otherUser.name}`,
            subtitle: otherUser.city ?? "Miasto",
            href: `/messages/${conversation._id?.toString() ?? ""}`,
        });
    }

    const notificationItems = [...likeItems, ...messageItems]
        .slice(0, 8)
        .map((item) => item);

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100">
            <div className="relative overflow-hidden">
                <div className="pointer-events-none absolute -top-40 right-0 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl" />
                <div className="pointer-events-none absolute left-10 top-20 h-72 w-72 rounded-full bg-rose-500/10 blur-3xl" />

                <header className="border-b border-slate-900/80 bg-slate-950/80 backdrop-blur">
                    <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
                        <div className="flex items-center gap-4">
                        <Link
                            href="/dashboard"
                            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-xs font-semibold uppercase tracking-[0.25em] text-slate-200 transition hover:bg-slate-800"
                        >
                            NZR
                        </Link>
                            <div>
                                <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
                                    {label}
                                </p>
                                <h1 className="text-lg font-semibold">{title}</h1>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <HeaderQuickActions
                                label="Wiadomości"
                                count={messagesCount}
                                items={messageItems}
                                emptyText="Brak nowych wiadomości."
                                hrefAll="/messages"
                                iconName="message"
                            />
                            {user.gender !== "woman" ? (
                                <HeaderQuickActions
                                    label="Serca"
                                    count={likesCount}
                                    items={likeItems}
                                    emptyText="Brak nowych serc."
                                    hrefAll="/likes/received"
                                    iconName="heart"
                                />
                            ) : null}
                            <HeaderQuickActions
                                label="Dopasowania"
                                count={matchesCount}
                                items={matchItems}
                                emptyText="Brak nowych dopasowań."
                                hrefAll="/matches"
                                iconName="match"
                            />
                            <HeaderQuickActions
                                label="Powiadomienia"
                                count={likesCount + messagesCount}
                                items={notificationItems}
                                emptyText="Brak powiadomień."
                                hrefAll="/notifications"
                                iconName="notification"
                            />
                            <UserMenu likesCount={likesCount} messagesCount={messagesCount} />
                        </div>
                    </div>
                </header>

                <section className="mx-auto w-full max-w-6xl px-6 py-12">{children}</section>
            </div>
        </main>
    );
}
