/**
 * Check if a given price is valid.
 *
 * @param {string} price - The price to be validated.
 * @returns {boolean} - True if the price is valid, false otherwise.
 */
function isValidPrice(price) {
    const regex = /^\d+(\.\d{2})?$/;

    // Check if the price matches the price regex pattern
    return regex.test(price);
}

// Export the functions so they can be used in other modules
module.exports = {
    isValidPrice,
};
