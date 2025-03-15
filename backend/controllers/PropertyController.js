import { PropertyModel } from "../models/Property.model.js";
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
        if(req.body.properties.length > rooms.length){
          // let size = req.body.properties.length - roomleninDb;
          
          for(let i = rooms.length; i < req.body.properties.length; i++){
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