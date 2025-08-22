// handlers/passHandlers.ts (Main Process)
import { ipcMain } from "electron";
import { PassRepository } from "../repositories/PassRepository";
import { AppDataSource } from "../data/data-source";
import { PassTypeRepository } from "../repositories/PassTypeRepository";
import { LoggerService } from "../services/LoggerService";
import { ok, fail } from "../utils/safeHandlerObjects";

const passRepository = PassRepository.getInstance(AppDataSource);
const passTypeRepository = PassTypeRepository.getInstance(AppDataSource);
const loggerService = LoggerService.getInstance();

export function registerPassHandlers() {
  ipcMain.handle("pass:add", async (_event, passTypeId: number) => {
    try {
      loggerService.info(`[pass:add] Dodawanie przepustki dla passTypeId=${passTypeId}`);
      const passType = await passTypeRepository.findOne(passTypeId);
      const result = await passRepository.addPass(passType);
      loggerService.info(`[pass:add] Sukces: dodano przepustkę ID=${result.id}`);
      return ok(result);
    } catch (err: any) {
      loggerService.error(`[pass:add] Błąd przy dodawaniu przepustki (passTypeId=${passTypeId})`, err);
      return fail(err, "Nie udało się dodać przepustki");
    }
  });

  ipcMain.handle("pass:delete", async (_event, passId: number) => {
    try {
      loggerService.info(`[pass:delete] Usuwanie przepustki ID=${passId}`);
      const pass = await passRepository.findOne(passId);
      return ok(await passRepository.deletePass(pass));
    } catch (err: any) {
      loggerService.error(`[pass:delete] Błąd przy usuwaniu przepustki ID=${passId}`, err);
      return fail(err, "Nie udało się usunąć przepustki");
    }
  });

  ipcMain.handle("pass:get-by-uuid", async (_event, uuid: string) => {
    try {
      loggerService.info(`[pass:get-by-uuid] Pobieranie przepustki po UUID=${uuid}`);
      return ok(await passRepository.getPassByUUID(uuid));
    } catch (err: any) {
      loggerService.error(`[pass:get-by-uuid] Błąd przy pobieraniu przepustki UUID=${uuid}`, err);
      return fail(err, "Nie udało się pobrać przepustki");
    }
  });

  ipcMain.handle("pass:try-assign-card", async (_event, passId: number, previousUUID: string) => {
    try {
      loggerService.info(`[pass:try-assign-card] Przypisywanie karty do przepustki ID=${passId}, previousUUID=${previousUUID}`);
      const pass = await passRepository.findOne(passId);
      return ok(await passRepository.tryAssignCard(pass, previousUUID));
    } catch (err: any) {
      loggerService.error(`[pass:try-assign-card] Błąd przy przypisywaniu karty do passId=${passId}`, err);
      return fail(err, "Nie udało się przypisać karty do przepustki");
    }
  });

  ipcMain.handle("pass:extend", async (_event, passId: number, passTypeId: number) => {
    try {
      loggerService.info(`[pass:extend] Przedłużanie przepustki ID=${passId} nowym typem ID=${passTypeId}`);
      const pass = await passRepository.findOne(passId);
      const passType = await passTypeRepository.findOne(passTypeId);
      return ok(await passRepository.extendPass(pass, passType));
    } catch (err: any) {
      loggerService.error(`[pass:extend] Błąd przy przedłużaniu przepustki ID=${passId}`, err);
      return fail(err, "Nie udało się przedłużyć przepustki");
    }
  });
}