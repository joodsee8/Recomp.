export class AppError extends Error {
  public readonly statusCode: number;
  public readonly esOperacional: boolean;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.esOperacional = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
