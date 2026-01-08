import AppShell from "@/components/AppShell";

export default function DashboardPage() {
    return (
        <AppShell label="Panel" title="Witaj ponownie">
            <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
                <div className="rounded-3xl border border-slate-900/80 bg-slate-900/60 p-8 shadow-xl shadow-slate-950/40">
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
                        Dzisiaj
                    </p>
                    <h2 className="mt-4 text-3xl font-semibold">
                        Twoje propozycje znajomości
                    </h2>
                    <p className="mt-3 text-sm text-slate-400">
                        W tej sekcji zobaczysz dopasowania oparte na wartościach i
                        stylu życia. Dodaj kilka informacji, abyśmy mogli przygotować
                        bardziej trafne rekomendacje.
                    </p>

                    <div className="mt-8 grid gap-4 sm:grid-cols-2">
                        <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-5">
                            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                                Nowe profile
                            </p>
                            <p className="mt-3 text-2xl font-semibold">12</p>
                            <p className="mt-2 text-xs text-slate-500">
                                4 w Twoim mieście
                            </p>
                        </div>
                        <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-5">
                            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                                Aktywne rozmowy
                            </p>
                            <p className="mt-3 text-2xl font-semibold">3</p>
                            <p className="mt-2 text-xs text-slate-500">
                                Ostatnia aktywność 2h temu
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="rounded-3xl border border-slate-900/80 bg-slate-900/60 p-6">
                        <h3 className="text-lg font-semibold">Twój profil</h3>
                        <p className="mt-2 text-sm text-slate-400">
                            Uzupełnij opis, aby inni mogli Cię lepiej poznać.
                        </p>
                        <button
                            type="button"
                            className="mt-6 w-full rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-white"
                        >
                            Uzupełnij profil
                        </button>
                    </div>

                    <div className="rounded-3xl border border-slate-900/80 bg-slate-900/60 p-6">
                        <h3 className="text-lg font-semibold">Plan dnia</h3>
                        <ul className="mt-4 space-y-3 text-sm text-slate-300">
                            <li className="flex items-center justify-between rounded-2xl border border-slate-800/80 bg-slate-950/60 px-4 py-3">
                                <span>Przejrzyj nowe profile</span>
                                <span className="text-xs text-slate-500">5 min</span>
                            </li>
                            <li className="flex items-center justify-between rounded-2xl border border-slate-800/80 bg-slate-950/60 px-4 py-3">
                                <span>Odpowiedz na wiadomość</span>
                                <span className="text-xs text-slate-500">2 min</span>
                            </li>
                            <li className="flex items-center justify-between rounded-2xl border border-slate-800/80 bg-slate-950/60 px-4 py-3">
                                <span>Uzupełnij opis profilu</span>
                                <span className="text-xs text-slate-500">10 min</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
