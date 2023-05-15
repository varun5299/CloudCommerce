const mysql = require('mysql');

// Set up MySQL connection
let connection;

/**
 * Function to handle MySQL disconnection errors and reconnect.
 */
function handleDisconnect() {
    // Create a new MySQL connection using environment variables or default values
    connection = mysql.createConnection({
        host: process.env.MYSQL_HOST || 'a3-databaseprimaryinstance-u8olsmfivjjd.ccza0cxdcavd.us-east-1.rds.amazonaws.com',
        port: process.env.MYSQL_PORT || '3306',
        user: process.env.MYSQL_USER || 'root',
        password: process.env.MYSQL_PASSWORD || 'password',
        database: process.env.MYSQL_DATABASE || 'ecommerce'
    });

    // Attempt to connect to MySQL
    connection.connect((err) => {
        if (err) {
            // If connection fails, log the error and retry in 2 seconds
            console.error('Error connecting to MySQL: ', err);
            setTimeout(handleDisconnect, 2000);
        } else {
            console.log('Connected to MySQL');
        }
    });

    // Handle MySQL errors
    connection.on('error', (err) => {
        console.error('MySQL error: ', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            // If connection is lost, attempt to reconnect
            handleDisconnect();
        } else {
            // If error is not due to connection loss, throw the error
            throw err;
        }
    });
}

// Call handleDisconnect() to set up MySQL connection
handleDisconnect();

// Export the connection object so it can be used in other modules
module.exports = connection;
