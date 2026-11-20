import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
    return;
  }

  const error = new Error("Only image files are allowed");
  error.status = 400;
  cb(error);
};

const uploadFiles = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 10,
  },
}).array("files", 10);

export default uploadFiles;
