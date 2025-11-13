export class Logger {
  static info(message: string, data?: unknown): void {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, data || '');
  }

  static warn(message: string, data?: unknown): void {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, data || '');
  }

  static error(message: string, error?: unknown): void {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error || '');
  }

  static debug(message: string, data?: unknown): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`, data || '');
    }
  }
}
