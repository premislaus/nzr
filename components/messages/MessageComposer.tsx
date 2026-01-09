"use client";

import { useState } from "react";

type MessageComposerProps = {
    conversationId: string;
    currentUserId: string;
    onSent?: (message: {
        id: string;
        conversationId: string;
        senderId: string;
        body: string;
        createdAt: string;
    }) => void;
};

export default function MessageComposer({
    conversationId,
    currentUserId,
    onSent,
}: MessageComposerProps) {
    const [message, setMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [status, setStatus] = useState<string | null>(null);

    const handleSend = async () => {
        if (!message.trim()) {
            setStatus("Napisz wiadomość.");
            return;
        }
        setIsSending(true);
        setStatus(null);
        try {
            const response = await fetch("/api/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ conversationId, body: message }),
            });
            const data = (await response.json()) as {
                error?: string;
                message?: {
                    id: string;
                    conversationId: string;
                    senderId: string;
                    body: string;
                    createdAt: string;
                };
            };
            if (!response.ok) {
                setStatus(data.error ?? "Nie udało się wysłać wiadomości.");
                return;
            }
            if (data.message) {
                onSent?.(data.message);
            } else {
                onSent?.({
                    id: `${conversationId}-${Date.now()}`,
                    conversationId,
                    senderId: currentUserId,
                    body: message.trim(),
                    createdAt: new Date().toISOString(),
                });
            }
            setMessage("");
        } catch {
            setStatus("Błąd połączenia z serwerem.");
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="mt-6 space-y-3">
            <textarea
                rows={3}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Napisz wiadomość..."
                className="w-full resize-none rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-slate-500"
            />
            <div className="flex flex-wrap items-center gap-3">
                <button
                    type="button"
                    onClick={handleSend}
                    disabled={isSending}
                    className="rounded-2xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-900 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-70"
                >
                    {isSending ? "Wysyłanie..." : "Wyślij"}
                </button>
                {status ? <span className="text-xs text-rose-400">{status}</span> : null}
            </div>
        </div>
    );
}
