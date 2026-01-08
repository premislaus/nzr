"use client";

import { useEffect, useState } from "react";

type PreferencesState = {
    lookingFor: string;
    ageRange: string;
};

const emptyPreferences: PreferencesState = {
    lookingFor: "",
    ageRange: "",
};

export default function PreferencesForm() {
    const [form, setForm] = useState<PreferencesState>(emptyPreferences);
    const [status, setStatus] = useState<null | { type: "success" | "error"; message: string }>(
        null,
    );
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        let active = true;

        const load = async () => {
            try {
                const response = await fetch("/api/settings");
                if (!response.ok) {
                    throw new Error("Failed");
                }
                const data = (await response.json()) as { preferences?: PreferencesState };
                if (!active) {
                    return;
                }
                setForm({
                    lookingFor: data.preferences?.lookingFor ?? "",
                    ageRange: data.preferences?.ageRange ?? "",
                });
            } catch {
                if (active) {
                    setStatus({ type: "error", message: "Nie udało się pobrać ustawień." });
                }
            } finally {
                if (active) {
                    setIsLoading(false);
                }
            }
        };

        load();

        return () => {
            active = false;
        };
    }, []);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setStatus(null);
        setIsSaving(true);

        try {
            const response = await fetch("/api/settings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = (await response.json()) as { error?: string };

            if (!response.ok) {
                setStatus({
                    type: "error",
                    message: data.error ?? "Nie udało się zapisać ustawień.",
                });
                return;
            }

            setStatus({ type: "success", message: "Ustawienia zapisane." });
        } catch {
            setStatus({ type: "error", message: "Błąd połączenia z serwerem." });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-slate-900/80 bg-slate-900/60 p-6"
        >
            <h3 className="text-lg font-semibold">Preferencje dopasowań</h3>
            <p className="mt-2 text-sm text-slate-400">
                Ustaw kogo chcesz poznawać i preferowany zakres wieku.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm">
                    <span className="text-slate-300">Szukam</span>
                    <select
                        name="lookingFor"
                        value={form.lookingFor}
                        onChange={(event) =>
                            setForm((prev) => ({ ...prev, lookingFor: event.target.value }))
                        }
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-slate-500"
                    >
                        <option value="">Wybierz</option>
                        <option value="woman">Kobieta</option>
                        <option value="man">Mężczyzna</option>
                    </select>
                </label>
                <label className="space-y-2 text-sm">
                    <span className="text-slate-300">Zakres wieku</span>
                    <input
                        type="text"
                        name="ageRange"
                        placeholder="np. 26-35"
                        value={form.ageRange}
                        onChange={(event) =>
                            setForm((prev) => ({ ...prev, ageRange: event.target.value }))
                        }
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-slate-500"
                    />
                </label>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
                <button
                    type="submit"
                    disabled={isSaving || isLoading}
                    className="rounded-2xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-70"
                >
                    {isSaving ? "Zapisywanie..." : "Zapisz ustawienia"}
                </button>
            </div>

            {status ? (
                <p
                    className={`mt-4 text-sm ${
                        status.type === "success" ? "text-emerald-400" : "text-rose-400"
                    }`}
                >
                    {status.message}
                </p>
            ) : null}
        </form>
    );
}
