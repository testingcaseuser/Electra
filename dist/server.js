"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_http_1 = require("node:http");
const next_1 = __importDefault(require("next"));
const socket_io_1 = require("socket.io");
const client_1 = require("@prisma/client");
const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
// when using middleware `hostname` and `port` must be provided below
const app = (0, next_1.default)({ dev, hostname, port });
const handler = app.getRequestHandler();
app.prepare().then(() => {
    const httpServer = (0, node_http_1.createServer)(handler);
    const io = new socket_io_1.Server(httpServer);
    const db = new client_1.PrismaClient();
    let users = [];
    io.on("connection", (socket) => {
        socket.on("newUser", (data) => {
            console.log("from server side newuser event:", data);
            // Ignore new user subscription when user is Anonymous (initial zustand value for session context)
            if (data.name !== "Anonymous" &&
                (!users.some((user) => user.name === data.name) || data.socketID)) {
                socket.join(data.space);
                // Update socket when duplicate is found elsewhere just push the new user
                users = users.some((user) => user.name === data.name)
                    ? users.map((user) => {
                        if (user.name === data.name) {
                            return data;
                        }
                        return user;
                    })
                    : [...users, data];
                io.to(data.space).emit("newUserResponse", users.filter((user) => user.space === data.space));
            }
        });
        socket.on("message", async (data) => {
            console.log("from server side message event:", data);
            // When new message is sended persist it into database and broadcast it into the space
            socket.join(data.message.spaceId);
            await db.message.create({
                data: data.insertToDB,
            });
            io.to(data.message.spaceId).emit("messageResponse", data.message);
        });
        socket.on("disconnect", () => {
            // Remove user reference
            users = users.map((user) => {
                if (user.socketID === socket.id) {
                    return {
                        ...user,
                        socketID: false,
                    };
                }
                return user;
            });
            io.emit("newUserResponse", users);
            socket.disconnect();
        });
    });
    httpServer
        .once("error", (err) => {
        console.error(err);
        process.exit(1);
    })
        .listen(port, () => {
        console.log(`> Ready on http://${hostname}:${port}`);
    });
});
