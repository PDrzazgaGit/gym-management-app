// handlers/acrManagerHandlers.ts (Main Process)
import { ipcMain, BrowserWindow } from "electron";
import { CardData } from "../data/CardData";
import { ACRManager } from "../services/ACRManager";
import { LoggerService } from "../services/LoggerService";
import { ok, fail } from "../utils/safeHandlerObjects";
import { AppError } from "../data/AppError";

export function registerACRManagerHandlers(mainWindow: BrowserWindow, acrManager: ACRManager) {
  // IPC do wywołań metod
  ipcMain.handle("acr:is-available", async () => {
    try {
      LoggerService.info("[acr:is-available] Sprawdzanie dostępności czytnika");
      const available = acrManager.isAvailable();
      return ok(available);
    } catch (err: AppError | any) {
      LoggerService.error("[acr:is-available] Błąd przy sprawdzaniu dostępności", err);
      return fail(err.message, "Nie udało się sprawdzić dostępności czytnika");
    }
  });

  ipcMain.handle("acr:read", async () => {
    try {
      LoggerService.info("[acr:read] Odczyt karty");
      const card = await acrManager.read();
      return ok(card);
    } catch (err: any) {
      LoggerService.error("[acr:read] Błąd przy odczycie karty", err);
      return fail(err, "Nie udało się odczytać karty");
    }
  });

  ipcMain.handle("acr:write", async (_event, data: CardData) => {
    try {
      LoggerService.info(`[acr:write] Zapis danych na karcie: ${JSON.stringify(data)}`);
      const result = await acrManager.write(data);
      return ok(result);
    } catch (err: any) {
      LoggerService.error("[acr:write] Błąd przy zapisie danych na kartę", err);
      return fail(err, "Nie udało się zapisać danych na kartę");
    }
  });

  // Obsługa emitera -> wysyłanie zdarzeń do renderera
  const sendToRenderer = (event: string, data?: any) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      LoggerService.info(`[acr:event] Emisja zdarzenia do renderera: ${event}`);
      mainWindow.webContents.send(event, data);
    } else {
      LoggerService.warn(`[acr:event] Próba wysłania zdarzenia do zniszczonego okna: ${event}`);
    }
  };

  acrManager.on("reader-connected", (name) => sendToRenderer("acr:reader-connected", name));
  acrManager.on("reader-disconnected", (name) => sendToRenderer("acr:reader-disconnected", name));
  acrManager.on("card-inserted", (card) => sendToRenderer("acr:card-inserted", card));
  acrManager.on("card-removed", (card) => sendToRenderer("acr:card-removed", card));
  acrManager.on("reader-error", (err) => {
    LoggerService.error("[acr:reader-error] Błąd czytnika", err);
    sendToRenderer("acr:reader-error", err?.message || err);
  });
}
