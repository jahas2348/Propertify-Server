const mongoose = require('mongoose');
const db = require('../config/databaseConfig');
const { Schema } = mongoose;

const ObjectId = mongoose.Types.ObjectId;

const requestSchema = new Schema({
  agent: {
    type: ObjectId,
    ref: 'agent',
  },
  user: {
    type: ObjectId,
    ref: 'user',
  },
  property: {
    type: ObjectId,
    ref: 'property',
  },
  requestName: {
    type: String,
  },
});

//unique compound index
requestSchema.index({ agent: 1, user: 1, property: 1 }, { unique: true });

const RequestModel = db.model('request', requestSchema);

module.exports = RequestModel;
