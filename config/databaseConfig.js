const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/propertify', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('MongoDB Connected');
  })
  .catch((err) => {
    console.log('MongoDB Connection Error', err);
  });

module.exports = mongoose.connection;


  