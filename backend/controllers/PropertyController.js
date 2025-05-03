import { PropertyModel } from "../models/Property.model.js";
import { AdminPropertyModel } from "../models/Adminpropert.model.js";
import { RoomModel } from "../models/Room.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import fs from "fs";
import path from "path";

const uploadFiles = async (fileArray) => {
  return await Promise.all(
    fileArray.map(async (file) => file?.path ? await uploadToCloudinary(file.path, file.originalname) : "")
  );
};

export const createProperty = async (req, res) => {
  try {
    // ✅ Extract files safely
    const buildingPicFile = req.files["buildingPic"]?.[0] || null;
    const propertyImageFiles = req.files["propertyImages"] || [];
    const staffImageFiles = req.files["staffImages"] || [];

    console.log("🏗️ Building Pic:", buildingPicFile?.path);
    console.log("🏠 Property Images:", propertyImageFiles.map(file => file.path));
    console.log("👤 Staff Images:", staffImageFiles.map(file => file.path));

    // ✅ Upload images to Cloudinary
    const buildingPic = buildingPicFile ? await uploadToCloudinary(buildingPicFile.path, buildingPicFile.originalname) : "";
    const propertyImages = await uploadFiles(propertyImageFiles);
    const staffImages = await uploadFiles(staffImageFiles);

    // ✅ Parse `properties` and `staff` from JSON
    const properties = JSON.parse(req.body.properties || "[]");
    properties.forEach((property, index) => {
      property.image = propertyImages[index] || "";
    });

    // console.log("properties:", properties);

    const staff = JSON.parse(req.body.staff || "[]");
    staff.forEach((staffMember, index) => {
      staffMember.profileImg = staffImages[index] || "";
    });

    // ✅ Extract text fields
    const { propertyName, buildingName } = req.body;
    if (!propertyName || !buildingName) {
      return res.status(400).json({ message: "propertyName and buildingName are required." });
    }

    // ✅ Save property to MongoDB
    const newProperty = new PropertyModel({
      placeName: propertyName,
      buildingName,
      buildingPic,
      properties,
      staff,
    });

    await newProperty.save();

    // ✅ Transform properties to match RoomSchema
    const roomsToInsert = properties.map(property => ({
      buildingId: newProperty._id,
      roomNum: property.houseNumber,
      roomName: property.houseName,
      roomImage: property.image,
      checklist: [],
      staff,
      voiceNote: '',
      staffWhoUpdated: ''
    }));

    // ✅ Insert multiple rooms at once
    const insertedRooms = await RoomModel.insertMany(roomsToInsert);

    // ✅ Send a single response with all created data
    res.status(201).json({
      message: "Property and rooms added successfully",
      property: newProperty,
      rooms: insertedRooms
    });

  } catch (error) {
    console.error("❌ Error creating property:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};


export const getAllProperties = async (req, res) => {
  try {
    const properties = await PropertyModel.find();
    res.status(200).json({ properties });

  } catch (err) {
    console.error("❌ Error getting properties:", error);
  }

};


export const getPropertyById = async (req, res) => {
  try {
    const { buildingId } = req.params; // Extract buildingId from request params

    const rooms = await RoomModel.find({ buildingId }); // ✅ Fetch all rooms with the same buildingId

    if (!rooms.length) {
      return res.status(404).json({ message: "No rooms found for this building" });
    }
    console.log("🚪 Rooms found:", rooms);
    res.status(200).json({ rooms }); // Return the array of rooms
  } catch (error) {
    console.error("❌ Error fetching rooms:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


export const getRoomInfo = async (req, res) => {
  try {
    const { id } = req.params; // Extract room id from request params
    const room = await RoomModel.findById(id); // ✅ Fetch room by id

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.status(200).json({ room }); // Return the room object
  } catch (error) {
    console.error("❌ Error fetching room:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateRoom = async (req, res) => {
  console.log("req body", req.body);
  console.log("req file", req.file);
  try {
    const { roomId } = req.params; // Extract room ID from URL

    const {
      active,
      roomNum,
      roomName,
      roomImage,
      checklist,
      staff,
      staffWhoUpdated,
      notes,
      allChecklistItems: receivedAllChecklistItems,
    } = req.body;

    // ✅ Parse JSON fields (since they were sent as strings)
    const parsedChecklist = checklist ? JSON.parse(checklist) : [];
    const parsedStaff = staff ? JSON.parse(staff) : [];

    // ✅ Get the status based on checklist
    const allChecklistItems = receivedAllChecklistItems
      ? JSON.parse(receivedAllChecklistItems)
      : ["Bed Setup", "Coffee Machine", "Utensils", "WiFi Card"];
    let status = "Not Ready";
    let missingItems = [...allChecklistItems];

    if (parsedChecklist.length > 0) {
      missingItems = allChecklistItems.filter(item => !parsedChecklist.includes(item));
      status = parsedChecklist.length === allChecklistItems.length ? "Ready" : "Attention Required";
    }

    // ✅ Handle voice note URL from Cloudinary
    let voiceNoteUrl;
    if (req.file) {
      // Cloudinary returns the URL in the path property
      voiceNoteUrl = req.file.path;

      // If using newer versions of multer-storage-cloudinary, the URL might be in secure_url
      if (req.file.secure_url) {
        voiceNoteUrl = req.file.secure_url;
      }
    }

    // ✅ Find and update the room
    const updatedRoom = await RoomModel.findByIdAndUpdate(
      roomId,
      {
        active,
        roomNum,
        roomName,
        roomImage,
        checklist: parsedChecklist,
        staff: parsedStaff,
        staffWhoUpdated,
        notes,
        status, // Add the calculated status
        missingItems, // Add missing items
        ...(voiceNoteUrl && { voiceNote: voiceNoteUrl }), // Only update if a new voice note is uploaded
        updatedAt: new Date(),
      },
      { new: true } // Return updated document
    );

    if (!updatedRoom) {
      return res.status(404).json({ error: "Room not found" });
    }

    res.status(200).json({
      message: "Room updated successfully",
      room: updatedRoom,
      voiceNoteUrl: updatedRoom.voiceNote // Include the voice note URL in the response
    });
  } catch (error) {
    console.error("❌ Error updating room:", error);
    res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
};


export const getSingleProperty = async (req, res) => {
  const { id } = req.params;
  try {
    const property = await PropertyModel.findById(id);
    res.status(200).json({ property });

  } catch (err) {
    console.error("❌ Error getting properties:", err);
  }
};

export const updateProperty = async (req, res) => {
  try {
    const { id } = req.params;
    const { propertyName, buildingName, propertyCount, properties, staff } = req.body;

    console.log("📝 Received Request Body:", req.body);
    console.log("📁 Received Request Files:", req.files);

    // 🏠 Fetch existing property
    const existingProperty = await PropertyModel.findById(id);
    if (!existingProperty) {
      return res.status(404).json({ message: "Property not found." });
    }
    // let roomleninDb = 0;
    console.log("new propertiese length", req.body.properties.length);

    const getRooms = async (id) => {
      try {
        const rooms = await RoomModel.find({ buildingId: id }); // ✅ Waits for the query to resolve
        // console.log("🚪 Rooms found:", rooms);
        console.log("Number of rooms found:", rooms.length); // ✅ Now it will return the correct count
        if (req.body.properties.length > rooms.length) {
          // let size = req.body.properties.length - roomleninDb;

          for (let i = rooms.length; i < req.body.properties.length; i++) {
            const room = req.body.properties[i];
            console.log(`🏠 new Rooms index ${i}`, room);
            const newRoom = new RoomModel({
              buildingId: id,
              roomNum: room.houseNumber,
              roomName: room.houseName,
              roomImage: room.image,
              checklist: [],
              staff,
              voiceNote: '',
              staffWhoUpdated: ''
            });
            await newRoom.save();
          }



        }

      } catch (error) {
        console.error("Error finding rooms:", error);
      }
    };




    // const rooms = RoomModel.find({ buildingId: id });
    // console.log("🚪 Rooms found:", rooms);
    // console.log("Number of rooms found:", rooms.length);  

    // Update basic details
    existingProperty.placeName = propertyName;
    existingProperty.buildingName = buildingName;
    existingProperty.propertyCount = propertyCount;

    // Handle buildingPic
    const buildingPicFile = req.files.find(file => file.fieldname === "buildingPic");
    if (buildingPicFile) {
      const buildingPicUrl = await uploadToCloudinary(buildingPicFile.path, buildingPicFile.originalname);
      existingProperty.buildingPic = buildingPicUrl || "";
    } else if (req.body.buildingPicUrl) {
      existingProperty.buildingPic = req.body.buildingPicUrl; // Persist existing URL
    }

    // console.log("hello.........");

    // Handle properties
    if (properties) {
      const propertyImages = req.files.filter(file => file.fieldname === "propertyImages");
      let propertyImageIndex = 0;

      for (let i = 0; i < properties.length; i++) {
        const property = properties[i];

        // Upload to cloudinary only in case of empty imageUrls
        if (property.imageUrl?.includes("cloudinary")) {
          property.image = property.imageUrl; // Persist existing URL
        }
        else {
          const cloudinaryUrl = await uploadToCloudinary(propertyImages[propertyImageIndex].path, propertyImages[propertyImageIndex].originalname);
          property.image = cloudinaryUrl || property.imageUrl; // Use new URL or fallback to existing
          propertyImageIndex++;
        }
      }
      existingProperty.properties = properties;
    }

    // Handle staff
    if (staff) {
      const staffImages = req.files.filter(file => file.fieldname === "staffImages");
      let staffImageIndex = 0;

      for (let i = 0; i < staff.length; i++) {
        const staffMember = staff[i];

        if (staffMember.profileImgUrl?.includes("cloudinary")) {
          staffMember.profileImg = staffMember.profileImgUrl; // Persist existing URL
        }
        else {
          const cloudinaryUrl = await uploadToCloudinary(staffImages[staffImageIndex].path, staffImages[staffImageIndex].originalname);
          staffMember.profileImg = cloudinaryUrl || staffMember.profileImgUrl; // Use new URL or fallback to existing
          staffImageIndex++;
        }

        // Use existing profile image URL if no new file is provided
        // if (staffImages[staffImageIndex]) {
        //   const cloudinaryUrl = await uploadToCloudinary(staffImages[staffImageIndex].path, staffImages[staffImageIndex].originalname);
        //   staffMember.profileImg = cloudinaryUrl || staffMember.profileImgUrl; // Use new URL or fallback to existing
        //   staffImageIndex++;
        // } else {
        //   staffMember.profileImg = staffMember.profileImgUrl; // Persist existing URL
        // }
      }
      existingProperty.staff = staff;
    }

    getRooms(id);

    await RoomModel.updateMany(
      { buildingId: id },
      { $set: { staff } } // Replaces the staff array with the new one
    );

    // Save the updated property
    await existingProperty.save();

    console.log("🏠 Updated Property:", existingProperty);
    res.status(200).json({ message: "Property updated successfully.", property: existingProperty });

  } catch (error) {
    console.error("❌ Error updating property:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};


export const deleteRoom = async (req, res) => {
  try {
    const { id, propid } = req.params; // Extract room ID from URL
    console.log("🚪 Room ID to delete:", id);
    console.log("🏠 Property ID to delete from:", propid);

    // ✅ Find and delete the room
    const deletedRoom = await RoomModel.findByIdAndDelete(id);
    if (!deletedRoom) {
      return res.status(404).json({ error: "Room not found" });
    }

    // ✅ Find and update the property to remove the room
    const updatedProperty = await PropertyModel.findByIdAndUpdate(
      propid,
      { $pull: { properties: { houseNumber: deletedRoom.roomNum } } },
      { new: true }
    );

    if (!updatedProperty) {
      return res.status(404).json({ error: "Property not found" });
    }

    res.status(200).json({
      message: "Room deleted successfully",
      room: deletedRoom,
      property: updatedProperty
    });
  } catch (error) {
    console.error("❌ Error deleting room:", error);
    res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
};


export const AdminPropertymaintinCreate = async (req, res) => {
  try {
    // Extract form data
    const { propertyName, location } = req.body
    console.log("req body : ", req.body);
    console.log("req file : ", req.file);

    // Parse instructions from form data (they'll come as a JSON string)
    let instructions = []
    if (req.body.instructions) {
      try {
        instructions = JSON.parse(req.body.instructions)
      } catch (err) {
        console.error("Error parsing instructions:", err)
        return res.status(400).json({ error: "Invalid instructions format" })
      }
    }

    // Validate required fields
    if (!propertyName || !location) {
      return res.status(400).json({ error: "Property name and location are required" })
    }

    // Ensure image was uploaded
    if (!req.file) {
      return res.status(400).json({ error: "Property image is required" })
    }

    const imageurl = req.file.path ? await uploadToCloudinary(req.file.path, req.file.originalname) : ""
    const imagePublicId = req.file.filename ? req.file.filename : ""

    // Create new property document
    const newProperty = new AdminPropertyModel({
      propertyName,
      location,
      imageUrl: imageurl, // Cloudinary URL
      imagePublicId: imagePublicId, // Cloudinary public_id
      schedule_date: req.body.schedule_date,
      instructions,
    })

    // Save to database
    await newProperty.save()

    // Return success response
    res.status(201).json({
      success: true,
      message: "Property created successfully",
      property: newProperty,
    })
  } catch (error) {
    console.error("Error creating property:", error)
    res.status(500).json({ error: "Server error", details: error.message })
  }
};



export const getAllPropertiesAdmin = async (req, res) => {
  try {
    const properties = await AdminPropertyModel.find()
    res.status(200).json({ properties })
    // console.log("properties:", properties);   
  } catch (err) {
    console.error("❌ Error getting properties:", err);
    res.status(500).json({ error: "Server error", details: err.message })
  }

};


export const getSinglePropertyAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const property = await AdminPropertyModel.findById(id);
    if (!property) {
      return res.status(404).json({ message: "Property not found." });
    }
    return res.status(200).json({ property });
  }
  catch (err) {
    console.error("eerror getting properties:", err);
    res.status(500).json({ error: "Server error", details: err.message })
  }
};

// export const UpdateSinglePropertyAdmin = async (req, res) => {
//   try {
//     const { id } = req.params;

//     console.log("req body:", req.body);
//     console.log("req files:", req.files);

//   //   // Parse JSON fields
//     const stats = JSON.parse(req.body.stats || '{}');
//     const maintenanceData = JSON.parse(req.body.maintenanceData || '[]');

//     const filesMap = {};
//     if (Array.isArray(req.files)) {
//       req.files.forEach(file => {
//         filesMap[file.fieldname] = file;
//       });
//     }

//     // Process each record and upload images if fileKey is present
//     const updatedMaintenanceData = await Promise.all(
//       maintenanceData.map(async (item) => {
//         const updatedRecords = await Promise.all(
//           item.records.map(async (record, recordIndex) => {
//             console.log("record:", record);
//             console.log("recordIndex:", recordIndex);

//             const instruction = record?.instruction || '';  
//             const notes = record?.notes || '';  
//             console.log("notes : ",notes);

//             if ( filesMap[record.fileKey]) {
//               const file = filesMap[record.fileKey];
//               const result = await uploadToCloudinary(file.path, 'property_images');




//               return {
//                 ...record,
//                 instruction, // Add instruction to each record
//                 imageUrl: result.secure_url,
//                 imagePublicId: result.public_id,
//               };
//             }

//             return {
//               ...record,
//               instruction, // Add instruction to each record
//             };
//           })
//         );
//         return {
//           ...item,
//           records: updatedRecords,
//         };
//       })
//     );
//     console.log("Updated Maintenance Data:", updatedMaintenanceData);
//     // Update the property
//     const updatedProperty = await AdminPropertyModel.findByIdAndUpdate(
//       id,
//       {
//         stats,
//         maintenanceData: updatedMaintenanceData,
//       },
//       { new: true }
//     );

//     if (!updatedProperty) {
//       return res.status(404).json({ error: 'Property not found' });
//     }

//     res.status(200).json({
//       message: 'Property maintenance data updated successfully',
//       property: updatedProperty,
//       wasUpdated: true,
//     });

//   } catch (err) {
//     console.error('Update error:', err);
//     res.status(500).json({ error: 'Server error', wasUpdated: false });
//   }
// };
// export const UpdateSinglePropertyAdmin = async (req, res) => {
//   try {
//     const { id } = req.params;

//     console.log("req body:", req.body);
//     console.log("req files:", req.files);

//     // Parse JSON fields
//     const stats = JSON.parse(req.body.stats || '{}');
//     let maintenanceData = JSON.parse(req.body.maintenanceData || '[]');

//     // Create a map of files by fieldname
//     const filesMap = {};
//     if (req.files && Array.isArray(req.files)) {
//       req.files.forEach(file => {
//         filesMap[file.fieldname] = file;
//       });
//     }

//     // Add taskIndex to each item in maintenanceData
//     for (let i = 0; i < maintenanceData.length; i++) {
//       maintenanceData[i].taskIndex = i; // Add taskIndex as required by your schema

//       for (let j = 0; j < maintenanceData[i].records.length; j++) {
//         const record = maintenanceData[i].records[j];
//         console.log(`Processing [${i}][${j}]: ${record.instruction}`);
//         console.log("notes : ",record.notes);

//         // Check if this record has a fileKey and if there's a corresponding file
//         if (record.fileKey && filesMap[record.fileKey]) {
//           const file = filesMap[record.fileKey];
//           console.log(`Found file for ${record.fileKey}:`, file.originalname);

//           try {
//             // Upload to cloudinary
//             const filePath = file.path;
//             const result = await uploadToCloudinary(filePath, 'property_images');

//             // Use the result directly as URL
//             if (result) {
//               console.log(`Upload success for ${record.fileKey}:`, result);

//               // Update the record directly in the array
//               maintenanceData[i].records[j] = {
//                 ...record,
//                 imageUrl: result,  // Use the URL string directly
//                 imagePublicId: ''  // Leave blank or generate from URL if needed
//               };

//               console.log(`Updated record [${i}][${j}] with imageUrl:`, maintenanceData[i].records[j].imageUrl);
//             } else {
//               console.error("Upload failed or returned empty result");
//             }
//           } catch (uploadError) {
//             console.error(`Error uploading file ${record.fileKey}:`, uploadError);
//           }
//         }
//       }
//     }

//     // Update the property in the database without validation
//     // to bypass schema validation temporarily 
//     const updatedProperty = await AdminPropertyModel.findByIdAndUpdate(
//       id,
//       {
//         stats,
//         maintenanceData: maintenanceData,
//       },
//       { new: true, runValidators: false }
//     );

//     if (!updatedProperty) {
//       return res.status(404).json({ error: 'Property not found' });
//     }

//     res.status(200).json({
//       message: 'Property maintenance data updated successfully',
//       property: updatedProperty,
//       wasUpdated: true
//     });

//   } catch (err) {
//     console.error('Update error:', err);
//     res.status(500).json({ 
//       error: 'Server error', 
//       details: err.message, 
//       wasUpdated: false 
//     });
//   }
// };
export const UpdateSinglePropertyAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    // console.log("req body:", req.body);
    // try {
    //   const parsedBody = JSON.parse(req.body.maintenanceData || '{}');
    //   console.dir(parsedBody, { depth: null, colors: true });
    // } catch (e) {
    //   console.log("req.body is not a stringified JSON:", req.body);
    // }
    // console.log("req files:", req.files);

    // Parse JSON fields
    const stats = JSON.parse(req.body.stats || '{}');
    let maintenanceData = JSON.parse(req.body.maintenanceData || '[]');

    // Create a map of files by fieldname
    const filesMap = {};
    if (req.files && Array.isArray(req.files)) {
      req.files.forEach(file => {
        filesMap[file.fieldname] = file;
      });
    }

    // Deep clone the maintenanceData to avoid reference issues
    const updatedMaintenanceData = JSON.parse(JSON.stringify(maintenanceData));

    // Process each maintenance task and its records
    for (let i = 0; i < updatedMaintenanceData.length; i++) {
      updatedMaintenanceData[i].taskIndex = i;

      // Process each record within the task
      for (let j = 0; j < updatedMaintenanceData[i].records.length; j++) {
        const record = updatedMaintenanceData[i].records[j];
        console.log(`Processing [${i}][${j}]: ${record.instruction}`);
        console.log("notes : ", record.notes);

        // Skip if no file to process for this record
        if (!record.fileKey || !filesMap[record.fileKey]) {
          continue;
        }

        const file = filesMap[record.fileKey];
        console.log(`Found file for ${record.fileKey}:`, file.originalname);

        try {
          // Upload to cloudinary with a unique identifier
          const filePath = file.path;
          const imageUrl = await uploadToCloudinary(filePath, 'property_images');

          if (imageUrl) {
            console.log(`Upload success for ${record.fileKey}:`, imageUrl);

            // Safely extract the public ID from the URL
            const urlParts = imageUrl.split('/');
            const filenameParts = urlParts[urlParts.length - 1].split('.');
            const publicId = filenameParts[0];

            // Create a new record object to avoid reference issues
            updatedMaintenanceData[i].records[j] = {
              ...record,
              imageUrl: imageUrl,
              imagePublicId: publicId
            };

            console.log(`Updated record [${i}][${j}] with imageUrl:`, imageUrl);

            // Double check the update took effect
            console.log(`Verification - Updated imageUrl:`, updatedMaintenanceData[i].records[j].imageUrl);
          } else {
            console.error(`Upload failed for ${record.fileKey}`);
          }
        } catch (uploadError) {
          console.error(`Error uploading file ${record.fileKey}:`, uploadError);
        }
      }
    }

    // Additional verification before database update
    console.log(`Final check before database update:`);
    for (let i = 0; i < updatedMaintenanceData.length; i++) {
      for (let j = 0; j < updatedMaintenanceData[i].records.length; j++) {
        if (updatedMaintenanceData[i].records[j].imageUrl) {
          console.log(`Task ${i}, Record ${j}: ${updatedMaintenanceData[i].records[j].imageUrl}`);
        }
      }
    }

    // Update the property in the database with the completely updated data
    const updatedProperty = await AdminPropertyModel.findByIdAndUpdate(
      id,
      {
        stats,
        maintenanceData: updatedMaintenanceData,
        lastUpdated: new Date()
      },
      { new: true, runValidators: false }
    );

    if (!updatedProperty) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // Verify the data after database update
    console.log(`Database update verification - first few records:`);
    for (let i = 0; i < Math.min(updatedProperty.maintenanceData.length, 3); i++) {
      for (let j = 0; j < Math.min(updatedProperty.maintenanceData[i].records.length, 2); j++) {
        if (updatedProperty.maintenanceData[i].records[j].imageUrl) {
          console.log(`DB Task ${i}, Record ${j}: ${updatedProperty.maintenanceData[i].records[j].imageUrl}`);
        }
      }
    }

    res.status(200).json({
      message: 'Property maintenance data updated successfully',
      property: updatedProperty,
      wasUpdated: true
    });

  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({
      error: 'Server error',
      details: err.message,
      wasUpdated: false
    });
  }
};



export const EditSinglePropertyAdmin = async (req, res) => {
  try{
    const {id} = req.params;
    // console.log("id: ", id)
    // const {propertyName, location , schedule_date, instructions} = req.body;
    console.log("req body : ", req.body.instructions);
    // console.log("req file : ", req.file);


    const property = await AdminPropertyModel.findById(id);
    if(!property){
      return res.status(404).json({message: "Property not found."});
    }
    // console.log("found property : ", property);
    console.log("instruction : ", property?.instructions);
    const len = property?.instructions?.length;
    console.log("len : ", len);
    const len2 = req.body.instructions.length;
    console.log("len2 : ", len2);

    // Parse the stringified JSON from req.body.instructions to get the array of strings
    try {
      property.instructions = JSON.parse(req.body.instructions);
      // Verify that we have an array after parsing
      if (!Array.isArray(property.instructions)) {
        property.instructions = [req.body.instructions]; // Convert to array if not already
      }
    } catch (parseError) {
      // If parsing fails, treat it as a single instruction string
      property.instructions = [req.body.instructions];
    }
    
    // Save the updated property
    const updatedProperty = await property.save();
    
    // Send success response
    res.status(200).json({
      success: true,
      message: "Property instructions updated successfully",
      property: updatedProperty
    });

  }
  catch(err){
    console.error("error getting properties:", err);
    res.status(500).json({ error: "Server error", details: err.message })
  }
};

export const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params; // Extract property ID from URL

    // Find and delete the property
    const deletedProperty = await AdminPropertyModel.findByIdAndDelete(id);
    if (!deletedProperty) {
      return res.status(404).json({ error: "Property not found" });
    }

  

    res.status(200).json({
      message: "Property and associated rooms deleted successfully",
      property: deletedProperty,
    });
  } catch (error) {
    console.error("❌ Error deleting property:", error);
    res.status(500).json({ error: "Internal Server Error", message: error.message });
  }
};