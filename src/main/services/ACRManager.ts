import { NFC, Reader, KEY_TYPE_B } from "nfc-pcsc";
import { CryptoManager } from "./CryptoManager";
import { CardData } from "../data/CardData";
import { EventEmitter } from "stream";
import { AppError } from "../data/AppError";

export class ACRManager extends EventEmitter {
  private static instance: ACRManager;
  private nfc: NFC;
  private reader: Reader | null = null;
  private crypto: CryptoManager;

  /** Prywatny konstruktor */
  private constructor(cryptoManager: CryptoManager) {
    super();
    this.crypto = cryptoManager;
    this.nfc = new NFC();

    // nasłuchiwanie czytnika
    this.nfc.on("reader", (reader) => {
      //console.log(`Czytnik wykryty: ${reader.name}`);
      this.reader = reader;
      this.emit("reader-connected", reader.name);

      reader.on("end", () => {
        //console.log(`Czytnik ${reader.name} został odłączony`);
        this.emit("reader-disconnected", reader.name);
        this.reader = null;
      });

      reader.on("card", (card) => {
        this.emit("card-inserted", card);
      });

      reader.on("card.off", (card) => {
        this.emit("card-removed", card);
      });

      reader.on("error", (err) => {
        //console.error(`Błąd czytnika ${reader.name}:`, err);
        this.emit("reader-error", `Błąd czytnika ${reader.name}: ${err}`);
        this.reader = null;
      });
    });

    this.nfc.on("error", (err) => {
      this.emit("reader-error", err);
    });
  }

  /** Pobranie instancji singletona */
  static getInstance(cryptoManager: CryptoManager): ACRManager {
    if (!ACRManager.instance) {
      ACRManager.instance = new ACRManager(cryptoManager);
    }
    return ACRManager.instance;
  }

  /** Sprawdza, czy czytnik jest podłączony */
  isAvailable(): boolean {
    return this.reader !== null;
  }

  /** Odczyt danych z karty */

  /** Odczyt danych z karty */
  async read(): Promise<CardData> {
    if (!this.reader) throw new AppError("Czytnik nie jest dostępny");

    try {
      const blockNumber = 1; // zapisujemy UUID w pierwszym bloku danych (po UID)

      // autoryzacja Key B
      const authorized = await this.reader.authenticate(blockNumber, KEY_TYPE_B, 'ffffffffffff');
      if (!authorized) throw new Error(`Nie udało się uwierzytelnić bloku ${blockNumber}`);

      const data = await this.reader.read(blockNumber, 16); // 16 bajtów
      return this.crypto.decryptCardData(data);

    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Błąd odczytu karty.`, error);
    }
  }

  /** Zapis danych na karcie */
  async write(data: CardData): Promise<void> {
    if (!this.reader) throw new AppError("Czytnik nie jest dostępny");

    try {
      const encrypted = this.crypto.encryptCardData(data); // Buffer 16 bajtów
      const blockNumber = 1; // zapisujemy w pierwszym bloku danych

      const authorized = await this.reader.authenticate(blockNumber, KEY_TYPE_B, 'ffffffffffff');
      if (!authorized) throw new AppError(`Nie udało się uwierzytelnić bloku danych.`, blockNumber);

      await this.reader.write(blockNumber, encrypted, 16); // zapis 16 bajtów

    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Błąd zapisu karty.`, error);
    }
  }

}