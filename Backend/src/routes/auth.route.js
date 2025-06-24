import express from "express";
import {
  CheckUserAuth,
  LoginSection,
  LogoutSection,
  SignupSection,
  UpdateProfile,
} from "../controllers/authController.js";
import { ProtectRoute } from "../middlewares/ProtectRoute.js";

const router = express.Router();

router.post("/signup", SignupSection);

router.post("/login", LoginSection);

router.delete("/logout", LogoutSection);

router.put("/update", ProtectRoute, UpdateProfile);

router.get("/check", ProtectRoute, CheckUserAuth);

export default router;
