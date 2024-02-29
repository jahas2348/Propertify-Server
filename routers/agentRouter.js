const express = require('express');
const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));

const agentController = require('../controllers/agentController');
const uploadMiddleware = require('../config/multerConfig.js');


// Register Agent
router.post('/api/agent/registerAgent', agentController.registerAgent);

// Check Agent Existence using PhoneNumber
router.post('/api/agent/checkAgentPhoneNumber', agentController.checkAgentPhoneNumber);

// Get Agent Data
router.post('/api/agent/getAgent', agentController.getExistingAgent);

// Get Request by ID
router.get('/api/agent/getRequest/:requestId', agentController.getRequestById);

// Get All Requests of An Agent
router.get('/api/agent/getAllRequestsofAgent/:agentId', agentController.getAllRequestsOfAgent);

// Get All Property Data of a Agent
router.post('/api/agent/getAllProperties', agentController.getAllPropertiesofAgent);

//Send Payment Request to User
router.post('/api/agent/PaymentRequesttoUser', agentController.sendPaymentRequest);

////Get AllProperties Info Of Agent
router.get('/api/agent/getAllPropertiesInfoOfAgent/:id', agentController.getAllPropertiesInfoOfAgent);

module.exports = router; 
