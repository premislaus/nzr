import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import UserMenu from "./UserMenu";

type AppShellProps = {
    label: string;
    title: string;
    children: ReactNode;
};

export default async function AppShell({ label, title, children }: AppShellProps) {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/auth");
    }

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100">
            <div className="relative overflow-hidden">
                <div className="pointer-events-none absolute -top-40 right-0 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl" />
                <div className="pointer-events-none absolute left-10 top-20 h-72 w-72 rounded-full bg-rose-500/10 blur-3xl" />

                <header className="border-b border-slate-900/80 bg-slate-950/80 backdrop-blur">
                    <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
                        <div className="flex items-center gap-4">
                        <Link
                            href="/dashboard"
                            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-xs font-semibold uppercase tracking-[0.25em] text-slate-200 transition hover:bg-slate-800"
                        >
                            NZR
                        </Link>
                            <div>
                                <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
                                    {label}
                                </p>
                                <h1 className="text-lg font-semibold">{title}</h1>
                            </div>
                        </div>
                        <UserMenu />
                    </div>
                </header>

                <section className="mx-auto w-full max-w-6xl px-6 py-12">{children}</section>
            </div>
        </main>
    );
}
