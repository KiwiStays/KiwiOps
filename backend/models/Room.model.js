import mongoose from "mongoose";
import { Schema } from "mongoose";

const RoomSchema = new Schema({
  
  buildingId: { type: mongoose.Schema.Types.ObjectId, ref: "Property", required: true },
  roomNum: { type: String, trim: true },
  roomName: { type: String, trim: true },
  roomImage: { type: String, trim: true },
  checklist: [String],
  // Add status field (optional, as it can be derived from checklist)
  status: { 
      type: String, 
      enum: ["Ready", "Not Ready", "Attention Required"],
      default: "Not Ready"
  },
  voiceNote: { type: String }, // URL to stored audio file
  missingItems: [String], // Store missing items for quick reference
  updatedAt: { type: Date, default: Date.now },
  staff: [
      {
          name: String,
          profileImg: String, 
      },
  ],
  staffWhoUpdated: {
      type: String,
      default: '',
  }
}, { timestamps: true });

export const RoomModel = mongoose.model('Room', RoomSchema);
