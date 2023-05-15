const express = require('express');
const jwtValidation = require('./middleware/jwtValidation');
const customerRoutes = require('./routes/customerRoutes');
//const healthCheck = require('./routes/healthcheck')


const app = express();
const PORT = 8001;

// Initialize Express middleware
app.use(express.json()); // Parse incoming JSON payloads

// Apply the JWT validation middleware to protect the API routes
app.use(jwtValidation);

// Include the customer routes
app.use(customerRoutes);
//app.use('/', healthCheck);

app.get('/status', (req, res) => {
  res.send('OK');
});


// Start the server, listening on the specified port
app.listen(PORT, () => {
  console.log(`Customer BFF service listening on port ${PORT}`);
});
