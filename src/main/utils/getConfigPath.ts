import fs from "fs";
import path from "path";
import { app } from "electron";

export function getConfigPath(fileName: string = "app-config.json"): string {
  const userDataPath = app.getPath("userData");
  const configFolder = path.join(userDataPath, "config");

  // utwórz folder, jeśli nie istnieje
  if (!fs.existsSync(configFolder)) {
    fs.mkdirSync(configFolder, { recursive: true });
  }

  const configPath = path.join(configFolder, fileName);

  // utwórz pusty plik, jeśli nie istnieje
  if (!fs.existsSync(configPath)) {
    fs.writeFileSync(configPath, JSON.stringify({}, null, 2));
  }

  return configPath;
}
