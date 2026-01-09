import type { NextApiRequest } from "next";
import type { Server as HTTPServer } from "http";
import type { Socket as NetSocket } from "net";
import type { NextApiResponse } from "next";
import { Server as SocketIOServer } from "socket.io";

type NextApiResponseWithSocket = NextApiResponse & {
    socket: NetSocket & {
        server: HTTPServer & {
            io?: SocketIOServer;
        };
    };
};

export default function handler(req: NextApiRequest, res: NextApiResponseWithSocket) {
    if (!res.socket.server.io) {
        const io = new SocketIOServer(res.socket.server, {
            path: "/api/socket",
        });

        io.on("connection", (socket) => {
            socket.on("join", (conversationId: string) => {
                if (conversationId) {
                    socket.join(conversationId);
                }
            });
        });

        res.socket.server.io = io;
        const globalForSocket = globalThis as typeof globalThis & { _io?: SocketIOServer };
        globalForSocket._io = io;
    }

    res.end();
}
