const app = require('./app');
const port = process.env.PORT || 3000; // Use the PORT environment variable or default to 3000

app.listen(port, () => {
  console.log(`Server Listening on Port http://127.0.0.1:${port}`);
});
