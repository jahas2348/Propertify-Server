const express = require('express');
const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

const adminController = require('../controllers/adminController');
const uploadMiddleware = require('../config/multerConfig.js');

// Add Property Data with image uploads
router.post(
  '/api/admin/addPropertyData',
  uploadMiddleware.fields([
    { name: 'propertyCoverPicture', maxCount: 1 },
    { name: 'propertyGalleryPictures', maxCount: 4 },
  ]),
  adminController.addPropertyData
);

// Get All Properties
router.get('/api/admin/getAllProperties', adminController.getAllProperties);

//Delete Property by Id
router.delete('/api/admin/deleteProperty/:propertyId', adminController.deleteProperty);

// Update Property by Id with image uploads
router.put(
  '/api/admin/updateProperty/:propertyId',
  uploadMiddleware.fields([
    { name: 'propertyCoverPicture', maxCount: 1 },
    { name: 'propertyGalleryPictures', maxCount: 6 },
  ]),
  adminController.updateProperty
); 

// Add Category
router.post('/api/admin/addCategory', adminController.addCategory);

//Approve Property
router.patch('/api/admin/approveProperty/:propertyId', adminController.approveProperty);

//Reject Property
router.patch('/api/admin/rejectProperty/:propertyId', adminController.rejectProperty);

module.exports = router;
