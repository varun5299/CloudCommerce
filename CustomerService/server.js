const express = require('express');
const customerRoutes = require('./routes/customers');
//const healthCheck = require('./routes/healthcheck')


// Create an instance of the Express application
const app = express();

// Parse incoming requests with JSON payloads
app.use(express.json());

// Use the books and customers
app.use('/customers', customerRoutes);
//app.use('/', healthCheck);
app.get('/status', (req, res) => {
    res.setHeader('Content-Type', 'text/plain');
    res.status(200).send('OK');
  });

// Start the server
const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
