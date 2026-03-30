import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import { User } from "../models/user.model.js";
import { Attendance } from "../models/attendance.model.js";
import { Event } from "../models/event.model.js";
import admin from "firebase-admin";
import { v4 as uuidv4 } from "uuid";
import { Team } from "../models/team.model.js";

const registerUser = asyncHandler(async(req,res)=>{
    const {firebaseToken} = req.body;
    if(!firebaseToken){
        throw new ApiError(400 , "FireBase Token is Required")
    }
    const decodedFirebase = await admin.auth().verifyIdToken(firebaseToken);
    const { uid, email, name } = decodedFirebase;

    let user = await User.findOne({ firebaseUid: uid });
    if (!user) {
        const isCollege = email.toUpperCase().endsWith("@IIITKOTA.AC.IN");
        if(!isCollege){
            throw new ApiError(400 , "Only College Student Can Registered Through This")
        }
        user = await User.create({
            firebaseUid: uid,
            email: email.toUpperCase(),
            name: name.toUpperCase(),
            roles: isCollege ? ["STUDENT"] : ["OUTSIDE_STUDENT"],
            qrCodeIdentifier: uuidv4() 
        });
    }
    let accessToken = user.generateAccessToken(user._id);
    const options = {
        httpOnly:true,
        secure:true,
        sameSite: "None"
    }
    return res.status(200).cookie("accessToken" , accessToken , options).json(new ApiResponse(200 , user , "User created Successfully"))

})

 const registerOutsideUser = asyncHandler(async (req, res) => {
    const { name, email,phone } = req.body;
    const TARGET_EVENT = "DJ NIGHT";

    // 1. Validation
    if (!name || !email || !phone) {
        throw new ApiError(400, "NAME, EMAIL AND PHONE ARE REQUIRED FOR REGISTRATION");
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



export {
    registerUser,
    registerOutsideUser,
    logOutUser
}