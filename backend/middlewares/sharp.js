const fs = require("fs");
const sharp = require("sharp");

module.exports = async (req, res, next) => {
  const folderName = "./images/resized";
  try {
    if (!fs.existsSync(folderName)) {
      fs.mkdirSync(folderName);
    }
  } catch (error) {
    console.log(error);
  }
  if (req.file) {
    const newFilename = req.file.filename + ".webp";
    await sharp(req.file.path)
      .resize(405, 570)
      .toFormat("webp")
      .webp({ quality: 80 })
      .toFile("./images/resized/" + newFilename);
    req.sharp = {
      imageUrl: `${req.protocol}://${req.get("host")}/images/resized/${newFilename}`,
    };
    fs.unlink(`images/${req.file.filename}`, (err) => {
      if (err) throw err;
    });
  }
  next();
};
