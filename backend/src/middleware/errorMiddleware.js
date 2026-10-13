export const notFound = (req, res, next) => {
  const error = new Error(`Not found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export const errorHandler = (err, _req, res, _next) => {
  const uploadError = err.name === "MulterError" || err.message?.startsWith("Only JPG, PNG, or WEBP");
  const statusCode = err.statusCode || (uploadError ? 400 : res.statusCode === 200 ? 500 : res.statusCode);
  if (process.env.NODE_ENV !== "test") {
    console.error(`[${statusCode}] ${err.message}`);
  }
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack
  });
};
