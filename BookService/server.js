const express = require('express');
const bookRoutes = require('./routes/books');
//const healthCheck = require('./routes/healthcheck')

// Create an instance of the Express application
const app = express();

// Parse incoming requests with JSON payloads
app.use(express.json());

// Use the books and customers
app.use('/books', bookRoutes);
//app.use('/', healthCheck);

app.get('/status', (req, res) => {
    res.send('OK');
});

// Start the server
const port = 3002;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
