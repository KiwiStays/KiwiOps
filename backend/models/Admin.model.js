import mongoose from "mongoose";
import { Schema } from "mongoose";

const AdminSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
});

export const Adminmodel = mongoose.model("Admin", AdminSchema);