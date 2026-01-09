import Link from "next/link";
import { notFound } from "next/navigation";
import { ObjectId } from "mongodb";
import AppShell from "@/components/AppShell";
import ProfileActions from "@/components/profiles/ProfileActions";
import { getCurrentUser } from "@/lib/auth";
import { getUsersCollection } from "@/lib/users";

export default async function ProfileDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const resolvedParams = await params;
    const currentUser = await getCurrentUser();
    const users = await getUsersCollection();
    let objectId: ObjectId;
    try {
        objectId = new ObjectId(resolvedParams.id);
    } catch {
        notFound();
    }
    const candidate = await users.findOne({ _id: objectId });

    if (!candidate) {
        notFound();
    }

    const currentYear = new Date().getFullYear();
    const age = candidate.birthYear ? currentYear - candidate.birthYear : null;
    const actionMode =
        currentUser?.gender === "man" ? "message" : currentUser?.gender === "woman" ? "heart" : null;

    return (
        <AppShell label="Profil" title={candidate.name}>
            <div className="overflow-hidden rounded-3xl border border-slate-900/80 bg-slate-900/60 shadow-xl shadow-slate-950/40">
                <div className="relative h-52 bg-gradient-to-r from-slate-900 via-indigo-900/40 to-slate-900">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.25),_transparent_55%)]" />
                    <div className="absolute bottom-4 right-6 text-xs uppercase tracking-[0.35em] text-slate-400">
                        Profil
                    </div>
                </div>

                <div className="relative px-6 pb-10">
                    <div className="-mt-12 flex flex-col gap-6 rounded-3xl border border-slate-800 bg-slate-950/70 p-6 shadow-lg shadow-slate-950/50 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center gap-5">
                            <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-slate-700 bg-slate-900 text-lg font-semibold uppercase">
                                {candidate.name?.slice(0, 2)}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-2xl font-semibold">{candidate.name}</h2>
                                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                                </div>
                                <p className="mt-1 text-sm text-slate-400">
                                    {age ? `${age} lat` : "Wiek"} · {candidate.city ?? "Miasto"}
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            {actionMode ? (
                                <ProfileActions
                                    targetUserId={candidate._id?.toString() ?? ""}
                                    mode={actionMode}
                                />
                            ) : null}
                            <Link
                                href="/dashboard"
                                className="rounded-full border border-slate-800 px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-400 transition hover:border-slate-600 hover:text-slate-200"
                            >
                                Wszystkie profile
                            </Link>
                        </div>
                    </div>

                    <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
                        <div className="space-y-6">
                            <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-6">
                                <h3 className="text-lg font-semibold">O mnie</h3>
                                <p className="mt-3 text-sm text-slate-300">
                                    {candidate.bio ?? "Brak opisu profilu."}
                                </p>
                            </div>

                            <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-6">
                                <h3 className="text-lg font-semibold">Wartości</h3>
                                <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-200">
                                    {candidate.values && candidate.values.length > 0
                                        ? candidate.values.map((value) => (
                                              <span
                                                  key={value}
                                                  className="rounded-full border border-slate-700/80 bg-slate-900/80 px-3 py-1"
                                              >
                                                  {value}
                                              </span>
                                          ))
                                        : "Brak"}
                                </div>
                            </div>

                            <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-6">
                                <h3 className="text-lg font-semibold">Szczegóły</h3>
                                <div className="mt-4 grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                                            Wzrost
                                        </p>
                                        <p className="mt-2">
                                            {candidate.height ? `${candidate.height} cm` : "Brak"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                                            Styl życia
                                        </p>
                                        <p className="mt-2">
                                            {candidate.lifestyle ?? "Brak"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-6">
                                <h3 className="text-lg font-semibold">Zdjęcia</h3>
                                <p className="mt-2 text-sm text-slate-400">
                                    Zdjęcia profilu pojawią się tutaj.
                                </p>
                                <div className="mt-4 grid grid-cols-2 gap-3">
                                    {["A", "B", "C", "D"].map((item) => (
                                        <div
                                            key={item}
                                            className="flex h-24 items-center justify-center rounded-2xl border border-dashed border-slate-700 text-xs text-slate-500"
                                        >
                                            Brak
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-6">
                                <h3 className="text-lg font-semibold">Zainteresowania</h3>
                                <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-200">
                                    {candidate.interests && candidate.interests.length > 0
                                        ? candidate.interests.map((interest) => (
                                              <span
                                                  key={interest}
                                                  className="rounded-full border border-slate-700/80 bg-slate-900/80 px-3 py-1"
                                              >
                                                  {interest}
                                              </span>
                                          ))
                                        : "Brak"}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
