import express from "express";
import { ProtectRoute } from "../middlewares/ProtectRoute.js";
import {
  GetAllUsers,
  getMessages,
  SendMessage,
} from "../controllers/messageController.js";

const router = express.Router();

router.get("/users", ProtectRoute, GetAllUsers);

router.get("/:id", ProtectRoute, getMessages);

router.post("/send/:id", ProtectRoute, SendMessage);

export default router;
