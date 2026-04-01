import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import { User } from "../models/user.model.js";
import { Attendance } from "../models/attendance.model.js";
import { Event } from "../models/event.model.js";
import { v4 as uuidv4 } from "uuid";
import { OAuth2Client } from 'google-auth-library';
import { clubMember } from "../models/club.model.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID); 

const registerUser = asyncHandler(async(req, res) => {
    const { googleToken } = req.body; 
    
    if(!googleToken){
        throw new ApiError(400, "Google Token is Required");
    }

    // 1. Verify token
    const ticket = await client.verifyIdToken({
        idToken: googleToken,
        audience: process.env.GOOGLE_CLIENT_ID, 
    });

    const payload = ticket.getPayload();
    const { sub: uid, email, name } = payload; 

    // 2. Find if user already exists
    let user = await User.findOne({ firebaseUid: uid }); 
    
    if (!user) {
        const isCollege = email.toUpperCase().endsWith("@IIITKOTA.AC.IN");
        
        if(!isCollege){
            throw new ApiError(403, "Only College Students can register through this portal.");
        }

        // --- NEW CLUB CHECKING LOGIC ---
        // Extract studentId from email (e.g., "2024kucp1160@iiitkota.ac.in" -> "2024KUCP1160")
        const studentId = email.split('@')[0].toUpperCase();

        // Search the Club schema to see if this studentId exists in any club's members array
        const userClubs = await clubMember.find({ "members.studentId": studentId });

        // Initialize default roles and empty clubs array
        let assignedRoles = ["STUDENT"];
        let assignedClubs = [];

        // If the query found any clubs, update arrays
        if (userClubs && userClubs.length > 0) {
            assignedRoles.push("CLUB_MEMBER"); // Add the elevated role
            
            // Extract just the club names and ensure they match your User schema's Enum (Uppercase)
            assignedClubs = userClubs.map(club => club.clubName.toUpperCase());
        }
        // -------------------------------

        // 3. Create the User with dynamic roles and clubs
        user = await User.create({
            firebaseUid: uid, 
            email: email.toUpperCase(),
            name: name.toUpperCase(),
            roles: assignedRoles,             // Dynamically assigned
            clubMemberships: assignedClubs,   // Dynamically assigned
            qrCodeIdentifier: uuidv4() 
        });
    }

    // 4. Generate Session Token
    let accessToken = user.generateAccessToken(); 
    console.log(accessToken)
    
    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "None"
    };
    
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .json(new ApiResponse(200, user, "User authenticated successfully"));
});
 const registerOutsideUser = asyncHandler(async (req, res) => {
    const { name, email,phone } = req.body;
    const TARGET_EVENT = "DJ NIGHT";

    // 1. Validation
    if (!name || !email || !phone) {
        throw new ApiError(400, "NAME, EMAIL AND PHONE ARE REQUIRED FOR REGISTRATION");
    }

    const isTechknowMember = req.user?.clubMemberships?.includes('TECHKNOW');
    const isAdmin = req.user?.roles?.includes('ADMIN');

    if (!isTechknowMember && !isAdmin) {
        throw new ApiError(403, "ACCESS DENIED: ONLY MEMBERS OF TECHKNOW CAN REGISTER OUTSIDE STUDENTS.");
    }

    // 2. Find the Event ID based on the Name "DJ NIGHT"
    const event = await Event.findOne({ title: TARGET_EVENT });
    if (!event) {
        throw new ApiError(404, `EVENT '${TARGET_EVENT}' NOT FOUND. PLEASE CREATE THE EVENT FIRST.`);
    }

    // 3. Find or Create the User
    // Outside users don't have a firebaseUid, so we identify them by Email.
    let user = await User.findOne({ email: email.toUpperCase() });

    if (!user) {
        user = await User.create({
            name: name.toUpperCase(),
            email: email.toUpperCase(),
            phone : phone,
            roles: ["OUTSIDE_STUDENT"],
            qrCodeIdentifier: uuidv4() // Generate their unique digital ticket
        });
    }

    // 4. Check if they are already registered for this specific event
    const existingAttendance = await Attendance.findOne({ 
        user: user._id, 
        event: event._id 
    });

    if (existingAttendance) {
        throw new ApiError(400, `USER IS ALREADY REGISTERED FOR ${TARGET_EVENT}`);
    }

    // 5. Create the Attendance Record
    const attendance = await Attendance.create({
        user: user._id,
        event: event._id,
        status: "REGISTERED"
    });

    return res.status(201).json(
        new ApiResponse(201, 
            { 
                user: {
                    name: user.name,
                    email: user.email,
                    qrCodeIdentifier: user.qrCodeIdentifier 
                },
                attendanceStatus: attendance.status 
            }, 
            `OUTSIDE STUDENT REGISTERED FOR ${TARGET_EVENT} SUCCESSFULLY`
        )
    );
});

const logOutUser = asyncHandler(async (req, res) => {
    // 1. ADDED AWAIT & changed to $unset
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                accessToken: 1 // 1 tells Mongo to completely remove this field
            }
        },
        {
            new: true
        }
    );

    // 2. Ensure options match your login cookie exactly
    const options = {
        httpOnly: true,
        secure: true, 
        sameSite: "None" // Included this since it was in your login controller
    };

    // 3. Clear cookie and return success
    return res
        .status(200)
        .clearCookie("accessToken", options)
        .json(new ApiResponse(200, {}, "LOGOUT SUCCESSFUL"));
});

// Add this new controller function
const loginWithGoogle = asyncHandler(async (req, res) => {
    const { googleToken } = req.body;

    if (!googleToken) {
        throw new ApiError(400, "Google Token is Required for login");
    }

    // 1. Verify the Google Token
    const ticket = await client.verifyIdToken({
        idToken: googleToken,
        audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email } = payload; 

    // 2. Check if the user already exists
    const user = await User.findOne({ email: email.toUpperCase() });

    if (!user) {
        throw new ApiError(404, "USER NOT FOUND. PLEASE REGISTER FIRST.");
    }

    // 3. Generate Access Token
    const accessToken = user.generateAccessToken();

    // 4. Save token to DB for secure logout later
    user.accessToken = accessToken;
    await user.save({ validateBeforeSave: false });

    // 5. Fetch clean profile (excluding tokens/passwords)
    const userProfile = await User.findById(user._id).select("-accessToken -__v");

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "None"
    };

    // 6. Return both Cookie (for web) and JSON Token (for Flutter secure storage)
    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .json(
            new ApiResponse(
                200, 
                { 
                    user: userProfile, 
                    token: accessToken 
                }, 
                "USER LOGGED IN SUCCESSFULLY"
            )
        );
});


export {
    registerUser,
    registerOutsideUser,
    loginWithGoogle,
    logOutUser
}