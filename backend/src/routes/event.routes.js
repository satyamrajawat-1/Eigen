import { Router } from "express";
import { createEvent , registerForEvent , registerTeamForEvent, getMyClubEvents , getEventAttendees , scanQrCode, getAllEvents, updateEvent, deleteEvent} from "../controllers/event.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js"; 

const router = Router();

// Public route - no auth needed
router.route("/all").get(getAllEvents);

router.route("/create").post(
    verifyJWT, 
    upload.single("image"), 
    createEvent
);

router.route("/event-register/:eventId").post(verifyJWT , registerForEvent)
router.route("/team-event-register/:eventId").post(verifyJWT , registerTeamForEvent)
router.route("/my-club-events").get(verifyJWT, getMyClubEvents)
router.route("/:eventId/attendees").get(verifyJWT, getEventAttendees)
router.route("/:eventId/scan").post(verifyJWT, scanQrCode);
router.route("/:eventId/update").put(verifyJWT, upload.single("image"), updateEvent);
router.route("/:eventId/delete").delete(verifyJWT, deleteEvent);
export default router;