import "reflect-metadata"
import { DataSource } from "typeorm"
import { Client } from "../entities/Client"
import { Pass } from "../entities/Pass"
import { PassType } from "../entities/PassType"
import { TrainingSession } from "../entities/TrainingSession"


export const AppDataSource = new DataSource({
    type: "sqlite",
    database: "src/main/data/gymdb.sqlite",
    synchronize: true,
    logging: false,
    entities: [Client, TrainingSession, Pass, PassType],
    migrations: [],
    subscribers: [],
})
