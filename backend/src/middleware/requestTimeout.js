function requestTimeout(ms = 5000) {
  return (req, res, next) => {
    res.setTimeout(ms, () => {
      if (!res.headersSent) {
        res.status(503).json({
          success: false,
          error: 'Request timed out. Please try again.',
        });
      }
    });
    next();
  };
}

module.exports = requestTimeout;
