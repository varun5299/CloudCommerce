const express = require('express');
const customerRoutes = require('./routes/customers');
const healthCheck = require('./routes/healthcheck')


// Create an instance of the Express application
const app = express();

// Parse incoming requests with JSON payloads
app.use(express.json());

// Use the books and customers
app.use('/customers', customerRoutes);
app.use('/', healthCheck);


// Start the server
const port = process.env.PORT || 5678;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
