const express = require('express');
const connection = require('../db/connection');
const { isValidPrice } = require('../helpers/validators');
const router = express.Router();
const axios = require('axios');
const CircuitBreaker = require('opossum');

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
 * Add a new book.
 * POST /books
 *
 * @param {Object} req.body - The request body containing book information.
 * @returns {Object} JSON response containing the book information.
 */
router.post('/', (req, res) => {
    const book = req.body;

    // Validate request body
    if (!book.ISBN || !book.title || !book.Author || !book.description || !book.genre || !book.price || !book.quantity) {
        return res.status(400).json({ message: 'Missing required fields in request body.' });
    }
    if (isNaN(book.price) || !isValidPrice(book.price)) {
        return res.status(400).json({ message: 'Price must be a valid number with 2 decimal places.' });
    }

    // Check if ISBN already exists in the system
    const isbnQuery = 'SELECT * FROM books WHERE ISBN = ?';
    connection.query(isbnQuery, [book.ISBN], (err, results) => {
        if (err) {
            console.error('Error checking if ISBN already exists: ', err);
            return res.status(500).json({ message: 'Internal server error.' });
        }
        if (results.length > 0) {
            return res.status(422).json({ message: 'This ISBN already exists in the system.' });
        }

        // Add book to database
        const addBookQuery = 'INSERT INTO books (ISBN, title, Author, description, genre, price, quantity) VALUES (?, ?, ?, ?, ?, ?, ?)';
        connection.query(addBookQuery, [book.ISBN, book.title, book.Author, book.description, book.genre, book.price, book.quantity], (err, results) => {
            if (err) {
                console.error('Error adding book to database: ', err);
                return res.status(500).json({ message: 'Internal server error.' });
            }

            // Return successful book creation
            return res.status(201).location(`${req.baseUrl}/books/${book.ISBN}`).json(book);
        });
    });
});

/**
 * Update an existing book.
 * PUT /books/:ISBN
 *
 * @param {string} req.params.ISBN - The ISBN of the book to update.
 * @param {Object} req.body - The request body containing the updated book information.
 * @returns {Object} JSON response containing the updated book information.
 */
router.put('/:ISBN', (req, res) => {
    const ISBN = req.params.ISBN;
    const book = req.body;



    // Validate request body
    if (!book.ISBN || !book.title || !book.Author || !book.description || !book.genre || !book.price || !book.quantity) {
        return res.status(400).json({ message: 'Missing required fields in request body.' });
    }
    if (isNaN(book.price) || !isValidPrice(book.price)) {
        return res.status(400).json({ message: 'Price must be a valid number with 2 decimal places.' });
    }

    // Check if ISBN exists in the system
    const ISBNQuery = 'SELECT * FROM books WHERE ISBN = ?';
    connection.query(ISBNQuery, [ISBN], (err, results) => {
        if (err) {
            console.error('Error checking if ISBN exists: ', err);
            return res.status(500).json({ message: 'Internal server error.' });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'ISBN not found.' });
        }
        // Update book in database
        const updateBookQuery = 'UPDATE books SET title = ?, Author = ?, description = ?, genre = ?, price = ?, quantity = ? WHERE ISBN = ?';
        connection.query(updateBookQuery, [book.title, book.Author, book.description, book.genre, book.price, book.quantity, ISBN], (err, results) => {
            if (err) {
                console.error('Error updating book in database: ', err);
                return res.status(500).json({ message: 'Internal server error.' });
            }
            // Return updated book
            return res.status(200).json(book);
        });
    });
});

/**
 
Retrieve a book by ISBN.
 
GET /books/isbn/:ISBN or GET /books/:ISBN
 
@param {string} req.params.ISBN - The ISBN of the book to retrieve.
 
@returns {Object} JSON response containing the book information.
*/
router.get(['/isbn/:ISBN', '/:ISBN'], (req, res) => {
    const ISBN = req.params.ISBN;

    // Check if the requested ISBN exists in the system
    const ISBNQuery = 'SELECT * FROM books WHERE ISBN = ?';
    connection.query(ISBNQuery, [ISBN], (err, results) => {
        if (err) {
            console.error('Error retrieving book: ', err);
            return res.status(500).json({ message: 'Internal server error.' });
        }
        // If the requested ISBN is not found, return a 404 error
        if (results.length === 0) {
            return res.status(404).json({ message: 'ISBN not found.' });
        }
        // If the requested ISBN is found, return the book data
        return res.status(200).json(results[0]);
    });
});

/**
 * Retrieve related books for a given book specified by its ISBN.
 * Endpoint: GET /books/:ISBN/related-books
 *
 * URL Parameter:
 * ISBN (string, required): The book's ISBN
 *
 * Response:
 * Status code: 200 OK, 204 No Content, 503 Service Unavailable, 504 Gateway Timeout
 * Data format: JSON
 * Data: Array of related book objects
 */
router.get("/:ISBN/related-books", async (req, res) => {
    const { ISBN } = req.params;

    try {
        if (circuitBreaker.opened && new Date() - lastOpened >= 60000) {
            circuitBreaker.close();
          }
        const relatedBooks = await circuitBreaker.fire(ISBN);
        let formattedBooks;
        if(relatedBooks){
        formattedBooks = relatedBooks.map(book => {
            return {
                ISBN: book.isbn,
                title: book.title,
                Author: book.authors
            }
        });
      }

        if (relatedBooks.length > 0) {
            res.status(200).json(formattedBooks);
        } else {
            res.status(204).send();
        }
    } catch (error) {
        if (firstTimeout) {
            firstTimeout = false;
            res.status(504).json({ message: "Request to external service timed out" });
        } else if (circuitBreaker.opened && firstTimeout==false) {
            res.status(503).json({ message: "Circuit is open" });
        } else {
            console.error("Error:", error);
            res.status(500).json({ message: "An internal server error occurred" });
        }
    }
});


module.exports = router;