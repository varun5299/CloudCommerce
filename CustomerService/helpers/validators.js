/**
 * Check if a given state is a valid US state.
 *
 * @param {string} state - The state abbreviation to be validated.
 * @returns {boolean} - True if the state is valid, false otherwise.
 */
function isValidState(state) {
    const validStates = [
        'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL',
        'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT',
        'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI',
        'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
    ];

    // Check if the state is in the list of valid states, ignoring case
    return validStates.includes(state.toUpperCase());
}

/**
 * Check if a given email address is valid.
 *
 * @param {string} email - The email address to be validated.
 * @returns {boolean} - True if the email address is valid, false otherwise.
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Check if the email address matches the email regex pattern
    return emailRegex.test(email);
}

// Export the functions so they can be used in other modules
module.exports = {
    isValidState,
    isValidEmail,
};
