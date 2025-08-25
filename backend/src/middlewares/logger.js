export const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Log the incoming request
<<<<<<< HEAD
  console.log(`📥 [${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
=======
  console.log(`📥 ${req.method} ${req.originalUrl}`);
>>>>>>> 10343382ae11e45544ef657d05391aed8a6c8eb9
  
  // Override res.end to log the response
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
    originalEnd.call(this, chunk, encoding);
  };
  
  next();
};
