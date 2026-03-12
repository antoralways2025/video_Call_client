import { io } from "socket.io-client";

const socket = io("https://video-call-backend-rv57.onrender.com/");

export default socket;