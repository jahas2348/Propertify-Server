const UserModel = require('../models/userModel');
const RequestModel = require('../models/requestModel');
const PaymentRequestModel = require('../models/paymentRequestModel');
const PropertyModel = require('../models/propertyModel');
const jwt = require('jsonwebtoken');
const config = require('../config/jwtConfig');
const AgentModel = require('../models/agentModel');
const bcrypt = require('bcrypt');

const dotenv = require('dotenv'); // Import dotenv
dotenv.config();
// Retrieve BASE_URL from environment variables
const BASE_URL = process.env.BASE_URL;



// Register User
const registerUser = async (req, res) => {
  const { username, userpassword, usermobNo, useremail, userprofile, status } = req.body;

  try {
    // Check if the userphone or email is already registered
    const isPhoneRegistered = await UserModel.findOne({ usermobNo });
    const isEmailRegistered = await UserModel.findOne({ useremail });

    if (isPhoneRegistered) {
      return res.status(200).json({ message: 'Phone number already registered' });
    }

    if (isEmailRegistered) {
      return res.status(200).json({ message: 'Email already registered' });
    }

    // If neither userphone nor email is registered, proceed with user registration
    const createUser = new UserModel({
      username,
      userpassword,
      usermobNo,
      useremail,
      userprofile,
      status,
    });
    const user = await createUser.save();

    // Use the secret key from config to sign the token
    const token = jwt.sign({ _id: user._id }, config.jwtSecret);

    res.json({ status: 'success', message: 'User Created Successfully', user, token });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Login User
const loginUser = async (req, res) => {
  const { username, userpassword } = req.body;

  try {
    console.log('Login request for username:', username);
    const user = await UserModel.findOne({ username });
    console.log('User found:', user);

    if (!user) {
      console.log('User not found for username:', username);
      return res.status(401).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(userpassword, user.userpassword);

    if (isMatch) {
      const token = jwt.sign({ _id: user._id }, config.jwtSecret);

      // Include user data in the response
      const userData = {
        _id: user._id,
        username: user.username,
        usermobNo: user.usermobNo,
        useremail: user.useremail,
        userprofile: user.userprofile,
        isLogin: true,
        requests: user.requests,
        favourites: user.favourites,
      };

      res.json({ status: true, message: 'Login Successful', user: userData, token });
    } else {
      res.status(401).json({ message: 'Incorrect credentials' });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const loginwithusermobNo = async (req, res) => {
  const { usermobNo } = req.body; // Only usermobNo is required

  try {
    console.log('Login request for usermobNo:', usermobNo);
    const user = await UserModel.findOne({ usermobNo }); // Find the user by usermobNo
    console.log('User found:', user);

    if (!user) {
      console.log('User not found for usermobNo:', usermobNo);
      return res.status(200).json({ message: 'You are not a User. Get started by Signing up now!' });
    }

    // Send the full user object as the response
    res.json({ status: 'success', message: 'Login Successful', user });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};




// Add Request
const addRequest = async (req, res) => {
  try {
    const { agent, user, property, requestName } = req.body;
    console.log(requestName);

    // Attempt to create the request
    const existingRequest = await RequestModel.findOne({ agent, user, property });

    if (existingRequest) {
      // Handle the case where a duplicate request is detected
      return res.status(200).json({ message: 'Request already exists\nWait for Agent Response' });
    }

    const createRequest = new RequestModel({ agent, user, property, requestName });
    const request = await createRequest.save();

    // Add the request to the user's requests array
    const userObj = await UserModel.findById(user);
    const agentObj = await AgentModel.findById(agent);
    userObj.requests.push(request._id);
    agentObj.requests.push(request._id);
    await userObj.save();
    await agentObj.save();

    res.json({ status: 'success', message: 'Request Added Successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};



// Add Favorite Property
const addFavouriteProperty = async (req, res) => {
  try {
    const { userId, propertyId } = req.body;
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.favourites.includes(propertyId)) {
      const index = user.favourites.indexOf(propertyId);
      user.favourites.splice(index, 1);
      await user.save();
      return res.status(200).json({ message: 'Property removed from favourites' });
    }

    user.favourites.push(propertyId);
    await user.save();

    return res.status(200).json({ message: 'Property added to favourites' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Check if Property is Favorite
const checkFavourite = async (req, res) => {
  try {
    const { userId, propertyId } = req.body;
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    const isFavorite = user.favourites.includes(propertyId);

    return res.status(200).json({ status: 'success', isFavorite });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};


// Function to identify a user
const identifyUser = async (socket, userId) => {
  try {
    // Perform user identification logic, e.g., check if the user exists
    const user = await UserModel.findById(userId);

    if (user) {
      // Associate the user with the socket
      socket.user = user;
      socket.join('users'); // Join a room for users
    } else {
      // Handle the case where the user does not exist, for example, by emitting an error event.
      socket.emit('userNotFound', 'User not found');
    }
  } catch (error) {
    // Handle any errors that occur during the identification process
    console.error('Error identifying user:', error);
    // You can emit an error event or take appropriate action.
  }
};

// Function to send a chat message as a user
const sendChatMessage = (socket, message) => {
  if (socket.user) {
    // Logic to send the chat message
    // For example, you can emit the message to the 'agents' room.
    io.to('agents').emit('chatMessage', { from: 'User', message });
  } else {
    // Handle the case where the user is not identified, for example, by emitting an error event.
    socket.emit('unauthorized', 'User is not identified');
  }
};

const getAllPaymentsRequestsOfUser = async (req, res) => {
  try {
    const { userId } = req.params; // Assuming you provide the user ID as a parameter

    const paymentrequests = await PaymentRequestModel.find({ user: userId })
    .populate('agent')
      .populate({
        path: 'property',
        populate: {
          path: 'propertyCategory', // Populate the propertyCategory field of property
          select: 'categoryName' // Select only the 'categoryName' field from propertyCategory
        }
      })
      .populate({
        path: 'property',
        populate: {
          path: 'agent' // Populate the 'agent' field within 'property'
        }
      });
      
    if (!paymentrequests || paymentrequests.length === 0) {
      return res.status(200).json({ status: 'success', message: 'No Payment requests found for this user', paymentrequests: [] });
    }

    // Map the request data and construct image URLs and extract the category name
    const requestsWithImageURLs = paymentrequests.map((paymentrequest) => {
      const paymentrequestData = paymentrequest.toObject();

      // Check if the property field is not null
      if (paymentrequestData.property) {
        // Extract the category name from the populated propertyCategory
        paymentrequestData.property.propertyCategory = paymentrequestData.property.propertyCategory.categoryName;

        // Construct image URLs for property
        paymentrequestData.property.propertyCoverPicture = `${BASE_URL}/public/uploads/${paymentrequestData.property.propertyCoverPicture}`;
        paymentrequestData.property.propertyGalleryPictures = paymentrequestData.property.propertyGalleryPictures.map((filename) => {
          return `${BASE_URL}/public/uploads/${filename}`;
        });
      }

      return paymentrequestData;
    });

    res.json({ status: 'success', paymentrequests: requestsWithImageURLs });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

//Paid
const markPaymentRequestPaid = async (req, res) => {
  try {
    const { paymentRequestId } = req.params;

    // Find the payment request by ID
    const paymentRequest = await PaymentRequestModel.findById(paymentRequestId);

    if (!paymentRequest) {
      return res.status(200).json({ message: 'Payment Request not found' });
    }

    // Update the isPaid status to true
    paymentRequest.isPaid = true;
    await paymentRequest.save();

    res.json({ status: 'success', message: 'Payment Paid Successful' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateUserDetails = async (req, res) => {
  try {
    const { username, useremail } = req.body;
    const { userId } = req.params;

    // Find the user by ID
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Use the updateUserDetails method from the user model
    await user.updateUserDetails({ username, useremail });

    res.json({ status: 'success', message: 'User details updated successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getFavouriteProperties = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Validate if userId is provided
    if (!userId) {
      return res.status(400).json({ status: 'error', message: 'User ID is required' });
    }

    // Retrieve the user by ID
    const user = await UserModel.findById(userId);

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    // Extract property IDs from the user's favorites array
    const propertyIds = user.favourites.map(favorite => favorite.toString());

    console.log('Successfully retrieved favorite property IDs');
    console.log(propertyIds);
    
    res.json({ status: 'success', propertyIds });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};




module.exports = {
  registerUser,
  loginUser,
  loginwithusermobNo,
  addRequest,
  addFavouriteProperty,
  checkFavourite,
  identifyUser,
  sendChatMessage,
  getAllPaymentsRequestsOfUser,
  markPaymentRequestPaid,
  updateUserDetails,
  getFavouriteProperties
  
};
