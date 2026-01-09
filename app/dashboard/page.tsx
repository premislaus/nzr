import Link from "next/link";
import AppShell from "@/components/AppShell";
import { getCurrentUser } from "@/lib/auth";
import { getUsersCollection } from "@/lib/users";

type ProfileCard = {
    id: string;
    name: string;
    city: string;
    ageLabel: string;
    interests: string;
    values: string;
};

export default async function DashboardPage() {
    const user = await getCurrentUser();
    const cards: ProfileCard[] = [];

    const lookingFor =
        user?.gender === "man" ? "woman" : user?.gender === "woman" ? "man" : null;

    if (lookingFor && user?.ageRange) {
        const [minAge, maxAge] = user.ageRange.split("-").map(Number);
        const currentYear = new Date().getFullYear();
        const maxBirthYear = currentYear - minAge;
        const minBirthYear = currentYear - maxAge;
        const users = await getUsersCollection();
        const candidates = await users
            .find({
                _id: { $ne: user._id },
                gender: lookingFor,
                birthYear: { $gte: minBirthYear, $lte: maxBirthYear },
            })
            .limit(30)
            .toArray();

        for (const candidate of candidates) {
            const age =
                candidate.birthYear && Number.isFinite(candidate.birthYear)
                    ? currentYear - candidate.birthYear
                    : null;
            cards.push({
                id: candidate._id?.toString() ?? "",
                name: candidate.name,
                city: candidate.city ?? "Miasto",
                ageLabel: age ? `${age} lat` : "Wiek",
                interests:
                    candidate.interests && candidate.interests.length > 0
                        ? candidate.interests.slice(0, 3).join(", ")
                        : "Zainteresowania",
                values:
                    candidate.values && candidate.values.length > 0
                        ? candidate.values.slice(0, 3).join(", ")
                        : "Wartości",
            });
        }
    }

    return (
        <AppShell label="Profile" title="Poznaj nowe osoby">
            <div className="rounded-3xl border border-slate-900/80 bg-slate-900/60 p-8 shadow-xl shadow-slate-950/40">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
                            Dopasowania
                        </p>
                        <h2 className="mt-3 text-3xl font-semibold">Profile dla Ciebie</h2>
                        <p className="mt-2 text-sm text-slate-400">
                            Lista profili zgodnych z Twoimi preferencjami.
                        </p>
                    </div>
                    <Link
                        href="/onboarding"
                        className="rounded-full border border-slate-800 px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-400 transition hover:border-slate-600 hover:text-slate-200"
                    >
                        Edytuj preferencje
                    </Link>
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {cards.length === 0 ? (
                        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 px-5 py-6 text-sm text-slate-400">
                            Brak profili do wyświetlenia.
                        </div>
                    ) : (
                        cards.map((card) => (
                            <Link
                                key={card.id}
                                href={`/profiles/${card.id}`}
                                className="group rounded-3xl border border-slate-800 bg-slate-950/60 p-5 transition hover:border-slate-600"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-slate-400">{card.city}</p>
                                        <h3 className="text-lg font-semibold">{card.name}</h3>
                                    </div>
                                    <span className="rounded-full border border-slate-700/80 px-3 py-1 text-xs text-slate-300">
                                        {card.ageLabel}
                                    </span>
                                </div>
                                <div className="mt-4 space-y-2 text-xs text-slate-400">
                                    <p>{card.interests}</p>
                                    <p>{card.values}</p>
                                </div>
                                <p className="mt-4 text-xs font-semibold text-slate-200">
                                    Zobacz profil →
                                </p>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </AppShell>
    );
}
