import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { unregisterTeam } from "../controllers/team.controller.js";


const router = Router()
router.route("/unregister/:teamId").post(verifyJWT , unregisterTeam)


export default router