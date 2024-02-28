const mongoose = require('mongoose');
const db = require('../config/databaseConfig');
const { Schema } = mongoose;

const propertySchema = new Schema({
  agent: {
    type: Schema.Types.ObjectId, // Updated to use Schema.Types.ObjectId
    ref: 'agent',
  },
  propertyName: {
    type: String,
  },
  propertyRooms: {
    type: String,
  },
  propertyBathrooms: {
    type: String,
  },
  propertySqft: {
    type: String,
  },
  propertyPrice: {
    type: String,
  },
  propertyCategory: {
    type: Schema.Types.ObjectId, // Use ObjectId reference for category
    ref: 'category', // Reference to the category model
  },
  propertyCity: {
    type: String,
  },
  propertyState: {
    type: String,
  },
  propertyZip: {
    type: String,
  },
  propertyCoverPicture: {
    type: String, // Use String to store the file path
  },
  propertyGalleryPictures: {
    type: [String], // Use an array of strings to store multiple file paths
  },
  propertyDescription: {
    type: String,
  },
  longitude: {
    type: String,
  },
  latitude: {
    type: String,
  },
  // amenities: [
  //   {
  //     amenityname: { type: String },
  //     amenityValue: { type: String },
  //   },
  // ],
  amenities: {
    type: [String],
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  isRejected: {
    type: Boolean,
    default: false,
  },
  isSold: {
    type: Boolean,
    default: false,
  },
  tags: {
    type: [String],
  }
});

const PropertyModel = db.model('property', propertySchema);

module.exports = PropertyModel;
