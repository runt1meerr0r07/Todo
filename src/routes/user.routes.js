import { Router } from "express";
import { getTheme, updateTheme } from "../controllers/user.controller.js";
import { verifyAuth } from "../middleware/auth.middleware.js";

const userRoutes = Router();

userRoutes.put("/theme", verifyAuth, updateTheme);
userRoutes.get("/theme", verifyAuth, getTheme);


export default userRoutes;