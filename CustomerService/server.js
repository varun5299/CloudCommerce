const express = require('express');
const customerRoutes = require('./routes/customers');

// Create an instance of the Express application
const app = express();

// Parse incoming requests with JSON payloads
app.use(express.json());

// Use the books and customers
app.use('/customers', customerRoutes);

// Start the server
const port = process.env.PORT || 3002;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
