import Link from "next/link";
import { redirect } from "next/navigation";
import AppShell from "@/components/AppShell";
import { getCurrentUser } from "@/lib/auth";
import { getLikesCollection } from "@/lib/likes";
import { getUsersCollection } from "@/lib/users";

type LikeCard = {
    id: string;
    name: string;
    city: string;
    createdAt: Date;
};

export default async function LikesReceivedPage() {
    const user = await getCurrentUser();

    if (user?.gender === "woman") {
        redirect("/likes/sent");
    }
    const cards: LikeCard[] = [];

    if (user?._id) {
        const users = await getUsersCollection();
        await users.updateOne(
            { _id: user._id },
            { $set: { lastSeenLikesAt: new Date() } },
        );
        const likes = await getLikesCollection();
        const list = await likes
            .find({ toUserId: user._id })
            .sort({ createdAt: -1 })
            .limit(50)
            .toArray();

        for (const like of list) {
            const sender = await users.findOne({ _id: like.fromUserId });
            if (!sender) {
                continue;
            }
            cards.push({
                id: sender._id?.toString() ?? "",
                name: sender.name,
                city: sender.city ?? "Miasto",
                createdAt: like.createdAt,
            });
        }
    }

    return (
        <AppShell label="Polubienia" title="Otrzymane serca">
            <div className="rounded-3xl border border-slate-900/80 bg-slate-900/60 p-8 shadow-xl shadow-slate-950/40">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
                            Polubienia
                        </p>
                        <h2 className="mt-3 text-3xl font-semibold">Otrzymane serca</h2>
                        <p className="mt-2 text-sm text-slate-400">
                            Lista osób, które wysłały Ci serce.
                        </p>
                    </div>
                    <Link
                        href="/likes/sent"
                        className="rounded-full border border-slate-800 px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-400 transition hover:border-slate-600 hover:text-slate-200"
                    >
                        Wysłane
                    </Link>
                </div>

                <div className="mt-8 space-y-3">
                    {cards.length === 0 ? (
                        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 px-5 py-6 text-sm text-slate-400">
                            Brak otrzymanych serc.
                        </div>
                    ) : (
                        cards.map((card) => (
                            <Link
                                key={card.id}
                                href={`/profiles/${card.id}`}
                                className="block rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 transition hover:border-slate-600"
                            >
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-semibold">{card.name}</p>
                                    <span className="text-xs text-slate-500">
                                        {card.createdAt.toLocaleDateString("pl-PL")}
                                    </span>
                                </div>
                                <p className="mt-1 text-xs text-slate-400">{card.city}</p>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </AppShell>
    );
}
