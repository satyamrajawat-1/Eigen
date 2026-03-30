import mongoose from "mongoose";

const teamSchema = new mongoose.Schema({
    teamName: { type: String, required: true, trim: true },
    event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
    leader: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // Array of User IDs for all members (including the leader)
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    teamSize: { type: Number, required: true }
}, { timestamps: true });

// Ensure a team name is unique within a single event
teamSchema.index({ teamName: 1, event: 1 }, { unique: true });

export const Team = mongoose.model("Team", teamSchema);