/**
 * Helper function to check if the client is a mobile device.
 *
 * @param {string} userAgent - The user agent string from the client.
 * @returns {boolean} Returns true if the client is a mobile device, false otherwise.
 */
const isMobileDevice = (userAgent) => {
    if (!userAgent) {
        throw new Error('User-Agent is required.');
      }
    return userAgent.includes('Mobile');
};

/**
 * Remove sensitive information for mobile clients.
 *
 * @param {Object} data - The data object containing the information to be filtered.
 * @param {string} userAgent - The user agent string from the client.
 * @returns {Object} Returns the filtered data object without sensitive information for mobile clients.
 */
const removeSensitiveInfo = (data, userAgent) => {
    if (!data) {
        throw new Error('Customer data is required.');
      }

    if (isMobileDevice(userAgent)) {
        delete data.address;
        delete data.address2;
        delete data.city;
        delete data.state;
        delete data.zipcode;
    }
    return data;
};

module.exports = {
    isMobileDevice,
    removeSensitiveInfo
};
