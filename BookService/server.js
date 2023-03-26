const express = require('express');
const bookRoutes = require('./routes/books');

// Create an instance of the Express application
const app = express();

// Parse incoming requests with JSON payloads
app.use(express.json());

// Use the books and customers
app.use('/books', bookRoutes);

// Start the server
const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
