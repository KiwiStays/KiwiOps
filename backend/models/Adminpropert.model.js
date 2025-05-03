import mongoose from 'mongoose';
const { Schema } = mongoose;

const AdminPropertySchema = new Schema({
    propertyName: {
      type: String,
      required: [true, "Property name is required"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    imageUrl: {
      type: String,
      required: [true, "Property image is required"],
    },
    imagePublicId: {
      type: String,
    },
    schedule_date:{
      type: Date,
      required: [true, "Schedule date is required"],
    },
    instructions: {
      type: [String],
      default: [
        "AC Dry Servicing Houses_30",
        "AC Wet Servicing Houses_90",
        "Inverter Servicing Houses_180",
        "Washing Machine Servicing Houses_120",
        "Water Purifier Servicing Houses_90",
        "Geyser Servicing Houses_120",
        "Fridge Servicing Houses_120",
        "Gas Refill Servicing Houses_30",
        "Curtains Servicing Houses_30",
        "Wall paints/Wall Cracks/Seepage Servicing Houses_90",
        "Table Chair Sofa Servicing Houses_120",
        "Carpets Servicing Houses_60",
        "Polishing & Touch ups Servicing Houses_120",
        "Full House Deep clean Servicing Houses_90",
        "Pest Control Servicing Houses_120",
      ],
    },
    maintenanceData: [{
      taskIndex: {
        type: Number,
        required: true
      },
      records: [{
        instruction: {
          type: String,
          required: true,  // Match the instruction with each record
        },
        scheduledDate: Date,
        actualDate: Date,
        nextScheduledDate: Date,
        Cost:String,
        imageUrl: String,
        imagePublicId: String,
        notes: String,
        lastUpdated: {
          type: Date,
          default: Date.now,
        },
      }]
    }],
    stats: {
      pastDue: {
        type: Number,
        default: 0
      },
      upcoming: {
        type: Number,
        default: 0
      },
      completed: {
        type: Number,
        default: 0
      }
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    }
  });
  
// Update the 'updatedAt' field on save
AdminPropertySchema.pre("save", function (next) {
    this.updatedAt = Date.now();
    next();
});

export const AdminPropertyModel = mongoose.model("AdminProperty", AdminPropertySchema);