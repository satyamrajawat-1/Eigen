import { Event } from "../models/event.model.js";
import { Team } from "../models/team.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";

const unregisterTeam = asyncHandler(async (req, res) => {
    // We take the teamId from the URL (e.g., /api/teams/:teamId/unregister)
    const { teamId } = req.params;

    // 1. Find the Team
    const team = await Team.findById(teamId);
    if (!team) {
        throw new ApiError(404, "TEAM NOT FOUND");
    }

    // 2. Authorization Check (CRITICAL)
    // Only the leader who created the team should be able to dissolve it.
    // .toString() is necessary because MongoDB ObjectIds are objects, not plain strings.
    if (team.leader.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "ONLY THE TEAM LEADER CAN UNREGISTER THIS TEAM");
    }

    // 3. Time Validation (Optional but Recommended)
    // Prevent a team from unregistering if the event has already ended.
    const event = await Event.findById(team.event);
    if (event) {
        const currentDate = new Date();
        const eventDate = new Date(event.date);
        
        if (currentDate.setHours(0,0,0,0) > eventDate.setHours(0,0,0,0)) {
            throw new ApiError(400, "CANNOT UNREGISTER: THE EVENT HAS ALREADY ENDED");
        }
    }

    // 4. Free the Members (Delete Attendance Records)
    // This looks for all attendance documents for THIS event, belonging to ANY member of THIS team.
    await Attendance.deleteMany({
        event: team.event,
        user: { $in: team.members }
    });

    // 5. Delete the Team Document
    await Team.findByIdAndDelete(teamId);

    return res.status(200).json(
        new ApiResponse(
            200, 
            {}, 
            `TEAM '${team.teamName}' UNREGISTERED SUCCESSFULLY. ALL MEMBERS ARE NOW FREE TO JOIN NEW TEAMS.`
        )
    );
});

export{
    unregisterTeam
}