const express = require('express');
const axios = require('axios');
const { isMobileDevice, processBookData } = require('../helpers/bookHelpers');
const router = express.Router();
const CircuitBreaker = require('opossum');

const backendServiceUrl = 'http://books-service-app:3002';

// External service URL to get recommended books
const externalServiceURL = 'http://44.214.218.139';

/**
 * Calls an external service to get recommended books based on an ISBN.
 * 
 * @param {string} ISBN - The ISBN of the book to get recommended titles for.
 * @returns {Promise<Array>} A Promise that resolves to an array of recommended book titles.
 */
const getRelatedBooks = async (ISBN) => {
    const response = await axios.get(`${externalServiceURL}/recommended-titles/isbn/${ISBN}`);
    return response.data;
};

// Options for configuring the Circuit Breaker
const circuitBreakerOptions = {
    timeout: 3000, // Request timeout
    errorThresholdPercentage: 1, // Open circuit after 1st failure
    resetTimeout: 60000, // Reset circuit after 60s
};

// Create a new Circuit Breaker instance that wraps the `getRelatedBooks` function
const circuitBreaker = new CircuitBreaker(getRelatedBooks, circuitBreakerOptions);

// Flag to track the first timeout event
let firstTimeout = false;
let lastOpened = null;

// Handle timeout events: if it's the first timeout, open the circuit
circuitBreaker.on("timeout", () => {
  if (!firstTimeout) {
    firstTimeout = true;
    circuitBreaker.open();
    lastOpened = new Date();
  }
});

// Handle success events: reset the first timeout flag
circuitBreaker.on("success", () => {
    firstTimeout = false;
});

/**
 * Book BFF endpoint handler for retrieving a book by ISBN.
 * Calls the Book Service backend and adapts the book data based on the user-agent header.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {void}
 */
router.get(['/isbn/:ISBN', '/:ISBN'], async (req, res) => {
  try {
    const { ISBN } = req.params;
    const userAgent = req.headers['user-agent'];

    if (!userAgent) {
      return res.status(400).json({ message: 'User-Agent missing' });
    }

    // Call the Book Service backend
    const bookResponse = await axios.get(`${backendServiceUrl}/books/isbn/${ISBN}`);
    let bookData = bookResponse.data;

    // Apply the necessary adaptation based on the user-agent header
    if (isMobileDevice(userAgent)) {
      bookData = processBookData(bookData);
    }

    res.json(bookData);
  } catch (error) {
    if (error.response) {
      res.status(error.response.status).json({ message: error.response.statusText });
    } else {
      console.error('Error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
});

/**
 * POST endpoint for creating a new book.
 * Calls the Book Service backend and forwards the response to the client.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {void}
 */
router.post('/', async (req, res) => {
  try {
    const book = req.body;
    const userAgent = req.headers['user-agent'];

    if (!userAgent) {
      return res.status(400).json({ message: 'User-Agent missing' });
    }
    const bookResponse = await axios.post(`${backendServiceUrl}/books/`, book);
    res.status(bookResponse.status).json(bookResponse.data);
  } catch (error) {
    if (error.response) {
      res.status(error.response.status).json({ message: error.response.statusText });
    } else {
      console.error('Error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
});

/**
 * PUT endpoint for updating a book by ISBN.
 * Calls the Book Service backend and forwards the response to the client.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {void}
 */
router.put('/:ISBN', async (req, res) => {
  try {
    const ISBN = req.params.ISBN;
    const book = req.body;
    const userAgent = req.headers['user-agent'];

    if (!userAgent) {
      return res.status(400).json({ message: 'User-Agent missing' });
    }
    
    const bookResponse = await axios.put(`${backendServiceUrl}/books/${ISBN}`, book);
    res.status(bookResponse.status).json(bookResponse.data);
  } catch (error) {
    if (error.response) {
      res.status(error.response.status).json({ message: error.response.statusText });
    } else {
      console.error('Error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
});

router.get("/:ISBN/related-books", async (req, res) => {
  try {
    const { ISBN } = req.params;
    const userAgent = req.headers['user-agent'];

    if (!userAgent) {
      return res.status(400).json({ message: 'User-Agent missing' });
    }

    // Call the Book Service backend
    const bookResponse = await axios.get(`${backendServiceUrl}/books/${ISBN}/related-books`);

    res.status(bookResponse.status).json(bookResponse.data);
  } catch (error) {
    if (error.response) {
      res.status(error.response.status).json({ message: error.response.statusText });
    } else {
      console.error('Error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

});
module.exports = router;
