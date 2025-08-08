import { Router } from "express";
import helloWorld from "../controllers/helloworld.controller.js";

const router=Router()

router.route("/helloworld").get(helloWorld)

export default router