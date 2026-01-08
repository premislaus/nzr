"use client";

import { useEffect, useState } from "react";

type ProfileFormState = {
    name: string;
    city: string;
    birthYear: string;
    height: string;
    bio: string;
    interests: string[];
};

const emptyForm: ProfileFormState = {
    name: "",
    city: "",
    birthYear: "",
    height: "",
    bio: "",
    interests: [],
};

const interestSuggestions = [
    "Góry",
    "Książki",
    "Muzyka",
    "Podróże",
    "Sport",
    "Kawa",
    "Fotografia",
    "Gotowanie",
    "Taniec",
    "Sztuka",
    "Rowery",
    "Wolontariat",
];

export default function ProfileEditForm() {
    const [form, setForm] = useState<ProfileFormState>(emptyForm);
    const [interestInput, setInterestInput] = useState("");
    const [status, setStatus] = useState<null | { type: "success" | "error"; message: string }>(
        null,
    );
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        let active = true;

        const load = async () => {
            try {
                const response = await fetch("/api/profile");
                if (!response.ok) {
                    throw new Error("Failed");
                }
                const data = (await response.json()) as { profile?: Partial<ProfileFormState> };
                if (!active) {
                    return;
                }
                setForm((prev) => ({
                    ...prev,
                    ...data.profile,
                    interests: Array.isArray(data.profile?.interests)
                        ? data.profile?.interests ?? []
                        : prev.interests,
                    birthYear: data.profile?.birthYear?.toString() ?? prev.birthYear,
                    height: data.profile?.height?.toString() ?? prev.height,
                }));
            } catch {
                if (active) {
                    setStatus({ type: "error", message: "Nie udało się pobrać profilu." });
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

    const updateField = (key: keyof ProfileFormState, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const addInterest = (value: string) => {
        const cleaned = value.trim();
        if (!cleaned) {
            return;
        }
        setForm((prev) => {
            if (prev.interests.includes(cleaned)) {
                return prev;
            }
            return { ...prev, interests: [...prev.interests, cleaned].slice(0, 12) };
        });
        setInterestInput("");
    };

    const removeInterest = (value: string) => {
        setForm((prev) => ({
            ...prev,
            interests: prev.interests.filter((item) => item !== value),
        }));
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setStatus(null);
        setIsSaving(true);

        try {
            const response = await fetch("/api/profile", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });
            const data = (await response.json()) as { error?: string };

            if (!response.ok) {
                setStatus({
                    type: "error",
                    message: data.error ?? "Nie udało się zapisać profilu.",
                });
                return;
            }

            setStatus({ type: "success", message: "Profil zapisany." });
        } catch {
            setStatus({ type: "error", message: "Błąd połączenia z serwerem." });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
            <form
                onSubmit={handleSubmit}
                className="space-y-6 rounded-3xl border border-slate-900/80 bg-slate-900/60 p-8 shadow-xl shadow-slate-950/40"
            >
                <div>
                    <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
                        Podstawowe informacje
                    </p>
                    <h2 className="mt-4 text-3xl font-semibold">Pokaż się z najlepszej strony</h2>
                    <p className="mt-3 text-sm text-slate-400">
                        Uzupełnij dane, które pomogą w tworzeniu dopasowań.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <label className="space-y-2 text-sm">
                        <span className="text-slate-300">Imię i nazwisko</span>
                        <input
                            type="text"
                            name="name"
                            placeholder="Twoje imię"
                            value={form.name}
                            onChange={(event) => updateField("name", event.target.value)}
                            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-slate-500"
                        />
                    </label>
                    <label className="space-y-2 text-sm">
                        <span className="text-slate-300">Miasto</span>
                        <input
                            type="text"
                            name="city"
                            placeholder="np. Kraków"
                            value={form.city}
                            onChange={(event) => updateField("city", event.target.value)}
                            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-slate-500"
                        />
                    </label>
                    <label className="space-y-2 text-sm">
                        <span className="text-slate-300">Rok urodzenia</span>
                        <input
                            type="number"
                            name="birthYear"
                            min={1920}
                            max={2010}
                            placeholder="np. 1994"
                            value={form.birthYear}
                            onChange={(event) => updateField("birthYear", event.target.value)}
                            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-slate-500"
                        />
                    </label>
                    <label className="space-y-2 text-sm">
                        <span className="text-slate-300">Wzrost</span>
                        <input
                            type="number"
                            name="height"
                            min={120}
                            max={230}
                            placeholder="cm"
                            value={form.height}
                            onChange={(event) => updateField("height", event.target.value)}
                            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-slate-500"
                        />
                    </label>
                </div>

                <label className="space-y-2 text-sm">
                    <span className="text-slate-300">Krótki opis</span>
                    <textarea
                        name="bio"
                        rows={4}
                        placeholder="Napisz kilka zdań o sobie, wartościach i tym, co Cię inspiruje."
                        value={form.bio}
                        onChange={(event) => updateField("bio", event.target.value)}
                        className="w-full resize-none rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-slate-500"
                    />
                </label>

                <label className="space-y-2 text-sm">
                    <span className="text-slate-300">Zainteresowania</span>
                    <div className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                            {form.interests.map((interest) => (
                                <button
                                    key={interest}
                                    type="button"
                                    onClick={() => removeInterest(interest)}
                                    className="flex items-center gap-2 rounded-full border border-slate-700/80 bg-slate-900/80 px-3 py-1 text-xs text-slate-200 transition hover:border-slate-500"
                                >
                                    {interest}
                                    <span className="text-slate-500">×</span>
                                </button>
                            ))}
                            <input
                                type="text"
                                name="interestsInput"
                                placeholder="Dodaj zainteresowanie"
                                value={interestInput}
                                onChange={(event) => setInterestInput(event.target.value)}
                                onKeyDown={(event) => {
                                    if (event.key === "Enter" || event.key === ",") {
                                        event.preventDefault();
                                        addInterest(interestInput);
                                    }
                                }}
                                className="min-w-[160px] flex-1 bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-600"
                            />
                        </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                        {interestSuggestions.map((interest) => (
                            <button
                                key={interest}
                                type="button"
                                onClick={() => addInterest(interest)}
                                className="rounded-full border border-slate-800/80 px-3 py-1 text-xs text-slate-400 transition hover:border-slate-600 hover:text-slate-200"
                            >
                                {interest}
                            </button>
                        ))}
                    </div>
                </label>

                <div className="flex flex-wrap gap-3">
                    <button
                        type="button"
                        disabled={isLoading}
                        className="rounded-2xl border border-slate-800 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-600 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        Zapisz szkic
                    </button>
                    <button
                        type="submit"
                        disabled={isSaving || isLoading}
                        className="rounded-2xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {isSaving ? "Zapisywanie..." : "Zapisz profil"}
                    </button>
                </div>

                {status ? (
                    <p
                        className={`text-sm ${
                            status.type === "success" ? "text-emerald-400" : "text-rose-400"
                        }`}
                    >
                        {status.message}
                    </p>
                ) : null}
            </form>

            <aside className="space-y-6">
                <div className="rounded-3xl border border-slate-900/80 bg-slate-900/60 p-6">
                    <h3 className="text-lg font-semibold">Zdjęcia</h3>
                    <p className="mt-2 text-sm text-slate-400">
                        Dodaj minimum 2 zdjęcia, aby zwiększyć zaufanie.
                    </p>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                        <div className="flex h-24 items-center justify-center rounded-2xl border border-dashed border-slate-700 text-xs text-slate-500">
                            + Dodaj
                        </div>
                        <div className="flex h-24 items-center justify-center rounded-2xl border border-dashed border-slate-700 text-xs text-slate-500">
                            + Dodaj
                        </div>
                        <div className="flex h-24 items-center justify-center rounded-2xl border border-dashed border-slate-700 text-xs text-slate-500">
                            + Dodaj
                        </div>
                        <div className="flex h-24 items-center justify-center rounded-2xl border border-dashed border-slate-700 text-xs text-slate-500">
                            + Dodaj
                        </div>
                    </div>
                </div>

                <div className="rounded-3xl border border-slate-900/80 bg-slate-900/60 p-6">
                    <h3 className="text-lg font-semibold">Podgląd dopasowań</h3>
                    <p className="mt-2 text-sm text-slate-400">
                        Po zapisaniu profilu zobaczysz pierwsze rekomendacje.
                    </p>
                    <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-300">
                        0 nowych propozycji
                    </div>
                </div>
            </aside>
        </div>
    );
}
