"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type ProfileActionsProps = {
    targetUserId: string;
    mode: "heart" | "message";
};

export default function ProfileActions({ targetUserId, mode }: ProfileActionsProps) {
    const router = useRouter();
    const [showComposer, setShowComposer] = useState(false);
    const [message, setMessage] = useState("");
    const [status, setStatus] = useState<null | { type: "success" | "error"; message: string }>(
        null,
    );
    const [isSending, setIsSending] = useState(false);
    const [isLiking, setIsLiking] = useState(false);
    const [canLike, setCanLike] = useState(false);
    const [canMessage, setCanMessage] = useState(false);
    const [liked, setLiked] = useState(false);

    useEffect(() => {
        let active = true;

        const load = async () => {
            try {
                const response = await fetch(`/api/likes/status?toUserId=${targetUserId}`);
                if (!response.ok) {
                    return;
                }
                const data = (await response.json()) as {
                    canLike?: boolean;
                    canMessage?: boolean;
                    liked?: boolean;
                };
                if (!active) {
                    return;
                }
                setCanLike(Boolean(data.canLike));
                setCanMessage(Boolean(data.canMessage));
                setLiked(Boolean(data.liked));
            } catch {
                if (active) {
                    setStatus({ type: "error", message: "Nie udało się pobrać statusu." });
                }
            }
        };

        load();

        return () => {
            active = false;
        };
    }, [targetUserId]);

    const handleLike = async () => {
        setStatus(null);
        setIsLiking(true);
        try {
            const response = await fetch("/api/likes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ toUserId: targetUserId }),
            });
            const data = (await response.json()) as { error?: string };
            if (!response.ok) {
                setStatus({
                    type: "error",
                    message: data.error ?? "Nie udało się wysłać serca.",
                });
                return;
            }
            setLiked(true);
            setStatus({ type: "success", message: "Wysłano serce." });
        } catch {
            setStatus({ type: "error", message: "Błąd połączenia z serwerem." });
        } finally {
            setIsLiking(false);
        }
    };

    const handleSend = async () => {
        if (!message.trim()) {
            setStatus({ type: "error", message: "Napisz wiadomość." });
            return;
        }
        setIsSending(true);
        setStatus(null);
        try {
            const response = await fetch("/api/conversations/start", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ toUserId: targetUserId, body: message }),
            });
            const data = (await response.json()) as { error?: string; conversationId?: string };
            if (!response.ok) {
                setStatus({
                    type: "error",
                    message: data.error ?? "Nie udało się wysłać wiadomości.",
                });
                return;
            }
            if (data.conversationId) {
                router.push(`/messages/${data.conversationId}`);
            }
        } catch {
            setStatus({ type: "error", message: "Błąd połączenia z serwerem." });
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div>
            {mode === "heart" ? (
                <button
                    type="button"
                    onClick={handleLike}
                    disabled={isLiking || !canLike || liked}
                    className="rounded-full bg-rose-500/90 px-5 py-2 text-xs font-semibold text-white transition hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {liked ? "Serce wysłane" : isLiking ? "Wysyłanie..." : "Wyślij serce"}
                </button>
            ) : (
                <button
                    type="button"
                    onClick={() => setShowComposer((prev) => !prev)}
                    disabled={!canMessage}
                    className="rounded-full bg-slate-100 px-5 py-2 text-xs font-semibold text-slate-900 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                    Napisz wiadomość
                </button>
            )}

            {!canLike && mode === "heart" ? (
                <p className="mt-3 text-xs text-slate-400">
                    To działanie jest dostępne tylko dla kobiet.
                </p>
            ) : null}

            {!canMessage && mode === "message" ? (
                <p className="mt-3 text-xs text-slate-400">
                    To działanie jest dostępne tylko dla mężczyzn.
                </p>
            ) : null}

            {showComposer && mode === "message" ? (
                <div className="mt-4 space-y-3">
                    <textarea
                        rows={3}
                        value={message}
                        onChange={(event) => setMessage(event.target.value)}
                        placeholder="Napisz pierwszą wiadomość"
                        className="w-full resize-none rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-slate-500"
                    />
                    <button
                        type="button"
                        onClick={handleSend}
                        disabled={isSending}
                        className="rounded-2xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-900 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {isSending ? "Wysyłanie..." : "Wyślij"}
                    </button>
                </div>
            ) : null}

            {status ? (
                <p
                    className={`mt-3 text-xs ${
                        status.type === "success" ? "text-emerald-400" : "text-rose-400"
                    }`}
                >
                    {status.message}
                </p>
            ) : null}
        </div>
    );
}
