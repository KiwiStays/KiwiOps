import mongoose from 'mongoose';
import { Schema } from 'mongoose';


const PropertySchema = new Schema({
    placeName: { type: String , trim: true},
    buildingName: { type: String, trim: true },
    buildingPic: { type: String,trim: true }, // URL after uploading to Cloudinary
    propertyCount: { type: Number, default: 0 },
    properties: [
      {
        houseNumber: String,
        houseName: String,
        image: String, 
      },
    ],
    staff: [
      {
        name: String,
        profileImg: String, 
      },
    ],
}, { timestamps: true });

export const PropertyModel = mongoose.model('Property', PropertySchema);
