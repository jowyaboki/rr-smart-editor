export class ApiError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export const handleError = (err: any, res: any) => {
  const { logger } = require('./logger');
  if (err.name === 'ZodError') {
    return res.status(400).json({ error: 'Validation Error', details: err.errors });
  }
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ error: err.message });
  }
  logger.error('Unhandled error', err);
  res.status(500).json({ error: 'Internal Server Error' });
};
