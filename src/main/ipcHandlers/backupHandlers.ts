import { ipcMain, BrowserWindow } from "electron";
import { BackupService } from "../services/BackupService";
import { LoggerService } from "../services/LoggerService";
import { AppError } from "../data/AppError";
import { ok, fail } from "../utils/safeHandlerObjects";


const backupService = BackupService.getInstance();
const loggerService = LoggerService.getInstance();

export function registerBackupHandlers(window: BrowserWindow) {
  ipcMain.handle("backup:create", async () => {
    try {
      loggerService.info(`[backup:create] Tworzenie kopii zapasowej...`);
      const path = await backupService.createBackup(window);
      if (path) {
        loggerService.info(`[backup:create] Sukces: utworzono kopię zapasową w ${path}`);
        return ok(path);
      }
      return ok(undefined); //jeśli anuluj...
    } catch (err: AppError | Error | any) {
      loggerService.error("[backup:create] Błąd podczas tworzenia kopii zapasowej", err);
      return fail(err, "Nie udało się utworzyć kopii zapasowej");
    }
  });

  ipcMain.handle("backup:restore", async () => {
    try {
      loggerService.info(`[backup:restore] Przywracanie kopii zapasowej...`);
      const path = await backupService.restoreBackup(window);
      if (path) {
        loggerService.info(`[backup:restore] Sukces: przywrócono kopię zapasową z ${path}`);
        return ok(path);
      }
      return ok(undefined); //jeśli anuluj...

    } catch (err: AppError | Error | any) {
      loggerService.error("[backup:restore] Błąd podczas przywracania kopii zapasowej", err);
      return fail(err, "Nie udało się przywrócić kopii zapasowej");
    }
  });
}
