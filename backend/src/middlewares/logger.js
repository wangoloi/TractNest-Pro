export const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Log the incoming request
  console.log(`📥 [${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  
  // Override res.end to log the response
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    originalEnd.call(this, chunk, encoding);
  };
  
  next();
};
