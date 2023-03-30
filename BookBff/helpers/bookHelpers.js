/**
 * Checks if the given user agent string corresponds to a mobile device.
 *
 * @param {string} userAgent - The user agent string.
 * @returns {boolean} True if the user agent corresponds to a mobile device, false otherwise.
 */
const isMobileDevice = (userAgent) => {
    if (!userAgent) {
      throw new Error('User-Agent is required.');
    }
    return userAgent.includes('Mobile');
  };
  
  /**
   * Processes the book data by updating the genre field. If the genre is 'non-fiction', it changes it to '3'.
   * This function works for both individual book objects and arrays of book objects.
   *
   * @param {Object|Object[]} bookData - The book data to process. Can be an individual book object or an array of book objects.
   * @returns {Object|Object[]} The processed book data with the genre field updated.
   */
  const processBookData = (bookData) => {
    if (!bookData) {
      throw new Error('Book data is required.');
    }
  
    if (Array.isArray(bookData)) {
      return bookData.map(book => {
        book.genre = updateGenre(book.genre);
        return book;
      });
    } else {
      bookData.genre = updateGenre(bookData.genre);
      return bookData;
    }
  };
  
  /**
   * Updates the genre value based on the given genre. If the genre is 'non-fiction', it changes it to '3'.
   * For other genre values, it keeps them unchanged.
   *
   * @param {string} genre - The original genre value.
   * @returns {string} The updated genre value.
   */
  const updateGenre = (genre) => {
    if (!genre) {
      throw new Error('Genre is required.');
    }
  
    if (genre === 'non-fiction') {
      return 3;
    } else {
      return genre;
    }
  };
  
  module.exports = {
    isMobileDevice,
    processBookData
  };
  