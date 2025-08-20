import { Card } from "nfc-pcsc";
import { CardData } from "../../main/data/CardData";

export class ACRManagerAPI {
  private static instance: ACRManagerAPI;

  private constructor() {}

  public static getInstance(): ACRManagerAPI {
    if (!ACRManagerAPI.instance) {
      ACRManagerAPI.instance = new ACRManagerAPI();
    }
    return ACRManagerAPI.instance;
  }

  /** Sprawdza, czy czytnik jest podłączony */
  public async isAvailable(): Promise<boolean> {
    return await window.api.acrManager.isAvailable();
  }

  /** Odczyt danych z karty */
  public async read(): Promise<CardData> {
    return await window.api.acrManager.read();
  }

  /** Zapis danych na karcie */
  public async write(data: CardData): Promise<void> {
    return await window.api.acrManager.write(data);
  }

  // === EVENTS ===
  public onReaderConnected(callback: (name: string) => void): void {
    window.api.acrManager.onReaderConnected(callback);
  }

  public offReaderConnected(callback: (name: string) => void): void {
    window.api.acrManager.offReaderConnected(callback);
  }

  public onReaderDisconnected(callback: (name: string) => void): void {
    window.api.acrManager.onReaderDisconnected(callback);
  }

  public offReaderDisconnected(callback: (name: string) => void): void {
    window.api.acrManager.offReaderDisconnected(callback);
  }

  public onCardInserted(callback: (card: Card) => void): void {
    window.api.acrManager.onCardInserted(callback);
  }

  public offCardInserted(callback: (card: Card) => void): void {
    window.api.acrManager.offCardInserted(callback);
  }

  public onCardRemoved(callback: (card: Card) => void): void {
    window.api.acrManager.onCardRemoved(callback);
  }

  public offCardRemoved(callback: (card: Card) => void): void {
    window.api.acrManager.offCardRemoved(callback);
  }

  public onReaderError(callback: (err: any) => void): void {
    window.api.acrManager.onReaderError(callback);
  }

  public offReaderError(callback: (err: any) => void): void {
    window.api.acrManager.offReaderError(callback);
  }
}

