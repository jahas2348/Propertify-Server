const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');

// Register User
router.post('/api/user/registerUser', userController.registerUser);

// Login User
router.post('/api/user/loginUser', userController.loginUser);
 
//Login with User Phone
router.post('/api/user/loginwithUserPhone', userController.loginwithusermobNo);

//Add Request
router.post('/api/user/addRequest', userController.addRequest);

//Add Favourite
router.post('/api/user/addFavouriteProperty', userController.addFavouriteProperty);

//Get All Payment Requests of User
router.get('/api/user/getAllPaymentRequestsofUser/:userId', userController.getAllPaymentsRequestsOfUser);

module.exports = router;
