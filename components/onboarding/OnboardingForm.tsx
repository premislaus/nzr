"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type PreferencesState = {
    birthYear: string;
    ageRange: string;
    preferredCity: string;
    values: string[];
    lifestyle: string;
    maxDistanceKm: string;
    childrenPreference: string;
    preferredMinHeight: string;
    preferredMaxHeight: string;
};

const emptyPreferences: PreferencesState = {
    birthYear: "",
    ageRange: "",
    preferredCity: "",
    values: [],
    lifestyle: "",
    maxDistanceKm: "",
    childrenPreference: "",
    preferredMinHeight: "",
    preferredMaxHeight: "",
};

const ageSuggestions = ["20-27", "26-35", "30-40", "35-45", "40-55"];
const ageRangeRegex = /^\d{2}-\d{2}$/;
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
const childrenLabels: Record<string, string> = {
    any: "Bez preferencji",
    yes: "Chcę / akceptuję dzieci",
    no: "Nie chcę dzieci",
};

export default function OnboardingForm() {
    const router = useRouter();
    const [step, setStep] = useState(0);
    const [form, setForm] = useState<PreferencesState>(emptyPreferences);
    const [status, setStatus] = useState<null | { type: "success" | "error"; message: string }>(
        null,
    );
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [valueInput, setValueInput] = useState("");
    const [ageMin, setAgeMin] = useState(26);
    const [ageMax, setAgeMax] = useState(35);

    useEffect(() => {
        let active = true;

        const load = async () => {
            try {
                const [settingsResponse, profileResponse] = await Promise.all([
                    fetch("/api/settings"),
                    fetch("/api/profile"),
                ]);
                if (!settingsResponse.ok) {
                    throw new Error("Failed");
                }
                const data = (await settingsResponse.json()) as {
                    preferences?: PreferencesState;
                };
                if (!active) {
                    return;
                }
                const savedRange = data.preferences?.ageRange ?? "";
                setForm({
                    birthYear: "",
                    ageRange: savedRange,
                    preferredCity: data.preferences?.preferredCity ?? "",
                    values: Array.isArray(data.preferences?.values)
                        ? data.preferences?.values ?? []
                        : [],
                    lifestyle: data.preferences?.lifestyle ?? "",
                    maxDistanceKm: data.preferences?.maxDistanceKm?.toString() ?? "",
                    childrenPreference: data.preferences?.childrenPreference ?? "",
                    preferredMinHeight: data.preferences?.preferredMinHeight?.toString() ?? "",
                    preferredMaxHeight: data.preferences?.preferredMaxHeight?.toString() ?? "",
                });
                if (profileResponse.ok) {
                    const profileData = (await profileResponse.json()) as {
                        profile?: { city?: string; birthYear?: number | string };
                    };
                    const city = profileData.profile?.city ?? "";
                    const birthYearValue = profileData.profile?.birthYear ?? "";
                    if (city || birthYearValue) {
                        setForm((prev) => ({
                            ...prev,
                            preferredCity:
                                city && !data.preferences?.preferredCity
                                    ? city
                                    : prev.preferredCity,
                            birthYear:
                                birthYearValue && !prev.birthYear
                                    ? birthYearValue.toString()
                                    : prev.birthYear,
                        }));
                    }
                }
                if (ageRangeRegex.test(savedRange)) {
                    const [min, max] = savedRange.split("-").map(Number);
                    setAgeMin(min);
                    setAgeMax(max);
                }
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

    const validateStep = () => {
        if (step === 0) {
            if (!form.birthYear) {
                setStatus({ type: "error", message: "Podaj rok urodzenia." });
                return false;
            }
            const birthYearValue = Number(form.birthYear);
            const currentYear = new Date().getFullYear();
            const minYear = currentYear - 99;
            const maxYear = currentYear - 18;
            if (
                !Number.isFinite(birthYearValue) ||
                birthYearValue < minYear ||
                birthYearValue > maxYear
            ) {
                setStatus({
                    type: "error",
                    message: "Rok urodzenia musi oznaczać wiek 18-99.",
                });
                return false;
            }
        }
        if (step === 1) {
            if (!form.ageRange) {
                setStatus({ type: "error", message: "Podaj preferowany zakres wieku." });
                return false;
            }
            if (!ageRangeRegex.test(form.ageRange)) {
                setStatus({
                    type: "error",
                    message: "Zakres wieku podaj w formacie 26-35.",
                });
                return false;
            }
        }
        if (step === 2) {
            if (!form.maxDistanceKm) {
                setStatus({ type: "error", message: "Podaj maksymalną odległość." });
                return false;
            }
        }
        if (step === 3 && !form.childrenPreference) {
            setStatus({ type: "error", message: "Wybierz preferencję dotyczącą dzieci." });
            return false;
        }
        if (step === 4) {
            if (!form.preferredMinHeight || !form.preferredMaxHeight) {
                setStatus({ type: "error", message: "Podaj zakres wzrostu." });
                return false;
            }
        }
        setStatus(null);
        return true;
    };

    const handleNext = () => {
        if (!validateStep()) {
            return;
        }
        setStep((prev) => Math.min(prev + 1, 7));
    };

    const handleBack = () => {
        setStatus(null);
        setStep((prev) => Math.max(prev - 1, 0));
    };

    const handleSubmit = async () => {
        if (!validateStep()) {
            return;
        }
        setIsSaving(true);
        try {
            const profileResponse = await fetch("/api/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ birthYear: form.birthYear }),
            });
            const profileData = (await profileResponse.json()) as { error?: string };
            if (!profileResponse.ok) {
                setStatus({
                    type: "error",
                    message: profileData.error ?? "Nie udało się zapisać profilu.",
                });
                return;
            }
            const response = await fetch("/api/settings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = (await response.json()) as { error?: string };

            if (!response.ok) {
                setStatus({
                    type: "error",
                    message: data.error ?? "Nie udało się zapisać preferencji.",
                });
                return;
            }

            setStatus({ type: "success", message: "Preferencje zapisane." });
            router.push("/dashboard");
        } catch {
            setStatus({ type: "error", message: "Błąd połączenia z serwerem." });
        } finally {
            setIsSaving(false);
        }
    };

    const handleSkip = async () => {
        const fallbackAgeRange = form.ageRange || "26-35";
        setIsSaving(true);
        try {
            if (form.birthYear) {
                const profileResponse = await fetch("/api/profile", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ birthYear: form.birthYear }),
                });
                if (!profileResponse.ok) {
                    throw new Error("Profile failed");
                }
            }
            const response = await fetch("/api/settings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ageRange: fallbackAgeRange,
                    preferredCity: form.preferredCity || "",
                    maxDistanceKm: form.maxDistanceKm || "50",
                    childrenPreference: form.childrenPreference || "any",
                    preferredMinHeight: form.preferredMinHeight || "160",
                    preferredMaxHeight: form.preferredMaxHeight || "190",
                    lifestyle: form.lifestyle || "mieszany",
                    values: form.values ?? [],
                }),
            });
            if (!response.ok) {
                throw new Error("Failed");
            }
            router.push("/dashboard");
        } catch {
            setStatus({ type: "error", message: "Nie udało się pominąć." });
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
        <div className="mx-auto w-full max-w-3xl">
            <div className="rounded-3xl border border-slate-900/80 bg-slate-900/60 p-10 shadow-xl shadow-slate-950/40">
                <div className="space-y-3">
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
                        Onboarding
                    </p>
                    <h2 className="text-3xl font-semibold">Ustaw preferencje dopasowań</h2>
                    <p className="text-sm text-slate-400">
                        To zajmie chwilę. Dzięki temu pokażemy Ci lepsze profile.
                    </p>
                </div>

                <div className="mt-8 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                    <div
                        className="h-full rounded-full bg-slate-200 transition-all"
                        style={{ width: `${((step + 1) / 8) * 100}%` }}
                    />
                </div>

                <div className="mt-10 space-y-8">
                    {step === 0 ? (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Rok urodzenia</h3>
                            <label className="space-y-2 text-sm">
                                <span className="text-slate-300">Podaj rok urodzenia</span>
                                <input
                                    type="number"
                                    min={1900}
                                    max={new Date().getFullYear()}
                                    value={form.birthYear}
                                    onChange={(event) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            birthYear: event.target.value,
                                        }))
                                    }
                                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-slate-500"
                                />
                            </label>
                        </div>
                    ) : null}

                    {step === 1 ? (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Zakres wieku</h3>
                            <div className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-4">
                                <div className="flex items-center justify-between text-sm text-slate-300">
                                    <span>{ageMin} lat</span>
                                    <span>{ageMax} lat</span>
                                </div>
                                <div className="mt-4 grid gap-4">
                                    <label className="space-y-2 text-xs text-slate-400">
                                        <span>Minimum</span>
                                        <input
                                            type="range"
                                            min={18}
                                            max={70}
                                            value={ageMin}
                                            onChange={(event) => {
                                                const value = Number(event.target.value);
                                                const nextMin = Math.min(value, ageMax - 1);
                                                setAgeMin(nextMin);
                                                setForm((prev) => ({
                                                    ...prev,
                                                    ageRange: `${nextMin}-${ageMax}`,
                                                }));
                                            }}
                                            className="w-full accent-slate-200"
                                        />
                                    </label>
                                    <label className="space-y-2 text-xs text-slate-400">
                                        <span>Maksimum</span>
                                        <input
                                            type="range"
                                            min={19}
                                            max={80}
                                            value={ageMax}
                                            onChange={(event) => {
                                                const value = Number(event.target.value);
                                                const nextMax = Math.max(value, ageMin + 1);
                                                setAgeMax(nextMax);
                                                setForm((prev) => ({
                                                    ...prev,
                                                    ageRange: `${ageMin}-${nextMax}`,
                                                }));
                                            }}
                                            className="w-full accent-slate-200"
                                        />
                                    </label>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {ageSuggestions.map((range) => (
                                    <button
                                        key={range}
                                        type="button"
                                        onClick={() =>
                                            (() => {
                                                const [min, max] = range.split("-").map(Number);
                                                setAgeMin(min);
                                                setAgeMax(max);
                                                setForm((prev) => ({ ...prev, ageRange: range }));
                                            })()
                                        }
                                        className="rounded-full border border-slate-800/80 px-3 py-1 text-xs text-slate-400 transition hover:border-slate-600 hover:text-slate-200"
                                    >
                                        {range}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : null}

                    {step === 2 ? (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Lokalizacja</h3>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <label className="space-y-2 text-sm">
                                    <span className="text-slate-300">Preferowane miasto</span>
                                    <input
                                        type="text"
                                        placeholder="np. Kraków"
                                        value={form.preferredCity}
                                        onChange={(event) =>
                                            setForm((prev) => ({
                                                ...prev,
                                                preferredCity: event.target.value,
                                            }))
                                        }
                                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-slate-500"
                                    />
                                </label>
                                <label className="space-y-2 text-sm">
                                    <span className="text-slate-300">Maks. odległość (km)</span>
                                    <input
                                        type="number"
                                        min={5}
                                        max={500}
                                        value={form.maxDistanceKm}
                                        onChange={(event) =>
                                            setForm((prev) => ({
                                                ...prev,
                                                maxDistanceKm: event.target.value,
                                            }))
                                        }
                                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-slate-500"
                                    />
                                </label>
                            </div>
                        </div>
                    ) : null}

                    {step === 3 ? (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Dzieci</h3>
                            <label className="space-y-2 text-sm">
                                <span className="text-slate-300">Preferencja dzieci</span>
                                <select
                                    value={form.childrenPreference}
                                    onChange={(event) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            childrenPreference: event.target.value,
                                        }))
                                    }
                                    className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-slate-500"
                                >
                                    <option value="">Wybierz</option>
                                    <option value="any">Bez preferencji</option>
                                    <option value="yes">Chcę / akceptuję dzieci</option>
                                    <option value="no">Nie chcę dzieci</option>
                                </select>
                            </label>
                        </div>
                    ) : null}

                    {step === 4 ? (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Wzrost</h3>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <label className="space-y-2 text-sm">
                                    <span className="text-slate-300">Wzrost od (cm)</span>
                                    <input
                                        type="number"
                                        min={120}
                                        max={230}
                                        value={form.preferredMinHeight}
                                        onChange={(event) =>
                                            setForm((prev) => ({
                                                ...prev,
                                                preferredMinHeight: event.target.value,
                                            }))
                                        }
                                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-slate-500"
                                    />
                                </label>
                                <label className="space-y-2 text-sm">
                                    <span className="text-slate-300">Wzrost do (cm)</span>
                                    <input
                                        type="number"
                                        min={120}
                                        max={230}
                                        value={form.preferredMaxHeight}
                                        onChange={(event) =>
                                            setForm((prev) => ({
                                                ...prev,
                                                preferredMaxHeight: event.target.value,
                                            }))
                                        }
                                        className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-slate-500"
                                    />
                                </label>
                            </div>
                        </div>
                    ) : null}

                    {step === 5 ? (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Najważniejsze wartości</h3>
                            <p className="text-sm text-slate-400">
                                Wybierz to, co jest dla Ciebie kluczowe.
                            </p>
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
                                    className="min-w-[160px] flex-1 bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-600"
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
                    ) : null}

                    {step === 6 ? (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Styl życia</h3>
                            <label className="space-y-2 text-sm">
                                <span className="text-slate-300">Styl życia</span>
                                <select
                                    name="lifestyle"
                                    value={form.lifestyle}
                                    onChange={(event) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            lifestyle: event.target.value,
                                        }))
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
                    ) : null}

                    {step === 7 ? (
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Podsumowanie</h3>
                            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-sm text-slate-300">
                                <p>Preferencje:</p>
                                <p className="mt-2 text-slate-100">
                                    Rok urodzenia: {form.birthYear || "brak"}
                                </p>
                                <p className="mt-2 text-slate-100">
                                    Zakres wieku: {form.ageRange}
                                </p>
                                <p className="text-slate-100">
                                    Miasto: {form.preferredCity || "brak"}
                                </p>
                                <p className="text-slate-100">
                                    Max odległość: {form.maxDistanceKm || "brak"} km
                                </p>
                                <p className="text-slate-100">
                                    Dzieci:{" "}
                                    {form.childrenPreference
                                        ? childrenLabels[form.childrenPreference] ??
                                          form.childrenPreference
                                        : "brak"}
                                </p>
                                <p className="text-slate-100">
                                    Wzrost: {form.preferredMinHeight || "—"}-
                                    {form.preferredMaxHeight || "—"} cm
                                </p>
                                <p className="text-slate-100">
                                    Styl życia: {form.lifestyle || "brak"}
                                </p>
                                <p className="text-slate-100">
                                    Wartości:{" "}
                                    {form.values.length > 0 ? form.values.join(", ") : "brak"}
                                </p>
                            </div>
                        </div>
                    ) : null}
                </div>

                <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
                    <button
                        type="button"
                        onClick={handleBack}
                        disabled={step === 0 || isLoading}
                        className="rounded-2xl border border-slate-800 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-600 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        Wstecz
                    </button>
                    <div className="flex flex-wrap gap-3">
                        <button
                            type="button"
                            onClick={handleSkip}
                            disabled={isSaving || isLoading}
                            className="rounded-2xl border border-slate-800 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-600 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            Pomiń
                        </button>
                        {step < 7 ? (
                            <button
                                type="button"
                                onClick={handleNext}
                                disabled={isLoading}
                                className="rounded-2xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                Dalej
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={isSaving || isLoading}
                                className="rounded-2xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {isSaving ? "Zapisywanie..." : "Zapisz preferencje"}
                            </button>
                        )}
                    </div>
                </div>

                {status ? (
                    <p
                        className={`mt-6 text-sm ${
                            status.type === "success" ? "text-emerald-400" : "text-rose-400"
                        }`}
                    >
                        {status.message}
                    </p>
                ) : null}
            </div>
        </div>
    );
}
