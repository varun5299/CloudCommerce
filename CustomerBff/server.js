// server.js

const express = require('express');
const { jwtValidation } = require('./middleware/jwtValidation');
const customerRoutes = require('./routes/customerRoutes');

const app = express();
const PORT = 81;

// Initialize Express middleware
app.use(express.json()); // Parse incoming JSON payloads

// Add JWT validation middleware for secured routes
app.use(jwtValidation);

// Include the customer routes
app.use(customerRoutes);

// Start the server, listening on the specified port
app.listen(PORT, () => {
  console.log(`Customer BFF service listening on port ${PORT}`);
});
