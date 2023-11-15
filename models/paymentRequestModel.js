const mongoose = require('mongoose');
const db = require('../config/databaseConfig');
const { Schema } = mongoose;

const ObjectId = mongoose.Types.ObjectId;

const paymentRequestSchema = new Schema({
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
  paymentAmount: {
    type: String,
  },
});

//unique compound index
paymentRequestSchema.index({ agent: 1, user: 1, property: 1 }, { unique: true });

const PaymentRequestModel = db.model('paymentRequest', paymentRequestSchema);

module.exports = PaymentRequestModel;
