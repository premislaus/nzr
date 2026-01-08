"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type RegisterErrors = {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<RegisterErrors>({});
  const [status, setStatus] = useState<null | { type: "success" | "error"; message: string }>(
    null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const nextErrors: RegisterErrors = {};

    if (!name.trim()) {
      nextErrors.name = "Imię i nazwisko jest wymagane.";
    }

    if (!email.trim()) {
      nextErrors.email = "E-mail jest wymagany.";
    } else if (!email.includes("@")) {
      nextErrors.email = "Podaj poprawny adres e-mail.";
    }

    if (!password) {
      nextErrors.password = "Hasło jest wymagane.";
    } else if (password.length < 8) {
      nextErrors.password = "Hasło musi mieć co najmniej 8 znaków.";
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = "Potwierdź hasło.";
    } else if (confirmPassword !== password) {
      nextErrors.confirmPassword = "Hasła nie są zgodne.";
    }

    return nextErrors;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);

    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setStatus({
        type: "error",
        message: "Popraw zaznaczone pola i spróbuj ponownie.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        setStatus({
          type: "error",
          message: data.error ?? "Nie udało się utworzyć konta.",
        });
        return;
      }

      const loginResponse = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const loginData = (await loginResponse.json()) as { error?: string };

      if (!loginResponse.ok) {
        setStatus({
          type: "error",
          message: loginData.error ?? "Nie udało się zalogować po rejestracji.",
        });
        return;
      }

      setStatus({ type: "success", message: "Konto zostało utworzone." });
      setPassword("");
      setConfirmPassword("");
      router.push("/dashboard");
    } catch {
      setStatus({ type: "error", message: "Błąd połączenia z serwerem." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="mx-auto flex min-h-screen w-full max-w-xl flex-col justify-center px-6 py-16">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-10 shadow-xl shadow-slate-950/40">
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
              NZR / Dołącz
            </p>
            <h1 className="text-3xl font-semibold">Załóż konto</h1>
            <p className="text-sm text-slate-400">
              Zacznij od podstaw. Profil uzupełnisz później.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-10 space-y-6">
            <label className="block space-y-2 text-sm">
              <span className="text-slate-300">Imię i nazwisko</span>
              <input
                type="text"
                name="name"
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                className={`w-full rounded-xl border bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition ${
                  errors.name ? "border-rose-500/70" : "border-slate-800 focus:border-slate-500"
                }`}
              />
              {errors.name ? <span className="text-xs text-rose-400">{errors.name}</span> : null}
            </label>

            <label className="block space-y-2 text-sm">
              <span className="text-slate-300">E-mail</span>
              <input
                type="email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className={`w-full rounded-xl border bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition ${
                  errors.email ? "border-rose-500/70" : "border-slate-800 focus:border-slate-500"
                }`}
              />
              {errors.email ? (
                <span className="text-xs text-rose-400">{errors.email}</span>
              ) : null}
            </label>

            <label className="block space-y-2 text-sm">
              <span className="text-slate-300">Hasło</span>
              <input
                type="password"
                name="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={`w-full rounded-xl border bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition ${
                  errors.password
                    ? "border-rose-500/70"
                    : "border-slate-800 focus:border-slate-500"
                }`}
              />
              {errors.password ? (
                <span className="text-xs text-rose-400">{errors.password}</span>
              ) : null}
            </label>

            <label className="block space-y-2 text-sm">
              <span className="text-slate-300">Potwierdź hasło</span>
              <input
                type="password"
                name="confirmPassword"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className={`w-full rounded-xl border bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition ${
                  errors.confirmPassword
                    ? "border-rose-500/70"
                    : "border-slate-800 focus:border-slate-500"
                }`}
              />
              {errors.confirmPassword ? (
                <span className="text-xs text-rose-400">{errors.confirmPassword}</span>
              ) : null}
            </label>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Masz już konto?</span>
              <Link href="/auth" className="text-slate-100 hover:text-white">
                Zaloguj się
              </Link>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Tworzenie..." : "Załóż konto"}
            </button>

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
        </div>
      </section>
    </main>
  );
}
