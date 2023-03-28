const express = require("express");

// Create a new router instance
const router = express.Router();

/**
 * Health check endpoint for the server.
 * Returns server uptime, status message, and current timestamp.
 *
 * @param {Object} _req - The request object (unused, hence the _ prefix).
 * @param {Object} res - The response object.
 * @param {Function} _next - The next middleware in the stack (unused, hence the _ prefix).
 * @returns {void}
 */
router.get("/", async (_req, res, _next) => {
  const healthcheck = {
    uptime: process.uptime(),
    message: "OK",
    timestamp: Date.now(),
  };

  try {
    res.send(healthcheck);
  } catch (error) {
    console.error("Error:", error);
    healthcheck.message = "Health check failed";
    res.status(503).send(healthcheck);
  }
});

// Export router with all routes included
module.exports = router;
