const express = require('express');
const connection = require('../db/connection');
const { isValidEmail, isValidState } = require('../helpers/validators');
const { Kafka } = require('kafkajs');

const kafka = new Kafka({
    clientId: 'customer-service',
    brokers: ['44.214.218.139:9092', '44.214.213.141:9092'],
});


const router = express.Router();

/**
 * Route for creating a new customer.
 * @route POST /
 * @param {Object} req.body - The request body containing customer data.
 * @returns {Object} res - The response object with status and JSON body.
 */
router.post('/', async (req, res) => {
    const customer = req.body;

    if (!customer.userId || !customer.name || !customer.phone || !customer.address || !customer.city || !customer.state || !customer.zipcode) {
        return res.status(400).json({ message: 'Missing required fields in request body.' });
    }
    if (!isValidEmail(customer.userId)) {
        return res.status(400).json({ message: 'User ID must be a valid email address.' });
    }
    if (!isValidState(customer.state)) {
        return res.status(400).json({ message: 'State must be a valid 2-letter US state abbreviation.' });
    }

    const userIdQuery = 'SELECT * FROM Customer WHERE userId = ?';
    connection.query(userIdQuery, [customer.userId], async (err, results) => {
        if (err) {
            console.error('Error checking if user ID already exists: ', err);
            return res.status(500).json({ message: 'Internal server error.' });
        }
        if (results.length > 0) {
            console.log("This user ID already exists in the system.");
            return res.status(422).json({ message: 'This user ID already exists in the system.' });
        }

        const addCustomerQuery = 'INSERT INTO Customer (userId, name, phone, address, address2, city, state, zipcode) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        connection.query(addCustomerQuery, [customer.userId, customer.name, customer.phone, customer.address, customer.address2 || '', customer.city, customer.state, customer.zipcode], async (err, results) => {
            if (err) {
                console.error('Error adding customer to database: ', err);
                return res.status(500).json({ message: 'Internal server error.' });
            }

            const newCustomerId = results.insertId;

            // Send message to Kafka
            const kafkaProducer = kafka.producer();
            await kafkaProducer.connect();

            const customerRegisteredEvent = {
                id: newCustomerId,
                ...customer,
            };

            await kafkaProducer.send({
                topic: 'varunaga.customer.evt',
                messages: [
                    { value: JSON.stringify(customerRegisteredEvent) },
                ],
            });

            await kafkaProducer.disconnect();

            return res.status(201).location(`${req.baseUrl}/customers/${newCustomerId}`).json({ id: newCustomerId, ...customer });
        });
    });
});

/**
 * Route for retrieving a customer by ID.
 * @route GET /:id
 * @param {string} req.params.id - The customer ID.
 * @returns {Object} res - The response object with status and JSON body.
 */
router.get('/:id', (req, res) => {
    const id = req.params.id;
    if (id === null || isNaN(id)) {
        return res.status(400).json({ message: 'Invalid input' });
    }

    // Check if ID exists in the system
    const idQuery = 'SELECT * FROM Customer WHERE id = ?';
    connection.query(idQuery, [id], (err, results) => {
        if (err) {
            console.error('Error retrieving customer: ', err);
            return res.status(500).json({ message: 'Internal server error.' });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'ID not found.' });
        }
        // Return customer data
        return res.status(200).json(results[0]);
    });
});

/**
 * Route for retrieving a customer by User ID (email).
 * @route GET /UserId
 * @param {string} req.params.id - The customer ID.
 * @returns {Object} res - The response object with status and JSON body.
 */

router.get('/', (req, res) => {
    const userId = req.query.userId;
    if (!isValidEmail(userId)) {
        return res.status(400).json({ message: 'Email is not valid' });
    }

    // Check if user ID exists in the system
    const userIdQuery = 'SELECT * FROM Customer WHERE userId = ?';
    connection.query(userIdQuery, [userId], (err, results) => {
        if (err) {
            console.error('Error retrieving customer: ', err);
            return res.status(500).json({ message: 'Internal server error.' });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'User ID not found.' });
        }
        // Return customer data
        return res.status(200).json(results[0]);
    });
});

module.exports = router;
