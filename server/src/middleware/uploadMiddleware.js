const multer = require("multer");

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Use memory storage since we only need the buffer for pdf-parse
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "Only PDF files are allowed"));
  }
};

const MAX_BULK_FILES = 10;

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

// Same storage/filter/size rules, but accepts up to MAX_BULK_FILES files
// under the "resumes" field — used for recruiter bulk resume analysis.
const uploadBulk = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE, files: MAX_BULK_FILES },
});

module.exports = upload;
module.exports.uploadBulk = uploadBulk;
module.exports.MAX_BULK_FILES = MAX_BULK_FILES;
