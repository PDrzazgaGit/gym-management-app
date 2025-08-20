import crypto from "crypto";
import fs from "fs";
import path from "path";
import { CardData } from "../data/CardData";
import { AppError } from "../data/AppError";
import { LoggerService } from "./LoggerService";

export class CryptoManager {
    private static instance: CryptoManager;
    private key: Buffer;

    private constructor(configPath: string) {
        let config: any = {};
        if (fs.existsSync(configPath)) {
            config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
        }

        // jeśli brak klucza, generujemy i zapisujemy do pliku
        if (!config.encryptionKey) {
            LoggerService.info("Nie znaleziono encryptionKey w config. Generuję nowy...")
            config.encryptionKey = CryptoManager.generateKey(configPath);
        }

        this.key = Buffer.from(config.encryptionKey, "hex");

        if (this.key.length !== 16) { // AES-128 = 16 bajtów
            throw new AppError("Klucz musi mieć 128 bitów (16 bajtów)", this.key);
        }
    }

    static getInstance(configPath?: string): CryptoManager {
        if (!CryptoManager.instance) {
            if (!configPath) {
                throw new AppError("CryptoManager nie zainicjalizowany. Podaj configPath przy pierwszym wywołaniu.");
            }
            CryptoManager.instance = new CryptoManager(configPath);
        }
        return CryptoManager.instance;
    }

    /** Zaszyfrowanie UUID do dokładnie 16 bajtów */
    public encryptCardData(data: CardData): Buffer {
        const cipher = crypto.createCipheriv("aes-128-ecb", this.key, null);
        cipher.setAutoPadding(false); // <-- ważne!
        const uuidBuffer = Buffer.from(data.uuid.replace(/-/g, ""), "hex");
        if (uuidBuffer.length !== 16) throw new Error("UUID musi mieć 16 bajtów");
        const encrypted = Buffer.concat([cipher.update(uuidBuffer), cipher.final()]);
        return encrypted; // teraz dokładnie 16 bajtów
    }

    /** Odszyfrowanie UUID */
    public decryptCardData(payload: Buffer): CardData {
        if (payload.length !== 16) throw new Error("Zaszyfrowane dane muszą mieć 16 bajtów");
        const decipher = crypto.createDecipheriv("aes-128-ecb", this.key, null);
        decipher.setAutoPadding(false); // <-- ważne!
        const decrypted = Buffer.concat([decipher.update(payload), decipher.final()]);
        const hex = decrypted.toString("hex");
        const uuid = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
        return { uuid } as CardData;
    }


    /** Generowanie nowego klucza 128-bitowego i zapis do config */
    static generateKey(configPath: string): string {
        const key = crypto.randomBytes(16).toString("hex"); // 16 bajtów = 128 bitów
        let config: any = {};

        if (fs.existsSync(configPath)) {
            config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
        }

        config.encryptionKey = key;
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf-8");

        return key;
    }
}
