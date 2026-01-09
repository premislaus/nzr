"use client";

import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import MessageComposer from "@/components/messages/MessageComposer";

type MessageItem = {
    id: string;
    conversationId?: string;
    senderId: string;
    body: string;
    createdAt: string;
};

type MessageThreadClientProps = {
    conversationId: string;
    currentUserId: string;
    initialMessages: MessageItem[];
};

export default function MessageThreadClient({
    conversationId,
    currentUserId,
    initialMessages,
}: MessageThreadClientProps) {
    const [messages, setMessages] = useState<MessageItem[]>(initialMessages);
    const socketRef = useRef<Socket | null>(null);

    useEffect(() => {
        let active = true;

        const handleMessage = (message: MessageItem) => {
            if (message.conversationId !== conversationId) {
                return;
            }
            setMessages((prev) => {
                if (prev.some((item) => item.id === message.id)) {
                    return prev;
                }
                return [...prev, message];
            });
        };

        const init = async () => {
            await fetch("/api/socket");
            if (!active) {
                return;
            }
            socketRef.current = io({
                path: "/api/socket",
            });
            socketRef.current.on("connect", () => {
                socketRef.current?.emit("join", conversationId);
            });
            socketRef.current.on("reconnect", () => {
                socketRef.current?.emit("join", conversationId);
            });
            socketRef.current.on("message:new", handleMessage);
        };

        init();

        return () => {
            active = false;
            socketRef.current?.off("message:new", handleMessage);
            socketRef.current?.disconnect();
            socketRef.current = null;
        };
    }, [conversationId]);

    const handleSent = (message: MessageItem) => {
        setMessages((prev) => {
            if (prev.some((item) => item.id === message.id)) {
                return prev;
            }
            return [...prev, message];
        });
    };

    return (
        <div className="relative pb-28">
            <div className="mt-8 space-y-3">
                {messages.length === 0 ? (
                    <div className="rounded-2xl border border-slate-800 bg-slate-950/60 px-5 py-6 text-sm text-slate-400">
                        Brak wiadomości.
                    </div>
                ) : (
                    messages.map((message) => {
                        const isMine = message.senderId === currentUserId;
                        return (
                            <div
                                key={message.id}
                                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm ${
                                        isMine
                                            ? "bg-slate-100 text-slate-900"
                                            : "bg-slate-950 text-slate-100"
                                    }`}
                                >
                                    <p>{message.body}</p>
                                    <p className="mt-2 text-xs opacity-60">
                                        {new Date(message.createdAt).toLocaleTimeString("pl-PL", {
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <div className="fixed bottom-0 left-0 right-0 z-20 px-6 pb-6">
                <div className="mx-auto max-w-5xl rounded-3xl border border-slate-800/80 bg-slate-950/95 p-4 shadow-lg shadow-slate-950/50 backdrop-blur">
                    <MessageComposer
                        conversationId={conversationId}
                        currentUserId={currentUserId}
                        onSent={handleSent}
                    />
                </div>
            </div>
        </div>
    );
}
