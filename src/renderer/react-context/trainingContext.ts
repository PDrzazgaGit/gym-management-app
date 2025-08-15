import React from 'react'
import { createContext } from "react";
import { TrainingSession } from '../../main/entities/TrainingSession';

export interface TrainingContextType {
    training?: TrainingSession;
    setTraining: (training: TrainingSession | undefined) => void;

    startTraining: () => Promise<void>;
    stopTraining: () => Promise<void>;

    elapsedTime: number;                // liczba sekund od startu
    formattedElapsedTime: string;       // format hh:mm:ss
    startTime: Date | null;              // moment rozpoczęcia
}

export const trainingContext = createContext<TrainingContextType | undefined>(undefined);