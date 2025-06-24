import { Server } from "socket.io";
import { createServer } from "http";
// import cors from "cors";
import express from "express";

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: ["http://localhost:5173"],
});

export function getReceiverSocketId(userId) {
  return userOnlineMaP[userId] || null;
}

//used to store online users
const userOnlineMaP = {};
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  const { userId } = socket.handshake.query;
  if (userId) {
    userOnlineMaP[userId] = socket.id;
    console.log("User online map:", userOnlineMaP);
  }
  // Emit the updated user online map to all connected clients
  io.emit("getUserOnline", Object.keys(userOnlineMaP));

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
    if (userId && userOnlineMaP[userId]) {
      delete userOnlineMaP[userId];
      console.log("User online map after disconnect:", userOnlineMaP);
      // Emit the updated user online map to all connected clients
      io.emit("getUserOnline", Object.keys(userOnlineMaP));
    }
  });
});
export { io, app, httpServer };
