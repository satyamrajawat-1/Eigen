import { Router } from "express";
import { createEvent , registerForEvent , registerTeamForEvent } from "../controllers/event.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js"; 

const router = Router();

router.route("/create").post(
    verifyJWT, 
    upload.single("image"), 
    createEvent
);

router.route("/event-register/:eventId").post(verifyJWT , registerForEvent)
router.route("/team-event-register/:eventId").post(verifyJWT , registerTeamForEvent)

export default router;