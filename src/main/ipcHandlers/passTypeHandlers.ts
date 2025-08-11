import { ipcMain } from "electron";
import { PassTypeRepository } from "../repositories/PassTypeRepository";
import { AppDataSource } from "../data/data-source"

const passTypeRepository = PassTypeRepository.getInstance(AppDataSource);

export function registerPassTypeHandlers() {
  ipcMain.handle("pass-type:add", async (_event, name: string, description: string, entry: number) => {
    return await passTypeRepository.addPassType(name, description, entry);
  });

  ipcMain.handle("pass-type:get-all", async () => {
    return await passTypeRepository.getPassTypes();
  });

  ipcMain.handle("pass-type:modify", async (_event, passTypeId: number, name?: string, description?: string, entry?: number) => {
    return await passTypeRepository.modifyPassType(passTypeId, name, description, entry);
  });

  ipcMain.handle("pass-type:delete", async (_event, passTypeId: number) => {
    return await passTypeRepository.deletePassType(passTypeId);
  });
}
