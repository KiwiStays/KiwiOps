import { Router } from "express";
import upload from "../middlewares/multer.js";
import { upload_voice } from "../middlewares/multer.js";

import { createProperty, deleteRoom, getAllProperties, getPropertyById, getRoomInfo, getSingleProperty, updateProperty, updateRoom } from "../controllers/PropertyController.js";

const router = Router();

router.route("/create").post(upload.fields([
  { name: "buildingPic", maxCount: 1 },
  { name: "propertyImages", maxCount: 10 }, // Adjust maxCount as needed
  { name: "staffImages", maxCount: 10 }, // Adjust maxCount as needed
]), createProperty);

router.route("/getproperty").get(getAllProperties);
router.route("/getproperty/:id").get(getSingleProperty);

router.route("/update/:id").put(upload.any(), updateProperty);
// router.route("/update/:id").put( upload.fields([
//   { name: "buildingPic", maxCount: 1 },
//   { name: "propertyImages", maxCount: 10 }, // Adjust maxCount as needed
//   { name: "staffImages", maxCount: 10 }, // Adjust maxCount as needed
// ]), updateProperty);

router.route("/building/:buildingId").get(getPropertyById);
router.route("/roominfo/:id").get(getRoomInfo);
router.route("/rooms/update/:roomId").post(upload_voice.single("voiceNote"), updateRoom);
router.route("/room/delete/:id/:propid").delete(deleteRoom);

// router.route("/export/google-sheets").post(handler);

export default router;
