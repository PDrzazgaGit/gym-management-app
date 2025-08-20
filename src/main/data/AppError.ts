export class AppError extends Error {
  public details?: any;

  constructor(message: string, details?: any) {
    super(message);
    this.name = "AppError";
    this.details = details;
  }
}