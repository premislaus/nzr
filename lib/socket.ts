import type { Server as SocketIOServer } from "socket.io";

export function getSocketServer(): SocketIOServer | null {
    const globalForSocket = globalThis as typeof globalThis & {
        _io?: SocketIOServer;
    };

    return globalForSocket._io ?? null;
}
