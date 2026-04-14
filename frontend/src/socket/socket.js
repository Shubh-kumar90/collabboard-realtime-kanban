import { io } from "socket.io-client";

const socket = io("https://collabboard-realtime-kanban.onrender.com");

export default socket;