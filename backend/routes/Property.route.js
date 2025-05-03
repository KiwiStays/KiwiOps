import { Router } from "express";
import upload from "../middlewares/multer.js";
import { upload_voice } from "../middlewares/multer.js";

import { AdminPropertymaintinCreate, createProperty, deleteProperty, deleteRoom, EditSinglePropertyAdmin, getAllProperties, getAllPropertiesAdmin, getPropertyById, getRoomInfo, getSingleProperty, getSinglePropertyAdmin, updateProperty, updateRoom, UpdateSinglePropertyAdmin } from "../controllers/PropertyController.js";
import { Admin } from "mongodb";

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

// Admin side maintainence routes

router.route("/create/maintanence/property").post(upload.single("image"), AdminPropertymaintinCreate);
router.route("/get/maintanence/property").get(getAllPropertiesAdmin);
router.route("/maintain/:id").get(getSinglePropertyAdmin);
router.route("/maintain/:id").put(upload.any(),UpdateSinglePropertyAdmin);
router.route("/update/maintanence/:id").put(upload.any(),EditSinglePropertyAdmin);
router.route("/delete/maintanence/:id").delete(deleteProperty);
// router.route("/export/google-sheets").post(handler);

export default router;
