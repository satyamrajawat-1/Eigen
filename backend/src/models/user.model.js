import mongoose from "mongoose";

const CLUB_NAMES = [
    'CODEBASE', 'KERNEL', 'ARC ROBOTICS', 'ALGORITHMS', 
    'CYPHER', 'GDF', 'GFG', 'TGCC','TECHKNOW'
];

const userSchema = new mongoose.Schema({
    // Optional because Outside Students are added manually by Executives
    firebaseUid: { 
        type: String, 
        unique: true, 
        sparse: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    name: { type: String, required: true },
    phone:{type:String},
    
    // Changed to an Array to support multiple roles (e.g., Student + Member of 2 Clubs)
    roles: [{ 
        type: String, 
        enum: ['STUDENT', 'OUTSIDE_STUDENT', 'EXECUTIVE', 'CLUB_MEMBER', 'ADMIN'], 
        default: ['STUDENT'] 
    }],

    // If they are a club_member, which clubs do they belong to?
    clubMemberships: [{ 
        type: String, // e.g., ["Coding Club", "Dance Club"]
        enum:CLUB_NAMES
    }],

    // The single unique QR string generated for this person
    qrCodeIdentifier: { 
        type: String, 
        unique: true, 
        required: true // Generated for both Firebase and Manual users
    }
}, { timestamps: true });


userSchema.methods.generateAccessToken = function(){
   return jwt.sign(
        {
            _id : this._id,
            email: this.email,
            username:this.username,
            fullname:this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}


export const User = mongoose.model("User", userSchema);