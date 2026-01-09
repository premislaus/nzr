"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type UserMenuProps = {
    likesCount?: number;
    messagesCount?: number;
};

export default function UserMenu({ likesCount = 0, messagesCount = 0 }: UserMenuProps) {
    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);
    const router = useRouter();

    useEffect(() => {
        const handleClick = (event: MouseEvent) => {
            if (!menuRef.current) {
                return;
            }
            if (!menuRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const handleLogout = async () => {
        setOpen(false);
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/auth");
    };

    return (
        <div className="relative" ref={menuRef}>
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className="flex items-center gap-3 rounded-full border border-slate-700/70 bg-slate-900/80 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-slate-500"
            >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-700 text-xs font-semibold uppercase">
                    NZ
                </span>
                <span className="hidden text-left sm:block">
                    <span className="block text-xs text-slate-400">Twoje konto</span>
                    <span className="block">Nowy Użytkownik</span>
                </span>
                <span className="text-xs text-slate-400">▾</span>
                {likesCount + messagesCount > 0 ? (
                    <span className="ml-1 rounded-full bg-rose-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                        {likesCount + messagesCount}
                    </span>
                ) : null}
            </button>

            {open ? (
                <div className="absolute right-0 mt-3 w-56 rounded-2xl border border-slate-800 bg-slate-900/95 p-2 text-sm shadow-xl shadow-slate-950/50">
                    <Link
                        href="/profile"
                        onClick={() => setOpen(false)}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-slate-200 hover:bg-slate-800/70"
                    >
                        <span className="text-slate-400">Profil</span>
                    </Link>
                    <Link
                        href="/settings"
                        onClick={() => setOpen(false)}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-slate-200 hover:bg-slate-800/70"
                    >
                        <span className="text-slate-400">Ustawienia</span>
                    </Link>
                    <div className="my-1 h-px bg-slate-800" />
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-rose-300 hover:bg-rose-500/10"
                    >
                        Wyloguj się
                    </button>
                </div>
            ) : null}
        </div>
    );
}
