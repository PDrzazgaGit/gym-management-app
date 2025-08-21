import { dialog, BrowserWindow, app } from 'electron';
import fs from 'fs';
import path from 'path';
import { AppDataSource } from '../data/data-source';
import { LoggerService } from './LoggerService';
import { AppError } from '../data/AppError';

export class BackupService {
  private static instance: BackupService;

  private constructor() {}

  public static getInstance(): BackupService {
    if (!this.instance) {
      this.instance = new BackupService();
    }
    return this.instance;
  }

  public async createBackup(window: BrowserWindow): Promise<string> {
    try {
      // Tworzymy nazwę z datą i godziną
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const defaultFileName = `backup-${timestamp}.sqlite`;
      const defaultPath = path.join(app.getPath('documents'), defaultFileName);

      const { filePath } = await dialog.showSaveDialog(window, {
        title: 'Zapisz kopię bazy danych',
        defaultPath,
        filters: [{ name: 'SQLite Database', extensions: ['sqlite', 'db'] }],
      });

      if (!filePath) return;

      const dbPath = AppDataSource.options.database as string;
      fs.copyFileSync(dbPath, filePath);
      return filePath;
    } catch (error: any) {
      throw new AppError("Nie udało się utworzyć backupu.", error);
    }
  }

  public async restoreBackup(window: BrowserWindow): Promise<string> {
    try {
      const defaultPath = app.getPath('documents');

      const { filePaths } = await dialog.showOpenDialog(window, {
        title: 'Wybierz kopię bazy danych',
        defaultPath,
        filters: [{ name: 'SQLite Database', extensions: ['sqlite', 'db'] }],
        properties: ['openFile'],
      });

      if (!filePaths || filePaths.length === 0) return;

      const dbPath = AppDataSource.options.database as string;

      if (AppDataSource.isInitialized) {
        await AppDataSource.destroy(); // zamykamy połączenie
      }

      fs.copyFileSync(filePaths[0], dbPath);

      await AppDataSource.initialize(); // ponownie inicjalizujemy bazę

      window.webContents.send('backup:restored');

      return filePaths[0];
    } catch (error: any) {
      throw new AppError("Nie udało się przywrócić backupu", error);
    }
  }
}
