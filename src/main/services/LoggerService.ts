import fs from "fs";
import path from "path";
import { app } from "electron";

const LOG_DIR_NAME = 'log';

export class LoggerService {

    private static instance: LoggerService | null;
    private logDir: string;

    private constructor() {
        this.logDir = path.join(app.getPath("userData"), LOG_DIR_NAME);

        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }

    public static getInstance(): LoggerService {
        if (!this.instance) {
          this.instance = new LoggerService();
        }
        return this.instance;
      }

    private getLogFilePath(): string {
        const dateStr = new Date().toISOString().slice(0, 10); 
        return path.join(this.logDir, `app-${dateStr}.log`);
    }

    private write(level: "INFO" | "WARN" | "ERROR", message: string, error?: any): void {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] [${level}] ${message}${error ? ` | ${error.stack || error}` : ""}\n`;

        const logFilePath = this.getLogFilePath();
        fs.appendFileSync(logFilePath, logMessage, { encoding: "utf8" });
    }

    public info(message: string): void {
        this.write("INFO", message);
    }

    public warn(message: string): void {
        this.write("WARN", message);
    }

    public error(message: string, error?: any): void {
        this.write("ERROR", message, error);
    }
}