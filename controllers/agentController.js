const AgentModel = require('../models/agentModel');
const PropertyModel = require('../models/propertyModel');
const RequestModel = require('../models/requestModel');
const PaymentRequestModel = require('../models/paymentRequestModel');
const UserModel = require('../models/userModel');
const dotenv = require('dotenv'); // Import dotenv
dotenv.config();
// Retrieve BASE_URL from environment variables
const BASE_URL = process.env.BASE_URL;

// Register Agent
const registerAgent = async (req, res, next) => {
  try {
    const { email, fullname, mobNo, status } = req.body;

    const createAgent = new AgentModel({ email, fullname, mobNo, status });
    const agent = await createAgent.save();

    res.json({ status: true, message: "Agent Registered Successfully", agent });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Check Agent Phone Number
const checkAgentPhoneNumber = async (req, res) => {
  try {
    const { mobNo } = req.body;
    console.log(mobNo);

    const existingAgent = await AgentModel.findOne({ mobNo: mobNo });
    console.log(existingAgent);

    if (existingAgent) {
      res.json({ exists: true, message:'Agent Found Successfully'});
    } else {
      res.json({ exists: false });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Get Existing Agent Data
const getExistingAgent = async (req, res) => {
  try {
    const { mobNo } = req.body;
    console.log(mobNo);

    if (mobNo != null) {
      const agent = await AgentModel.findOne({ mobNo: mobNo });
      console.log(agent);
      res.json({ status: true, agent });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

// Get Request by ID
const getRequestById = async (req, res) => {
  try {
    const { requestId } = req.params;

    const request = await RequestModel.findById(requestId)
      .populate('agent')
      .populate('user')
      .populate('property');

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    res.json({ status: 'success', message: 'successful', request });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

//Get All Requests
const getAllRequestsOfAgent = async (req, res) => {
  try {
    const { agentId } = req.params; // Assuming you provide the agent ID as a parameter

    const requests = await RequestModel.find({ agent: agentId })
      .populate({
        path: 'property',
        populate: { path: 'propertyCategory' }, // Populate the propertyCategory field of property
      })
      .populate('user');

    if (!requests || requests.length === 0) {
      return res.status(404).json({ message: 'No requests found for this agent' });
    }

    // Map the request data and construct image URLs and extract the category name
    const requestsWithImageURLs = requests.map((request) => {
      const requestData = request.toObject();

      // Check if the property field is not null
      if (requestData.property) {
        // Extract the category name from the populated propertyCategory
        requestData.property.propertyCategory = requestData.property.propertyCategory.categoryName;

        // Construct image URLs for property
        requestData.property.propertyCoverPicture = `${BASE_URL}/public/uploads/${requestData.property.propertyCoverPicture}`;
        requestData.property.propertyGalleryPictures = requestData.property.propertyGalleryPictures.map((filename) => {
          return `${BASE_URL}/public/uploads/${filename}`;
        });
      }

      return requestData;
    });

    res.json({ status: 'success', requests: requestsWithImageURLs });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};



const getAllPropertiesofAgent = async (req, res) => {
  try {
    const { agent } = req.body;

    if (agent) {
      const allProperties = await PropertyModel.find({ agent }).populate('propertyCategory');

      // Map the property data and construct image URLs
      const propertiesWithImageURLs = allProperties.map((property) => {
        const propertyData = property.toObject();
        
        // Extract the categoryName from the populated propertyCategory
        propertyData.propertyCategory = property.propertyCategory.categoryName;
        

        propertyData.propertyCoverPicture = `${BASE_URL}/public/uploads/${property.propertyCoverPicture}`;
        propertyData.propertyGalleryPictures = propertyData.propertyGalleryPictures.map((filename) => {
          return `${BASE_URL}/public/uploads/${filename}`;
        });

        return propertyData;
      });

      res.json({ status: 'success', properties: propertiesWithImageURLs });
    } else {
      res.json({ status: 'success', properties: [] });
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ status: 'error', message: 'Internal Server Error' });
  }
};



const identifyAgent = async (socket, agentId) => {
  try {
    // Perform agent identification logic, e.g., check if the agent exists
    const agent = await AgentModel.findById(agentId);

    if (agent) {
      // Associate the agent with the socket
      socket.agent = agent;
      socket.join('agents'); // Join a room for agents
    } else {
      // Handle the case where the agent does not exist, for example, by emitting an error event.
      socket.emit('agentNotFound', 'Agent not found');
    }
  } catch (error) {
    // Handle any errors that occur during the identification process
    console.error('Error identifying agent:', error);
    // You can emit an error event or take appropriate action.
  }
};

// Function to send a chat message as an agent
const sendChatMessage = (socket, message) => {
  if (socket.agent) {
    // Logic to send the chat message
    // For example, you can emit the message to the 'users' room.
    io.to('users').emit('chatMessage', { from: 'Agent', message });
  } else {
    // Handle the case where the agent is not identified, for example, by emitting an error event.
    socket.emit('unauthorized', 'Agent is not identified');
  }
};

// Add Request
const sendPaymentRequest = async (req, res) => {
  try {
    const { agent, user, property, paymentAmount } = req.body;
    console.log(paymentAmount);

    // Attempt to create the request
    const existingPaymentRequest = await PaymentRequestModel.findOne({ agent, user, property });

    if (existingPaymentRequest) {
      // Handle the case where a duplicate request is detected
      return res.status(200).json({ message: 'Payment Request already exists' });
    }

    const createPaymentRequest = new PaymentRequestModel({ agent, user, property, paymentAmount });
    const request = await createPaymentRequest.save();

    // Add the request to the user's requests array
    const userObj = await UserModel.findById(user);
    // const agentObj = await AgentModel.findById(agent);
    userObj.paymentRequests.push(request._id);
    // agentObj.requests.push(request._id);
    await userObj.save();
    // await agentObj.save();

    res.json({ status: 'success', message: 'Request Added Successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};



module.exports = {
  registerAgent,
  checkAgentPhoneNumber,
  getExistingAgent,
  getRequestById,
  getAllRequestsOfAgent,
  getAllPropertiesofAgent,
  identifyAgent,
  sendChatMessage,
  sendPaymentRequest,
};
 