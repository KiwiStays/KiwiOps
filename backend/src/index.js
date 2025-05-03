

import express from 'express';
import cors from 'cors';
import axios from 'axios';
import app from './app.js';
import dotenv from 'dotenv';
import connectDB from '../db/index.js';
import cron from 'node-cron';
import { RoomModel } from '../models/Room.model.js';
import { Admin } from 'mongodb';
import { AdminPropertyModel } from '../models/Adminpropert.model.js';
import moment from 'moment';


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



  cron.schedule("0 0  * * *", async () => {
    try {
      console.log("🔁 Starting maintenance stats cron job...");
  
      const properties = await AdminPropertyModel.find();
  
      for (let property of properties) {
        let pastDue = 0;
        let upcoming = 0;
        const today = moment();
  
        const instructionsLength = property.instructions?.length || 0;
        const maintenanceLength = property.maintenanceData?.length || 0;
  
        console.log(`\n🏠 Property: ${property.propertyName} (${property._id})`);
        console.log(`  🧾 Instructions: ${instructionsLength}, MaintenanceData: ${maintenanceLength}`);
  
        // If maintenanceData length is less than instructions
        if (maintenanceLength < instructionsLength) {
          const missingTasks = instructionsLength - maintenanceLength;
          console.log(`  ⚠️ Missing ${missingTasks} maintenance tasks`);
  
          // Handle missing tasks: Check if they should be past due or upcoming based on scheduledDate
          for (let i = 0; i < missingTasks; i++) {
            const scheduledDate = moment(property.schedule_date);  // Assume missing tasks follow the top-level schedule
  
            const daysDiff = scheduledDate.diff(today, "days");
            console.log(`  📅 Scheduled Date for missing task: ${scheduledDate.format("YYYY-MM-DD")}, Days from today: ${daysDiff}`);
  
            if (scheduledDate.isBefore(today, "day")) {
              pastDue++;  // Past due task
              console.log("    → 🟥 Marked as Past Due");
            } else if (daysDiff <= 7) {
              upcoming++;  // Upcoming task (within 7 days)
              console.log("    → 🟨 Marked as Upcoming");
            }
          }
        } else {
          // Process existing tasks' latest records
          for (let i = 0; i < maintenanceLength; i++) {
            const task = property.maintenanceData[i];
            const records = task.records;
            if (!records || records.length === 0) continue;
  
            const latest = records[records.length - 1];
            if (!latest.scheduledDate) continue;
  
            const scheduledDate = moment(latest.scheduledDate);
            const daysDiff = scheduledDate.diff(today, "days");
  
            console.log(`  🔍 Task ${i}: scheduledDate = ${scheduledDate.format("YYYY-MM-DD")}, days from today = ${daysDiff}`);
  
            if (scheduledDate.isBefore(today, "day")) {
              pastDue++;
              console.log("    → 🟥 Marked as Past Due");
            } else if (daysDiff <= 7) {
              upcoming++;
              console.log("    → 🟨 Marked as Upcoming");
            }
          }
        }
  
        await AdminPropertyModel.updateOne(
          { _id: property._id },
          {
            $set: {
              "stats.pastDue": pastDue,
              "stats.upcoming": upcoming,
            },
          }
        );
  
        console.log(`✅ Stats updated → Past Due: ${pastDue}, Upcoming: ${upcoming}`);
      }
  
      console.log("\n✅ All properties processed. Cron job complete.");
    } catch (err) {
      console.error("❌ Error during maintenance stats cron job:", err);
    }
  });