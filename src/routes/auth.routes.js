import { Router } from "express";
import { loginUser, registerUser, authCheck, logoutUser } from "../controllers/user.controller.js";

const authRoutes = Router()

authRoutes.route("/register").post(registerUser)
authRoutes.route("/check").get(authCheck)
authRoutes.route("/login").post(loginUser)
authRoutes.post("/logout", logoutUser);

export default authRoutes