// handlers/passTypeHandlers.ts (Main Process)
import { ipcMain } from "electron";
import { PassTypeRepository } from "../repositories/PassTypeRepository";
import { AppDataSource } from "../data/data-source";
import { LoggerService } from "../services/LoggerService";
import { ok, fail } from "../utils/safeHandlerObjects";

const passTypeRepository = PassTypeRepository.getInstance(AppDataSource);
const loggerService = LoggerService.getInstance();

export function registerPassTypeHandlers() {
  ipcMain.handle("pass-type:add", async (_event, name: string, description: string, entry: number) => {
    try {
      loggerService.info(`[pass-type:add] Dodawanie typu przepustki: ${name}`);
      const result = await passTypeRepository.addPassType(name, description, entry);
      loggerService.info(`[pass-type:add] Sukces: dodano passType ID=${result.id}`);
      return ok(result);
    } catch (err: any) {
      loggerService.error(`[pass-type:add] Błąd przy dodawaniu typu przepustki (${name})`, err);
      return fail(err, "Nie udało się dodać typu przepustki");
    }
  });

  ipcMain.handle("pass-type:get-all", async () => {
    try {
      loggerService.info("[pass-type:get-all] Pobieranie wszystkich typów przepustek");
      return ok(await passTypeRepository.getPassTypes());
    } catch (err: any) {
      loggerService.error("[pass-type:get-all] Błąd przy pobieraniu typów przepustek", err);
      return fail(err, "Nie udało się pobrać typów przepustek");
    }
  });

  ipcMain.handle("pass-type:modify", async (_event, passTypeId: number, name?: string, description?: string, entry?: number) => {
    try {
      loggerService.info(`[pass-type:modify] Modyfikacja typu przepustki ID=${passTypeId}`);
      return ok(await passTypeRepository.modifyPassType(passTypeId, name, description, entry));
    } catch (err: any) {
      loggerService.error(`[pass-type:modify] Błąd przy modyfikacji typu przepustki ID=${passTypeId}`, err);
      return fail(err, "Nie udało się zmodyfikować typu przepustki");
    }
  });

  ipcMain.handle("pass-type:delete", async (_event, passTypeId: number) => {
    try {
      loggerService.info(`[pass-type:delete] Usuwanie typu przepustki ID=${passTypeId}`);
      return ok(await passTypeRepository.deletePassType(passTypeId));
    } catch (err: any) {
      loggerService.error(`[pass-type:delete] Błąd przy usuwaniu typu przepustki ID=${passTypeId}`, err);
      return fail(err, "Nie udało się usunąć typu przepustki");
    }
  });
}