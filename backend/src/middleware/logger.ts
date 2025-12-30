import { Request, Response, NextFunction } from 'express';

export function logger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  const { method, url } = req;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    const logMessage = `${method} ${url} ${statusCode} - ${duration}ms`;

    if (statusCode >= 500) {
      console.error(`✗ ${logMessage}`);
    } else if (statusCode >= 400) {
      console.warn(`⚠ ${logMessage}`);
    } else {
      console.log(`✓ ${logMessage}`);
    }
  });

  next();
}
