import mongoose from "mongoose";

const clubMemberSchema = new mongoose.Schema({
  clubName: {
    type: String,
    required: true,
  },
  coordinatorName: {
    type: String,
    required: true,
  },
  members: [
    {
      name: {
        type: String,
        required: true,
      },
      studentId: {
        type: String,
        required: true,
      },
    },
  ],
});

module.exports = mongoose.model("clubMember", clubMemberSchema);