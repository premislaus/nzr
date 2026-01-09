"use client";

import { useEffect, useState } from "react";

type PreferencesState = {
    ageRange: string;
    values: string[];
    lifestyle: string;
    maxDistanceKm: string;
    preferredCity: string;
    childrenPreference: string;
    preferredMinHeight: string;
    preferredMaxHeight: string;
};

const emptyPreferences: PreferencesState = {
    ageRange: "",
    values: [],
    lifestyle: "",
    maxDistanceKm: "",
    preferredCity: "",
    childrenPreference: "",
    preferredMinHeight: "",
    preferredMaxHeight: "",
};

const valuesSuggestions = [
    "Rodzina",
    "Wiara",
    "Rozwój",
    "Stabilność",
    "Szczerość",
    "Życzliwość",
    "Ambicja",
    "Wspólnota",
];

export default function PreferencesForm() {
    const [form, setForm] = useState<PreferencesState>(emptyPreferences);
    const [valueInput, setValueInput] = useState("");
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
                    ageRange: data.preferences?.ageRange ?? "",
                    values: Array.isArray(data.preferences?.values)
                        ? data.preferences?.values ?? []
                        : [],
                    lifestyle: data.preferences?.lifestyle ?? "",
                    maxDistanceKm: data.preferences?.maxDistanceKm?.toString() ?? "",
                    preferredCity: data.preferences?.preferredCity ?? "",
                    childrenPreference: data.preferences?.childrenPreference ?? "",
                    preferredMinHeight: data.preferences?.preferredMinHeight?.toString() ?? "",
                    preferredMaxHeight: data.preferences?.preferredMaxHeight?.toString() ?? "",
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

    const addValue = (value: string) => {
        const cleaned = value.trim();
        if (!cleaned) {
            return;
        }
        setForm((prev) => {
            if (prev.values.includes(cleaned)) {
                return prev;
            }
            return { ...prev, values: [...prev.values, cleaned].slice(0, 8) };
        });
        setValueInput("");
    };

    const removeValue = (value: string) => {
        setForm((prev) => ({
            ...prev,
            values: prev.values.filter((item) => item !== value),
        }));
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-slate-900/80 bg-slate-900/60 p-6"
        >
            <h3 className="text-lg font-semibold">Preferencje dopasowań</h3>
            <p className="mt-2 text-sm text-slate-400">
                Ustaw zakres wieku, lokalizację i dodatkowe preferencje.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
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
                <label className="space-y-2 text-sm">
                    <span className="text-slate-300">Preferowane miasto</span>
                    <input
                        type="text"
                        name="preferredCity"
                        placeholder="np. Kraków"
                        value={form.preferredCity}
                        onChange={(event) =>
                            setForm((prev) => ({ ...prev, preferredCity: event.target.value }))
                        }
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-slate-500"
                    />
                </label>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm">
                    <span className="text-slate-300">Maks. odległość (km)</span>
                    <input
                        type="number"
                        name="maxDistanceKm"
                        min={5}
                        max={500}
                        placeholder="np. 50"
                        value={form.maxDistanceKm}
                        onChange={(event) =>
                            setForm((prev) => ({ ...prev, maxDistanceKm: event.target.value }))
                        }
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-slate-500"
                    />
                </label>
                <label className="space-y-2 text-sm">
                    <span className="text-slate-300">Preferencja dzieci</span>
                    <select
                        name="childrenPreference"
                        value={form.childrenPreference}
                        onChange={(event) =>
                            setForm((prev) => ({ ...prev, childrenPreference: event.target.value }))
                        }
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-slate-500"
                    >
                        <option value="">Dowolnie</option>
                        <option value="yes">Chcę / akceptuję dzieci</option>
                        <option value="no">Nie chcę dzieci</option>
                        <option value="any">Bez preferencji</option>
                    </select>
                </label>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm">
                    <span className="text-slate-300">Wzrost od (cm)</span>
                    <input
                        type="number"
                        name="preferredMinHeight"
                        min={120}
                        max={230}
                        placeholder="np. 160"
                        value={form.preferredMinHeight}
                        onChange={(event) =>
                            setForm((prev) => ({ ...prev, preferredMinHeight: event.target.value }))
                        }
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-slate-500"
                    />
                </label>
                <label className="space-y-2 text-sm">
                    <span className="text-slate-300">Wzrost do (cm)</span>
                    <input
                        type="number"
                        name="preferredMaxHeight"
                        min={120}
                        max={230}
                        placeholder="np. 190"
                        value={form.preferredMaxHeight}
                        onChange={(event) =>
                            setForm((prev) => ({ ...prev, preferredMaxHeight: event.target.value }))
                        }
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-slate-500"
                    />
                </label>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm">
                    <span className="text-slate-300">Styl życia</span>
                    <select
                        name="lifestyle"
                        value={form.lifestyle}
                        onChange={(event) =>
                            setForm((prev) => ({ ...prev, lifestyle: event.target.value }))
                        }
                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-slate-500"
                    >
                        <option value="">Wybierz</option>
                        <option value="aktywny">Aktywny</option>
                        <option value="spokojny">Spokojny</option>
                        <option value="mieszany">Mieszany</option>
                    </select>
                </label>
            </div>
            <div className="mt-6 space-y-2 text-sm">
                <span className="text-slate-300">Wartości</span>
                <div className="flex flex-wrap gap-2">
                    {form.values.map((value) => (
                        <button
                            key={value}
                            type="button"
                            onClick={() => removeValue(value)}
                            className="flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/80 px-3 py-1 text-xs text-slate-200 transition hover:border-slate-500"
                        >
                            {value}
                            <span className="text-slate-500">×</span>
                        </button>
                    ))}
                    <input
                        type="text"
                        value={valueInput}
                        onChange={(event) => setValueInput(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === ",") {
                                event.preventDefault();
                                addValue(valueInput);
                            }
                        }}
                        placeholder="Dodaj wartość"
                        className="min-w-[140px] flex-1 bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-600"
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    {valuesSuggestions.map((value) => (
                        <button
                            key={value}
                            type="button"
                            onClick={() => addValue(value)}
                            className="rounded-full border border-slate-800/80 px-3 py-1 text-xs text-slate-400 transition hover:border-slate-600 hover:text-slate-200"
                        >
                            {value}
                        </button>
                    ))}
                </div>
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
