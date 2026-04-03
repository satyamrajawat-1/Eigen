import { Event } from "../models/event.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { Attendance } from "../models/attendance.model.js";
import { User } from "../models/user.model.js";
const ALLOWED_CLUBS = [
    'CODEBASE', 'KERNEL', 'ARC ROBOTICS', 'ALGORITHMUS', 
    'CYPHER', 'GDF', 'GFG', 'TGCC', 'TECHKNOW'
];

const COORDINATOR_EMAILS_MAP = {
    "algorithmus@iiitkota.ac.in": "ALGORITHMUS",
    "arcrobotics@iiitkota.ac.in": "ARC ROBOTICS",
    "codebase@iiitkota.ac.in": "CODEBASE",
    "kernel@iiitkota.ac.in": "KERNEL",
    "cyph3r@iiitkota.ac.in": "CYPHER",
    "clutch@iiitkota.ac.in": "CLUTCH", 
    "neoncinematics@iiitkota.ac.in": "NEON CINEMATICS"
};

const createEvent = asyncHandler(async (req, res) => {
    const { 
        title, clubName, description, date, startTime, 
        endTime, location, participationType, minTeamSize, maxTeamSize 
    } = req.body;

    // 1. Text Field Validation
    if (!title || !clubName || !date || !startTime || !endTime) {
        throw new ApiError(400, "TITLE, CLUBNAME, DATE, START TIME, AND END TIME ARE REQUIRED");
    }

    // 2. Image Validation 
    const imageLocalPath = req.file?.path;
    if (!imageLocalPath) {
        throw new ApiError(400, "EVENT IMAGE (POSTER) IS REQUIRED");
    }

    const upperClubName = clubName.toUpperCase();
    const upperTitle = title.toUpperCase().trim();

    if (!ALLOWED_CLUBS.includes(upperClubName)) {
        throw new ApiError(400, `INVALID CLUB. ALLOWED: ${ALLOWED_CLUBS.join(', ')}`);
    }

    // ==========================================
    // 3. AUTHORIZATION: COORDINATOR & ADMIN CHECK
    // ==========================================
    const isAdmin = req.user.roles?.includes('ADMIN');

    if (!isAdmin) {
        // Look up their official club based on their login email
        const userEmailLower = req.user.email.toLowerCase();
        const theirCoordinatedClub = COORDINATOR_EMAILS_MAP[userEmailLower];

        // If their email isn't in the map, they aren't a recognized coordinator
        if (!theirCoordinatedClub) {
            throw new ApiError(403, "ACCESS DENIED: ONLY ADMINS AND OFFICIAL CLUB COORDINATORS CAN CREATE EVENTS.");
        }

        // Do they actually coordinate the club they are trying to create an event for?
        if (theirCoordinatedClub !== upperClubName) {
            throw new ApiError(403, `ACCESS DENIED: YOU CAN ONLY CREATE EVENTS FOR ${theirCoordinatedClub}.`);
        }
    }
    // ==========================================

    // 4. Team Logic Parsing
    let pType = participationType ? participationType.toUpperCase() : 'INDIVIDUAL';
    let finalMin = 1, finalMax = 1;

    if (pType === 'TEAM') {
        finalMin = parseInt(minTeamSize, 10) || 2;
        finalMax = parseInt(maxTeamSize, 10) || 2;
        if (finalMin < 2) throw new ApiError(400, "MINIMUM TEAM SIZE MUST BE AT LEAST 2");
        if (finalMin > finalMax) throw new ApiError(400, "MIN SIZE CANNOT BE GREATER THAN MAX SIZE");
    }

    // 5. Duplicate Event Check
    const existingEvent = await Event.findOne({
        title: upperTitle,
        clubName: upperClubName
    });

    if (existingEvent) {
        throw new ApiError(409, `AN EVENT NAMED '${upperTitle}' ALREADY EXISTS FOR ${upperClubName}`);
    }

    // 6. Create Event in Database
    const newEvent = await Event.create({
        title: upperTitle,
        clubName: upperClubName,
        description,
        date,
        startTime,
        endTime,
        location,
        participationType: pType,
        minTeamSize: finalMin,
        maxTeamSize: finalMax,
        image: imageLocalPath, 
        createdBy: req.user._id
    });

    return res.status(201).json(
        new ApiResponse(201, newEvent, `EVENT '${newEvent.title}' CREATED SUCCESSFULLY`)
    );
});

const registerForEvent = asyncHandler(async (req, res) => {
    // We take the eventId from the URL parameters (e.g., /api/events/:eventId/register)
    const { eventId } = req.params;

    // 1. Find the Event
    const event = await Event.findById(eventId);
    if (!event) {
        throw new ApiError(404, "EVENT NOT FOUND");
    }

    // 2. Prevent Individual Registration for Team Events
    // Since you added Team logic, we must ensure solo students don't bypass it
    if (event.participationType === 'TEAM') {
        throw new ApiError(400, "THIS IS A TEAM EVENT. PLEASE USE THE TEAM REGISTRATION PORTAL.");
    }

    // 3. Time Validation (Registration Deadline)
    // Prevents students from registering for an event that happened yesterday
    const currentDate = new Date();
    const eventDate = new Date(event.date);

    // Stripping the time to strictly compare the calendar dates
    if (currentDate.setHours(0,0,0,0) > eventDate.setHours(0,0,0,0)) {
        throw new ApiError(400, "REGISTRATION CLOSED: EVENT HAS ALREADY ENDED");
    }

    // 4. Check for Existing Registration
    // This prevents a user from double-clicking and creating two QR records
    const existingAttendance = await Attendance.findOne({
        user: req.user._id,
        event: event._id
    });

    if (existingAttendance) {
        throw new ApiError(400, `YOU ARE ALREADY REGISTERED FOR ${event.title}`);
    }

    // 5. Create the Attendance Record
    const attendance = await Attendance.create({
        user: req.user._id,
        event: event._id,
        status: "REGISTERED"
    });

    return res.status(201).json(
        new ApiResponse(201, 
            { 
                eventTitle: event.title, 
                status: attendance.status,
                qrCodeIdentifier: req.user.qrCodeIdentifier // Frontend can use this to render the QR instantly
            }, 
            `SUCCESSFULLY REGISTERED FOR ${event.title}`
        )
    );
});

const registerTeamForEvent = asyncHandler(async (req, res) => {
    const { eventId } = req.params;
    const { teamName, memberEmails } = req.body; 
    // Expects memberEmails to be an array: ["friend1@iiitkota.ac.in", "friend2@iiitkota.ac.in"]

    // 1. Basic Validation
    if (!teamName || !memberEmails || !Array.isArray(memberEmails)) {
        throw new ApiError(400, "TEAM NAME AND AN ARRAY OF MEMBER EMAILS ARE REQUIRED");
    }

    // 2. Find the Event & Validate Type
    const event = await Event.findById(eventId);
    if (!event) {
        throw new ApiError(404, "EVENT NOT FOUND");
    }

    if (event.participationType !== 'TEAM') {
        throw new ApiError(400, "THIS IS AN INDIVIDUAL EVENT. TEAM REGISTRATION IS NOT ALLOWED.");
    }

    // 3. Prepare the Emails List (Ensure uppercase and include the leader)
    const formattedEmails = memberEmails.map(email => email.toUpperCase());
    
    // Automatically add the leader (the person making the request) if they forgot to include themselves
    if (!formattedEmails.includes(req.user.email)) {
        formattedEmails.push(req.user.email);
    }

    // 4. Validate Team Size
    if (formattedEmails.length < event.minTeamSize || formattedEmails.length > event.maxTeamSize) {
        throw new ApiError(400, `TEAM SIZE MUST BE BETWEEN ${event.minTeamSize} AND ${event.maxTeamSize} MEMBERS`);
    }

    // 5. Verify all members exist in the Database
    // (This ensures they have logged in via Google at least once and are verified IIIT KOTA students)
    const members = await User.find({ email: { $in: formattedEmails } });

    if (members.length !== formattedEmails.length) {
        throw new ApiError(400, "SOME MEMBERS ARE NOT REGISTERED ON THE PLATFORM. ASK THEM TO LOGIN ONCE BEFORE FORMING THE TEAM.");
    }

    const memberIds = members.map(member => member._id);

    // 6. Check for Double Registration (Crucial for Teams)
    // We must ensure none of these users are already registered for this event (either solo or in another team)
    const existingAttendance = await Attendance.find({ 
        event: event._id, 
        user: { $in: memberIds } 
    }).populate("user", "name email");

    if (existingAttendance.length > 0) {
        const alreadyRegisteredNames = existingAttendance.map(att => att.user.name).join(", ");
        throw new ApiError(400, `THE FOLLOWING MEMBERS ARE ALREADY REGISTERED FOR THIS EVENT: ${alreadyRegisteredNames}`);
    }

    // 7. Check if Team Name is already taken for this specific event
    const existingTeam = await Team.findOne({ 
        teamName: teamName.toUpperCase(), 
        event: event._id 
    });

    if (existingTeam) {
        throw new ApiError(400, "THIS TEAM NAME IS ALREADY TAKEN FOR THIS EVENT. PLEASE CHOOSE ANOTHER.");
    }

    // 8. Create the Team Document
    const newTeam = await Team.create({
        teamName: teamName.toUpperCase(),
        event: event._id,
        leader: req.user._id, // The user making the API request is automatically the leader
        members: memberIds,
        teamSize: memberIds.length
    });

    // 9. Bulk Create Attendance Records
    // We use insertMany for performance so we don't have to hit the DB in a loop
    const attendanceDocs = memberIds.map(id => ({
        user: id,
        event: event._id,
        status: "REGISTERED"
    }));

    await Attendance.insertMany(attendanceDocs);

    return res.status(201).json(
        new ApiResponse(201, 
            { 
                team: newTeam.teamName,
                size: newTeam.teamSize,
                leader: req.user.name 
            }, 
            `TEAM '${newTeam.teamName}' SUCCESSFULLY REGISTERED FOR ${event.title}`
        )
    );
});

const getMyClubEvents = asyncHandler(async (req, res) => {
    // 1. Grab the user's club array from the verified JWT token
    const userClubs = req.user.clubMemberships;

    // 2. If they aren't in any clubs, just return an empty array so the app doesn't crash
    if (!userClubs || userClubs.length === 0) {
        return res.status(200).json(
            new ApiResponse(200, [], "User is not a member of any clubs.")
        );
    }

    // 3. Find all events where the 'clubName' matches ANY of the clubs in the user's array
    // We also use .sort({ date: 1 }) to order them so the soonest events show up first!
    const events = await Event.find({
        clubName: { $in: userClubs }
    }).sort({ date: 1 });

    // 4. Send the list back to the Flutter app
    return res.status(200).json(
        new ApiResponse(200, events, "Successfully fetched events for your clubs.")
    );
});

const getEventAttendees = asyncHandler(async (req, res) => {
    const { eventId } = req.params;

    // Fetch all attendance documents for this event, and 'populate' the user's name
    const attendees = await Attendance.find({ event: eventId })
        .populate("user", "name email");

    return res.status(200).json(
        new ApiResponse(200, attendees, "Attendees fetched successfully")
    );
});

const scanQrCode = asyncHandler(async (req, res) => {
    const { eventId } = req.params;
    const { qrCodeIdentifier, scanType } = req.body; // scanType will be 'IN' or 'OUT'

    if (!qrCodeIdentifier || !scanType) {
        throw new ApiError(400, "QR Code and Scan Type are required.");
    }

    // 1. Find the User by their unique QR string
    const student = await User.findOne({ qrCodeIdentifier });
    if (!student) {
        throw new ApiError(404, "INVALID QR: Student not found in database.");
    }

    // 2. Check if they are registered for this specific event
    const attendanceRecord = await Attendance.findOne({ user: student._id, event: eventId });
    if (!attendanceRecord) {
        throw new ApiError(403, `ACCESS DENIED: ${student.name} is NOT registered for this event.`);
    }

    // 3. Prevent double-scanning (e.g., scanning IN when already IN)
    if (attendanceRecord.status === scanType) {
        throw new ApiError(400, `DOUBLE SCAN: ${student.name} is already marked ${scanType}.`);
    }

    // 4. Update the attendance status and history
    attendanceRecord.status = scanType;
    attendanceRecord.scanHistory.push({
        type: scanType,
        scannedBy: req.user._id // The volunteer making the scan
    });

    await attendanceRecord.save();

    // 5. Send a triumphant success message back to the phone!
    return res.status(200).json(
        new ApiResponse(200, { studentName: student.name }, `SUCCESS: ${student.name} marked ${scanType}!`)
    );
});

const updateEvent = asyncHandler(async (req, res) => {
    const { eventId } = req.params; 
    
    const { 
        title, clubName, description, date, startTime, 
        endTime, location, participationType, minTeamSize, maxTeamSize 
    } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
        throw new ApiError(404, "EVENT NOT FOUND");
    }

    // ==========================================
    // AUTHORIZATION LOGIC (EMAIL-BASED)
    // ==========================================
    const isAdmin = req.user.roles?.includes('ADMIN');
    const currentClub = event.clubName;
    const newClub = clubName ? clubName.toUpperCase() : currentClub;

    if (!isAdmin) {
        // 1. Look up their official club based on their login email
        const userEmailLower = req.user.email.toLowerCase();
        const theirCoordinatedClub = COORDINATOR_EMAILS_MAP[userEmailLower];

        // 2. If their email isn't in the map, they aren't a recognized coordinator
        if (!theirCoordinatedClub) {
            throw new ApiError(403, "ACCESS DENIED: ONLY ADMINS AND OFFICIAL CLUB COORDINATORS CAN EDIT EVENTS.");
        }

        // 3. Do they actually coordinate the club that owns this specific event?
        if (theirCoordinatedClub !== currentClub) {
            throw new ApiError(403, `ACCESS DENIED: YOU ONLY HAVE PERMISSION TO EDIT ${theirCoordinatedClub} EVENTS.`);
        }

        // 4. Prevent them from transferring the event to a club they don't own
        if (newClub !== currentClub && newClub !== theirCoordinatedClub) {
            throw new ApiError(403, `YOU CANNOT TRANSFER THIS EVENT TO ${newClub}.`);
        }
    }
    // ==========================================

    if (!ALLOWED_CLUBS.includes(newClub)) {
        throw new ApiError(400, `INVALID CLUB. ALLOWED: ${ALLOWED_CLUBS.join(', ')}`);
    }

    const newTitle = title ? title.toUpperCase().trim() : event.title;
    
    if (newTitle !== event.title || newClub !== event.clubName) {
        const duplicateEvent = await Event.findOne({ title: newTitle, clubName: newClub });
        if (duplicateEvent && duplicateEvent._id.toString() !== eventId) {
            throw new ApiError(409, `AN EVENT NAMED '${newTitle}' ALREADY EXISTS FOR ${newClub}`);
        }
    }

    let pType = participationType ? participationType.toUpperCase() : event.participationType;
    let finalMin = event.minTeamSize;
    let finalMax = event.maxTeamSize;

    if (pType === 'TEAM') {
        finalMin = minTeamSize ? parseInt(minTeamSize, 10) : (finalMin < 2 ? 2 : finalMin);
        finalMax = maxTeamSize ? parseInt(maxTeamSize, 10) : (finalMax < 2 ? 2 : finalMax);
        if (finalMin < 2) throw new ApiError(400, "MINIMUM TEAM SIZE MUST BE AT LEAST 2");
        if (finalMin > finalMax) throw new ApiError(400, "MIN SIZE CANNOT BE GREATER THAN MAX SIZE");
    } else {
        finalMin = 1;
        finalMax = 1;
    }

    const newImageLocalPath = req.file?.path;

    event.title = newTitle;
    event.clubName = newClub;
    if (description) event.description = description;
    if (date) event.date = date;
    if (startTime) event.startTime = startTime;
    if (endTime) event.endTime = endTime;
    if (location) event.location = location;
    
    event.participationType = pType;
    event.minTeamSize = finalMin;
    event.maxTeamSize = finalMax;
    
    if (newImageLocalPath) {
        event.image = newImageLocalPath; 
    }

    await event.save();

    return res.status(200).json(
        new ApiResponse(200, event, `EVENT '${event.title}' UPDATED SUCCESSFULLY`)
    );
});

const deleteEvent = asyncHandler(async (req, res) => {
    // 1. Get the Event ID from the URL (e.g., /api/v1/events/:eventId)
    const { eventId } = req.params; 

    // 2. Find the existing event
    const event = await Event.findById(eventId);
    if (!event) {
        throw new ApiError(404, "EVENT NOT FOUND");
    }

    // ==========================================
    // 3. AUTHORIZATION LOGIC (EMAIL-BASED)
    // ==========================================
    const isAdmin = req.user.roles?.includes('ADMIN');
    const currentClub = event.clubName;

    if (!isAdmin) {
        // Look up their official club based on their login email
        const userEmailLower = req.user.email.toLowerCase();
        const theirCoordinatedClub = COORDINATOR_EMAILS_MAP[userEmailLower];

        if (!theirCoordinatedClub) {
            throw new ApiError(403, "ACCESS DENIED: ONLY ADMINS AND OFFICIAL CLUB COORDINATORS CAN DELETE EVENTS.");
        }

        // Do they actually coordinate the club that owns this specific event?
        if (theirCoordinatedClub !== currentClub) {
            throw new ApiError(403, `ACCESS DENIED: YOU ONLY HAVE PERMISSION TO DELETE ${theirCoordinatedClub} EVENTS.`);
        }
    }
    
    if (event.image && fs.existsSync(event.image)) {
        fs.unlinkSync(event.image); 
    }

    // 5. Delete the Event from the Database
    await event.deleteOne();

    return res.status(200).json(
        new ApiResponse(200, {}, `EVENT '${event.title}' DELETED SUCCESSFULLY`)
    );
});


// Public: get all events grouped by club (no auth needed)
const getAllEvents = asyncHandler(async (req, res) => {
    const events = await Event.find({}).sort({ clubName: 1, date: 1 });

    // Group by clubName
    const grouped = {};
    for (const clubName of ALLOWED_CLUBS) {
        grouped[clubName] = [];
    }
    events.forEach(evt => {
        if (grouped[evt.clubName] !== undefined) {
            grouped[evt.clubName].push(evt);
        }
    });

    return res.status(200).json(
        new ApiResponse(200, grouped, "All events fetched successfully")
    );
});

export{
    createEvent,
    registerForEvent,
    registerTeamForEvent,
    getMyClubEvents,
    getEventAttendees,
    scanQrCode,
    getAllEvents,
    updateEvent,
    deleteEvent
};