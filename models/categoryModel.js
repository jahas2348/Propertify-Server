const mongoose = require('mongoose');
const db = require('../config/databaseConfig');

const { Schema } = mongoose;

//Category Schema
const categorySchema = new Schema({
  categoryName: {
    type: String,
    required: true,
  },
  categoryDescription: {
    type: String,
  },
  status: {
    type: Boolean,
    default: true,
  }
});

const CategoryModel = db.model('category', categorySchema);

module.exports = CategoryModel;