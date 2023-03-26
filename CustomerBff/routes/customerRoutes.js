const express = require('express');
const axios = require('axios');
const { isMobileDevice, removeSensitiveInfo } = require('../helpers/customerHelper');

const router = express.Router();

/**
 * Retrieve a specific customer by ID.
 * Endpoint: GET /customers/:id
 *
 * URL Parameter:
 * id (integer, required): The customer's ID
 *
 * Response:
 * Status code: 200 OK
 * Data format: JSON
 * Data: Customer object
 */
router.get('/customers/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const userAgent = req.headers['user-agent'];

        if (!userAgent) {
            return res.status(400).json({ message: 'User-Agent missing'})
        }

        // Call the Customer Service backend
        const customerResponse = await axios.get(`http://localhost:3002/customers/${id}`);
        let customerData = customerResponse.data;

        // Apply the necessary adaptation based on the user-agent header
        customerData = removeSensitiveInfo(customerData, userAgent);

        res.json(customerData);
    } catch (error) {
        if (error.response) {
            res.status(error.response.status).json(error.response.statusText);
        } else {
            res.status(500).json({ message: 'An internal server error occurred'});
            console.error(error);
        }
    }
});

/**
 * Retrieve a list of customers filtered by user ID.
 * Endpoint: GET /customers
 *
 * Query Parameter:
 * userId (integer, optional): The user's ID to filter customers by
 *
 * Response:
 * Status code: 200 OK
 * Data format: JSON
 * Data: Array of Customer objects
 */
router.get('/customers', async (req, res) => {
    try {
        const { userId } = req.query;
        const userAgent = req.headers['user-agent'];

        if (!userAgent) {
            return res.status(400).json({ message: 'User-Agent missing'})
        }

        // Call the Customer Service backend
        const customerResponse = await axios.get(`http://localhost:3002/customers`, {
            params: { userId }
        });
        let customerData = customerResponse.data;

        // Apply the necessary adaptation based on the user-agent header
        customerData = removeSensitiveInfo(customerData, userAgent);

        res.json(customerData);
    } catch (error) {
        if (error.response) {
            res.status(error.response.status).json(error.response.statusText);
        } else {
            res.status(500).json({ message: 'An internal server error occurred'});
            console.error(error);
        }
    }
});

module.exports = router;
