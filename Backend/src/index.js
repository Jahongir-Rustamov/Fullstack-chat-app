import cookieParser from "cookie-parser";
import express from "express";
import { config } from "dotenv";
import AuthRoute from "./routes/auth.route.js";
import MessageSectionsRoute from "./routes/MessageSections.route.js";
import connectDB from "./library/db.js";
import { app, httpServer, io } from "./library/soket.js"; // Soket serverini import qilish
import cors from "cors";
import path from "path";
config();

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(
  cors({
    origin: "http://localhost:5173", // Frontend manzili
    credentials: true, // Agar cookie yoki auth kerak bo‘lsa
  })
);
app.use("/api/auth", AuthRoute);
app.use("/api/messages", MessageSectionsRoute);

const port = process.env.PORT || 5001;
const __dirname = path.resolve();

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../Frontend/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../Frontend", "dist", "index.html"));
  });
}

httpServer.listen(port, () => {
  connectDB();
  console.log(`Server is running on port:${port}`);
});
