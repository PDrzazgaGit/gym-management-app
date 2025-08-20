import "reflect-metadata"
import { DataSource } from "typeorm"
import { Client } from "../entities/Client"
import { Pass } from "../entities/Pass"
import { PassType } from "../entities/PassType"
import { TrainingSession } from "../entities/TrainingSession"
import { app } from "electron";
import path from "path";
import fs from "fs";

// Ścieżka do podkatalogu w userData
const userDataPath = app.getPath("userData");
const dbFolderPath = path.join(userDataPath, "db");

// Tworzymy katalog, jeśli nie istnieje
if (!fs.existsSync(dbFolderPath)) {
    fs.mkdirSync(dbFolderPath, { recursive: true });
}

// Pełna ścieżka do pliku bazy
const dbFilePath = path.join(dbFolderPath, "gymdb.sqlite");

export const AppDataSource = new DataSource({
    type: "sqlite",
    database: dbFilePath,
    synchronize: true,
    logging: false,
    entities: [Client, TrainingSession, Pass, PassType],
    migrations: [],
    subscribers: [],
})
