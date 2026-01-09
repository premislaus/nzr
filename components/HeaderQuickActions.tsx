"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, Heart, MessageCircle, Users } from "lucide-react";

type QuickItem = {
    id: string;
    title: string;
    subtitle: string;
    href: string;
};

type HeaderQuickActionsProps = {
    label: string;
    count: number;
    items: QuickItem[];
    emptyText: string;
    hrefAll: string;
    iconName: "heart" | "message" | "match" | "notification";
};

export default function HeaderQuickActions({
    label,
    count,
    items,
    emptyText,
    hrefAll,
    iconName,
}: HeaderQuickActionsProps) {
    const [open, setOpen] = useState(false);
    const panelRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const handleClick = (event: MouseEvent) => {
            if (!panelRef.current) {
                return;
            }
            if (!panelRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const Icon =
        iconName === "heart"
            ? Heart
            : iconName === "match"
              ? Users
              : iconName === "notification"
                ? Bell
                : MessageCircle;

    return (
        <div className="relative z-30" ref={panelRef}>
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-800 bg-slate-900/80 text-slate-200 transition hover:border-slate-600"
                aria-label={label}
            >
                <Icon className="h-5 w-5" />
                {count > 0 ? (
                    <span className="absolute -right-1 -top-1 rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                        {count}
                    </span>
                ) : null}
            </button>

            {open ? (
                <div className="absolute right-0 z-50 mt-3 w-72 rounded-2xl border border-slate-800 bg-slate-900/95 p-3 shadow-xl shadow-slate-950/50">
                    <div className="flex items-center justify-between px-2">
                        <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                            {label}
                        </p>
                        <Link
                            href={hrefAll}
                            className="text-xs text-slate-400 hover:text-slate-200"
                        >
                            Zobacz
                        </Link>
                    </div>
                    <div className="mt-3 space-y-2">
                        {items.length === 0 ? (
                            <div className="rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-3 text-xs text-slate-400">
                                {emptyText}
                            </div>
                        ) : (
                            items.map((item) => (
                                <Link
                                    key={item.id}
                                    href={item.href}
                                    className="block rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 transition hover:border-slate-600"
                                >
                                    <p className="text-xs font-semibold text-slate-200">
                                        {item.title}
                                    </p>
                                    <p className="mt-1 text-[11px] text-slate-400">
                                        {item.subtitle}
                                    </p>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            ) : null}
        </div>
    );
}
