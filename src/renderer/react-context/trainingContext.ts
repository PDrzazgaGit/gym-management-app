import React from 'react'
import { createContext } from "react";
import { TrainingSession } from '../../main/entities/TrainingSession';

export interface TrainingContextType {
 training: TrainingSession | null;
    setTraining: (training: TrainingSession | null) => void;
    elapsed: number;               // liczba sekund od startu
    elapsedFormatted: string;      // czas w formacie HH:MM:SS
}

export const trainingContext = createContext<TrainingContextType | undefined>(undefined);