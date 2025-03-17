

import express from 'express';
import cors from 'cors';
import axios from 'axios';
import app from './app.js';
import dotenv from 'dotenv';
import connectDB from '../db/index.js';
import cron from 'node-cron';
import { RoomModel } from '../models/Room.model.js';


dotenv.config();

app.use(cors());



connectDB(process.env.MONGO_URI).then(()=>{
    app.listen(process.env.PORT,()=>{
        console.log(`listening on port ${process.env.PORT}`);
    });

})
.catch( (err) =>{
        console.error("Mongoose connection error ",err);
})


// Scheduled task to run at midnight (00:00)
cron.schedule("0 0 * * *", async () => {
    try {
      console.log("Running midnight room reset...");
  
      const result = await RoomModel.updateMany({}, {
        $set: {
          status: "Not Ready",
          checklist: [],
          voiceNote: "",
          missingItems: [],
          staffWhoUpdated: "",
        }
      });
  
      console.log(`Updated ${result.modifiedCount} rooms to Not Ready`);
    } catch (error) {
      console.error("Error updating rooms:", error);
    }
  });
  
  console.log("Cron job scheduled for midnight reset");





