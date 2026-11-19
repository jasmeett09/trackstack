const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const keys = require("./keys");

cloudinary.config({
  cloud_name: keys.cloudinaryCloudName,
  api_key: keys.cloudinaryApiKey,
  api_secret: keys.cloudinaryApiSecret
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: async () => ({
    folder: "inventory_item_images",
    allowed_formats: ["jpg", "jpeg", "png", "webp"]
  })
});

const imageUpload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      const error = new Error("Only image files are allowed.");
      error.statusCode = 400;
      return cb(error);
    }

    return cb(null, true);
  }
});

module.exports = {
  cloudinary,
  imageUpload
};
