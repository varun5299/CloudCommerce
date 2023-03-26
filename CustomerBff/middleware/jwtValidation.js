const jwt = require('jsonwebtoken');

/**
 * Middleware for validating JWT tokens.
 * Checks if the decoded JWT token contains the required fields (sub, exp, iss)
 * and if the token is not expired. If the token is valid, it adds the decoded
 * token to the request object and calls the next middleware. Otherwise,
 * it returns an HTTP 401 Unauthorized response.
 *
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {function} next - The next middleware function.
 * @returns {void}
 */
const jwtValidation = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'Unauthorized: JWT token missing' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.decode(token);

    if (decoded.sub && ['starlord', 'gamora', 'drax', 'rocket', 'groot'].includes(decoded.sub) &&
        decoded.exp && (decoded.exp * 1000) > Date.now() &&
        decoded.iss === 'cmu.edu') {
      req.user = decoded;
      next();
    } else {
      return res.status(401).json({ message: 'Unauthorized: JWT token invalid' });
    }
  } catch (error) {
    console.error('Error:', error);
    return res.status(401).json({ message: 'Unauthorized: JWT token invalid' });
  }
};

module.exports = jwtValidation;
