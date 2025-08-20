import { Card } from "nfc-pcsc";
import { CardData } from "../../main/data/CardData";
import { ACRManagerAPI } from "../ui-services/ACRManagerAPI";
import { acrContext } from "./acrContext";
import React, { ReactNode, useEffect, useRef, useState } from "react";

type AcrMode = "idle" | "read" | "write";

interface AcrProviderProps {
  children: ReactNode;
}

type BeforeWriteCheck = (previousData: CardData | null, setWriteData: (d: CardData | null) => void) => Promise<boolean>;

export const AcrProvider: React.FC<AcrProviderProps> = ({ children }) => {
  const [cardData, setCardData] = useState<CardData | null>(null);
  const [previousCardData, setPreviousCardData] = useState<CardData | null>(null);
  const [isCardPresent, setIsCardPresent] = useState(false);
  const [isReaderConnected, setIsReaderConnected] = useState(false);
  const [acrError, setError] = useState<string | null>(null);

  const [mode, _setMode] = useState<AcrMode>("idle");

  const modeRef = useRef<AcrMode>("idle");
  const writeDataRef = useRef<CardData | null>(null);
  const beforeWriteRef = useRef<BeforeWriteCheck | null>(null);

  const setMode = (m: AcrMode) => {
    modeRef.current = m;
    _setMode(m);
  };

  const setWriteData = (d: CardData | null) => {
    writeDataRef.current = d;
  };

  const setBeforeWriteCheck = (cb: BeforeWriteCheck | null) => {
    beforeWriteRef.current = cb;
  };

  const acrRef = useRef<ACRManagerAPI>(ACRManagerAPI.getInstance());

  const clearError = () => setError(null);

  // sprawdzenie czytnika przy starcie
  useEffect(() => {
    const checkReader = async () => {
      try {
        const available = await acrRef.current.isAvailable();
        setIsReaderConnected(available);
      } catch (err: any) {
        setIsReaderConnected(false);
        setError(err.message || String(err));
      }
    };
    checkReader();
  }, []);

  useEffect(() => {
    const acr = acrRef.current;

    const handleCardInserted = async (card: Card) => {
      setIsCardPresent(true);

      const currentMode = modeRef.current;

      console.log("Aktualny tryb:", currentMode);

      if (currentMode === "idle") {
        console.log("Karta przyłożona, ale tryb = idle → ignoruję");
        return;
      }

      try {
        if (currentMode === "read") {
          const data = await acr.read();
          console.log("Odczytano kartę", card.standard);
          setCardData(data);
        } else if (currentMode === "write") {
          const previousData = await acr.read();
          setPreviousCardData(previousData);
          
          if (beforeWriteRef.current) {
            const allowed = await beforeWriteRef.current(previousData, setWriteData);
            if (!allowed) {
              setError("Nie można zapisać na tej karcie. Należy do kogoś innego.");
              return;
            }
          }
         const currentWriteData = writeDataRef.current;
          if (currentWriteData) {
            
            await acr.write(currentWriteData);
            console.log("Zapisano kartę", card.standard);
            setCardData(currentWriteData);
          }

        }
        setError(null);
      } catch (err: any) {
        setError(err.message);
        setCardData(null);
        setPreviousCardData(null);
      }
    };

    const handleCardRemoved = () => {
      setIsCardPresent(false);
      setCardData(null);
      setPreviousCardData(null);
    };

    const handleReaderConnected = () => setIsReaderConnected(true);
    const handleReaderDisconnected = () => {
      setIsReaderConnected(false);
      setIsCardPresent(false);
      setCardData(null);
      setPreviousCardData(null);
    };
    const handleError = (err: any) => setError(err.message || String(err));

    acr.onCardInserted(handleCardInserted);
    acr.onCardRemoved(handleCardRemoved);
    acr.onReaderConnected(handleReaderConnected);
    acr.onReaderDisconnected(handleReaderDisconnected);
    acr.onReaderError(handleError);

    console.log("Zamontowano globalny ACRProvider");

    return () => {
      console.log("Odmontowano globalny ACRProvider");
      acr.offCardInserted(handleCardInserted);
      acr.offCardRemoved(handleCardRemoved);
      acr.offReaderConnected(handleReaderConnected);
      acr.offReaderDisconnected(handleReaderDisconnected);
      acr.offReaderError(handleError);
    };
  }, []);

  const value = {
    cardData,
    isCardPresent,
    isReaderConnected,
    acrError,
    clearError,
    mode,
    setMode,
    setWriteData,
    previousCardData,
    setBeforeWriteCheck, // <-- expose do modala / innych komponentów
  };

  return <acrContext.Provider value={value}>{children}</acrContext.Provider>;
};
