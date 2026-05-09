import fs from "node:fs";
import path from "node:path";
import multer from "multer";

const uploadsDir = path.resolve("uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  }
});

const imageFileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    const error = new Error("Only image files are allowed");
    error.statusCode = 400;
    cb(error);
    return;
  }
  cb(null, true);
};

export const uploadImage = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }
});
