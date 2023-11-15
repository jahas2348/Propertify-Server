const multer = require('multer');
const path = require('path');

// Define the storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads'); // Specify the destination directory
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const currentDate = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }).replace(/[\s:,/]/g, '-'); // Generate an Indian date-time string
    const propertyname = req.body.propertyName.replace(/ /g, '-'); // Replace spaces with hyphens in property name

    // Generate a random 4-digit number to append to the filename
    const randomIdentifier = Math.floor(1000 + Math.random() * 9000);

    // Modify the filename to include the random identifier
    const filename = `${propertyname}-${currentDate}-${randomIdentifier}${ext}`; // Combine property name, date-time, and random identifier
    cb(null, filename);
  },
});

// Create a Multer instance with the storage configuration
const upload = multer({ storage: storage });

module.exports = upload;
