import { Router } from "express";
import { registerUser, registerOutsideUser , logOutUser, loginWithGoogle } from "../controllers/user.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router()
router.route("/register/college").post(registerUser)
router.route("/logout").post(verifyJWT , logOutUser)
router.route("/register").post(verifyJWT,registerOutsideUser)
router.route("/login/google").post(loginWithGoogle)



export default router
