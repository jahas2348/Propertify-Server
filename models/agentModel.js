const mongoose = require('mongoose');
const db = require('../config/databaseConfig');

const { Schema } = mongoose;

const ObjectId = mongoose.Types.ObjectId;


//Agent Schema
const agentSchema = new Schema({
  email: {
    type: String,
    lowercase: true,
    required: true,

  },
  fullname: {
    type: String,
    required: true
  },
  mobNo: {
    type: String,
    required: true
  },

  status: {
    type: Boolean,
    default: false,
  },
  requests: [
    {
      type: ObjectId,
      ref: 'request',
    },
  ],
});



const AgentModel = db.model('agent', agentSchema);

module.exports = AgentModel;