import { createContext } from "react";
import { CardData } from '../../main/data/CardData';

type AcrMode = "idle" | "read" | "write";
type BeforeWriteCheck = (previousData: CardData | null, setWriteData: (d: CardData | null) => void) => Promise<boolean>;

export interface AcrContextType {
  cardData: CardData | null;
  isCardPresent: boolean;
  isReaderConnected: boolean;
  acrError: string | null;
  clearError: () => void;
  mode: AcrMode;
  setMode: (mode: AcrMode) => void;
  setWriteData: (data: CardData | null) => void;
  /**
   * Funkcja pozwalająca ustawić callback, który będzie wywołany
   * przed zapisem na karcie. Callback powinien zwrócić Promise<boolean>,
   * gdzie false oznacza zablokowanie zapisu.
   */
  setBeforeWriteCheck: (cb: BeforeWriteCheck | null) => void;
}

export const acrContext = createContext<AcrContextType | undefined>(undefined);