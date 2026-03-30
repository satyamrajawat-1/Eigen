import mongoose from "mongoose";

const CLUB_NAMES = [
    'CODEBASE', 'KERNEL', 'ARC ROBOTICS', 'ALGORITHMUS', 
    'CYPHER', 'GDF', 'GFG', 'TGCC', 'TECHKNOW'
];

const eventSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true, 
        uppercase: true, // Ensures "dj night" becomes "DJ NIGHT"
        trim: true 
    },
    clubName: { 
        type: String, 
        required: true,
        enum: CLUB_NAMES
    },
    description: String,
    date: { 
        type: Date, 
        required: true 
    },
    image: {
        type: String, // Will store the Cloudinary URL or local file path
        required: true 
    },
    startTime: { 
        type: String, 
        required: true // Format: "18:00" (6 PM)
    },
    endTime: { 
        type: String, 
        required: true // Format: "22:00" (10 PM)
    },
    location: {
        type: String,
        default: "IIIT KOTA CAMPUS"
    },

    // --- NEW FIELDS FOR TEAM LOGIC ---
    participationType: {
        type: String,
        enum: ['INDIVIDUAL', 'TEAM'],
        default: 'INDIVIDUAL',
        required: true
    },
    minTeamSize: {
        type: Number,
        default: 1 // Default to 1 if it's an INDIVIDUAL event
    },
    maxTeamSize: {
        type: Number,
        default: 1 // For individual events, this remains 1
    },
    // ---------------------------------

    createdBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User' 
    }
}, { timestamps: true });

export const Event = mongoose.model("Event", eventSchema);