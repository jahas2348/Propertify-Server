const upload = require('../config/multerConfig');

const uploadImage = (req, res) => {
  upload.single('propertyCoverPicture')(req, res, (err) => {
    if (err) {
      console.error('Error uploading the file:', err);
      return res.status(400).send('Error uploading the file.');
    }

    if (!req.file) {
      console.error('No file uploaded.');
      return res.status(400).send('No file uploaded.');
    }

    console.log('req.file:', req.file);
    res.status(200).json({ imageUrl: `public/uploads/${req.file.filename}` });
  });
};

const uploadImages = (req, res) => {
  upload.array('propertyGalleryPictures', 4)(req, res, (err) => {
    if (err) {
      console.error('Error uploading the files:', err);
      return res.status(400).send('Error uploading the files.');
    }

    if (!req.files || req.files.length === 0) {
      console.error('No files uploaded.');
      return res.status(400).send('No files uploaded.');
    }

    console.log('req.files:', req.files);
    const imageUrls = req.files.map((file) => `public/uploads/${file.filename}`);

    res.status(200).json({ imageUrls });
  });
};

module.exports = {
  uploadImage,
  uploadImages,
};
