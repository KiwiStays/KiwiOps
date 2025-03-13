import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./uploads")
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
});

// Enhanced Cloudinary storage for voice notes
const storage_voice = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "voice_notes", // Folder where audio files will be stored
        resource_type: "auto", // Auto-detect file type (better than "raw")
        format: (req, file) => {
            // Extract format from mimetype or use original extension
            const extension = file.mimetype.split('/')[1] || 'wav';
            return extension;
        },
        public_id: (req, file) => {
            // Generate a unique filename with timestamp
            return `voice-note-${Date.now()}`;
        },
        // Make sure files are publicly accessible
        use_filename: true,
        unique_filename: true,
        overwrite: true,
        // Add transformation for audio files if needed
        transformation: [{ quality: "auto" }]
    },
});

export const upload_voice = multer({ 
    storage: storage_voice,
    limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit for audio files
    fileFilter: (req, file, cb) => {
        // Accept only audio files
        if (file.mimetype.startsWith('audio/')) {
            cb(null, true);
        } else {
            cb(new Error('Only audio files are allowed!'), false);
        }
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

export default upload;