const multer = require("multer");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = "public/img";
    fs.mkdirSync(folder, { recursive: true });
    cb(null, folder);
  },

  filename: (req, file, cb) => {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png/;
  const extname = allowed.test(path.extname(file.originalname).toLowerCase());

  if (extname) {
    cb(null, true);
  } else {
    cb(new Error("Only images are allowed"));
  }
};

const upload = multer({ storage, fileFilter });




module.exports = { upload };
