const express = require('express');
const jwtValidation = require('./middleware/jwtValidation');
const bookRoutes = require('./routes/bookRoutes');
const healthCheck = require('./routes/healthcheck')

const app = express();
const PORT = 3001;

// Use JSON middleware to parse incoming request bodies
app.use(express.json());

// Apply the JWT validation middleware to protect the API routes
app.use(jwtValidation);

// Mount the book routes under the '/books' path
app.use('/books', bookRoutes);
app.use('/', healthCheck);


// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

// Start the server and listen for incoming requests
app.listen(PORT, () => {
  console.log(`Book BFF service listening on port ${PORT}`);
});
