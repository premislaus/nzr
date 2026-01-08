import AppShell from "@/components/AppShell";

export default function ProfilePage() {
    return (
        <AppShell label="Profil" title="Twoje konto">
            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-3xl border border-slate-900/80 bg-slate-900/60 p-8 shadow-xl shadow-slate-950/40">
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
                        Profil użytkownika
                    </p>
                    <h2 className="mt-4 text-3xl font-semibold">Imię i nazwisko</h2>
                    <p className="mt-3 text-sm text-slate-400">
                        Krótki opis, kilka wartości i informacje o stylu życia. Ta sekcja
                        pozwala innym lepiej Cię poznać.
                    </p>

                    <div className="mt-8 grid gap-4 sm:grid-cols-2">
                        <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-5">
                            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                                Wartości
                            </p>
                            <p className="mt-3 text-lg font-semibold">Wiara, rodzina</p>
                            <p className="mt-2 text-xs text-slate-500">Możesz edytować</p>
                        </div>
                        <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-5">
                            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                                Lokalizacja
                            </p>
                            <p className="mt-3 text-lg font-semibold">Poznań</p>
                            <p className="mt-2 text-xs text-slate-500">
                                Wyświetlana publicznie
                            </p>
                        </div>
                        <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-5">
                            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                                Zainteresowania
                            </p>
                            <p className="mt-3 text-lg font-semibold">
                                Góry, książki, muzyka
                            </p>
                            <p className="mt-2 text-xs text-slate-500">Aktualizuj regularnie</p>
                        </div>
                        <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-5">
                            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                                Status
                            </p>
                            <p className="mt-3 text-lg font-semibold">Aktywny</p>
                            <p className="mt-2 text-xs text-slate-500">Widoczny dla innych</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="rounded-3xl border border-slate-900/80 bg-slate-900/60 p-6">
                        <h3 className="text-lg font-semibold">Uzupełnij profil</h3>
                        <p className="mt-2 text-sm text-slate-400">
                            Dodaj zdjęcia i opis, aby zwiększyć liczbę dopasowań.
                        </p>
                        <button
                            type="button"
                            className="mt-6 w-full rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-white"
                        >
                            Edytuj profil
                        </button>
                    </div>

                    <div className="rounded-3xl border border-slate-900/80 bg-slate-900/60 p-6">
                        <h3 className="text-lg font-semibold">Podgląd profilu</h3>
                        <p className="mt-2 text-sm text-slate-400">
                            Sprawdź, jak Twój profil wygląda dla innych użytkowników.
                        </p>
                        <button
                            type="button"
                            className="mt-6 w-full rounded-2xl border border-slate-800 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:border-slate-600"
                        >
                            Zobacz podgląd
                        </button>
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
