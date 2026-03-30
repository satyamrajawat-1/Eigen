import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    event: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Event', 
        required: true 
    },
    
    // Track current state for THIS specific event
    status: { 
        type: String, 
        enum: ['REGISTERED', 'IN', 'OUT'], 
        default: 'REGISTERED' 
    },

    // History of every time they scanned for this event
    scanHistory: [{
        type: { type: String, enum: ['IN', 'OUT'] },
        timestamp: { type: Date, default: Date.now },
        scannedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // The Executive
    }]
}, { timestamps: true });

// Ensure a user can only have ONE attendance document per event
attendanceSchema.index({ user: 1, event: 1 }, { unique: true });

export const Attendance = mongoose.model("Attendance", attendanceSchema);