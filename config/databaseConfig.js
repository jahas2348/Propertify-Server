const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// mongoose.connect(process.env.MONGO_URL, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })

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


  