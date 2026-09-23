const path = require("path")
const sharp = require("sharp")

const svgPath = path.join(__dirname, "..", "assets", "icon.svg")
const pngPath = path.join(__dirname, "..", "assets", "icon.png")

sharp(svgPath)
  .resize(512, 512)
  .png()
  .toFile(pngPath)
  .then(() => {
    console.log("icon.png generated at", pngPath)
  })
  .catch((err) => {
    console.error("Failed to generate icon.png", err)
    process.exit(1)
  })
