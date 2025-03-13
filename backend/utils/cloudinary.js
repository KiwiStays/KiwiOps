import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

export const uploadToCloudinary = async (localFilePath, originalname) => {
    try {
        if (!localFilePath || !fs.existsSync(localFilePath)) {
            console.error("❌ File path is missing or invalid:", localFilePath);
            return "";
        }

        // Normalize path to prevent Windows/Linux issues
        const normalizedPath = path.resolve(localFilePath).replace(/\\/g, "/");

        // ✅ Ensure originalname exists, otherwise set a default name
        const originalFileName = originalname ? originalname.split('.')[0] : `unknown_file_${uuidv4()}`;

        console.log(`🚀 Uploading file: ${normalizedPath} as ${originalFileName}`);

        // Upload to Cloudinary
        const response = await cloudinary.uploader.upload(normalizedPath, {
            resource_type: "auto",
            public_id: `property_images/${originalFileName}`,
            chunk_size: 6 * 1024 * 1024,
        });

        console.log("✅ File uploaded successfully:", response.secure_url);

        if (fs.existsSync(normalizedPath)) {
            try {
                fs.unlinkSync(normalizedPath);
                console.log("🗑️ Deleted local file:", normalizedPath);
            } catch (unlinkError) {
                console.error(`❌ Error deleting file: ${unlinkError.message}`);
            }
        } else {
            console.warn(`⚠️ File already deleted or not found: ${normalizedPath}`);
        }
        

        return response.secure_url;  // ✅ Return only the URL

    } catch (error) {
        console.error("❌ Cloudinary upload error:", error.message);

        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
            console.log("🗑️ Deleted local file due to failure:", localFilePath);
        }

        return null;
    }
};
