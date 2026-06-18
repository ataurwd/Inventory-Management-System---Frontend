import { io, Socket } from "socket.io-client";

const socketUrl =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  "http://localhost:3001";

export const socket: Socket = io(socketUrl, {
  withCredentials: true,
  autoConnect: false, // Connect manually when authenticated
  transports: ["websocket"],
});
