import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure upload directory exists
const uploadDir = process.env.UPLOAD_DIR || "uploads";
const absoluteUploadDir = path.resolve(uploadDir);

if (!fs.existsSync(absoluteUploadDir)) {
  fs.mkdirSync(absoluteUploadDir, { recursive: true });
}

// Set up storage configuration for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, absoluteUploadDir);
  },
  filename: (req, file, cb) => {
    // Unique filename: fieldname-timestamp-random.ext
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// File filter: accept only specific image types
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPEG, PNG, and WebP are allowed."), false);
  }
};

const MAX_FILE_SIZE_MB = process.env.MAX_FILE_SIZE_MB || 10;

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE_MB * 1024 * 1024,
  },
});

/**
 * Custom middleware to handle Multer errors gracefully.
 */
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: `File is too large. Maximum size is ${MAX_FILE_SIZE_MB}MB.`,
      });
    }
    return res.status(400).json({ success: false, message: err.message });
  } else if (err) {
    // Custom error from fileFilter
    return res.status(400).json({ success: false, message: err.message });
  }
  next();
};
