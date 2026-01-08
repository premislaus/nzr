import AppShell from "@/components/AppShell";
import PreferencesForm from "@/components/settings/PreferencesForm";

export default function SettingsPage() {
    return (
        <AppShell label="Ustawienia" title="Preferencje konta">
            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="rounded-3xl border border-slate-900/80 bg-slate-900/60 p-8 shadow-xl shadow-slate-950/40">
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
                        Ustawienia konta
                    </p>
                    <h2 className="mt-4 text-3xl font-semibold">Twoje preferencje</h2>
                    <p className="mt-3 text-sm text-slate-400">
                        Dostosuj widoczność profilu, powiadomienia i preferencje
                        dopasowań.
                    </p>

                    <div className="mt-8 grid gap-4">
                        <PreferencesForm />
                        <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-5">
                            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                                Widoczność profilu
                            </p>
                            <p className="mt-3 text-lg font-semibold">Publiczny</p>
                            <p className="mt-2 text-xs text-slate-500">
                                Kontroluj kto widzi Twoje konto.
                            </p>
                        </div>
                        <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-5">
                            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                                Powiadomienia
                            </p>
                            <p className="mt-3 text-lg font-semibold">E-mail + push</p>
                            <p className="mt-2 text-xs text-slate-500">
                                Otrzymuj informacje o nowych wiadomościach.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="rounded-3xl border border-slate-900/80 bg-slate-900/60 p-6">
                        <h3 className="text-lg font-semibold">Bezpieczeństwo</h3>
                        <p className="mt-2 text-sm text-slate-400">
                            Zaktualizuj hasło i włącz dodatkowe zabezpieczenia.
                        </p>
                        <button
                            type="button"
                            className="mt-6 w-full rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-white"
                        >
                            Zmień hasło
                        </button>
                    </div>

                    <div className="rounded-3xl border border-slate-900/80 bg-slate-900/60 p-6">
                        <h3 className="text-lg font-semibold">Prywatność</h3>
                        <p className="mt-2 text-sm text-slate-400">
                            Zarządzaj zgodami i ustawieniami widoczności.
                        </p>
                        <button
                            type="button"
                            className="mt-6 w-full rounded-2xl border border-slate-800 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:border-slate-600"
                        >
                            Zarządzaj zgodami
                        </button>
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
