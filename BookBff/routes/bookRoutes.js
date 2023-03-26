const express = require('express');
const axios = require('axios');
const { isMobileDevice, processBookData } = require('../helpers/bookHelpers');
const router = express.Router();

/**
 * Book BFF endpoint handler for retrieving a book by ISBN.
 * Calls the Book Service backend and adapts the book data based on the user-agent header.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @returns {void}
 */
router.get('/isbn/:ISBN', async (req, res) => {
  try {
    const { ISBN } = req.params;
    const userAgent = req.headers['user-agent'];

    if (!userAgent) {
      return res.status(400).json({ message: 'User-Agent missing' });
    }

    // Call the Book Service backend
    const bookResponse = await axios.get(`http://localhost:3001/books/isbn/${ISBN}`);
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

module.exports = router;
