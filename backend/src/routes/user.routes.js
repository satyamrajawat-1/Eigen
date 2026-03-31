import { Router } from "express";
import { registerUser, registerOutsideUser , logOutUser} from "../controllers/user.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";


const router = Router()
router.route("/register/college").post(registerUser)
router.route("/logout").post(verifyJWT , logOutUser)
router.route("/register").post(verifyJWT,registerOutsideUser)



export default router
