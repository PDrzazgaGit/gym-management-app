import { app, BrowserWindow, ipcMain, shell } from "electron";
import { LoggerService } from "../services/LoggerService";
import { AppError } from "../data/AppError";
import { ok, fail } from "../utils/safeHandlerObjects"
import path from "path";

const loggerService = LoggerService.getInstance();

export function registerOtherHandlers() {
  ipcMain.handle("other:open-folder", async (_event, folderName: "db" | "log" | "config") => {
    try {
      const userDataPath = app.getPath("userData");
      const destiny = path.join(userDataPath, folderName);
      const result = await shell.openPath(destiny);

      // shell.openPath zwraca pusty string przy sukcesie, inaczej błąd
      if (result) {
        throw new AppError("Nie udało się otworzyć folderu");
      }

      return ok({});
    } catch (err: any) {
      // logowanie błędu
      loggerService.error(`[open-folder] Błąd przy otwieraniu folderu: ${folderName}`, err);
      return fail(err, "Nie udało się otworzyć folderu.")
    }
  });

  ipcMain.handle("other:set-font-size", async (_event, fontSize: string) => {

  })
}