const express = require('express');
const connection = require('../db/connection');
const { isValidPrice } = require('../helpers/validators');

const router = express.Router();

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

module.exports = router;