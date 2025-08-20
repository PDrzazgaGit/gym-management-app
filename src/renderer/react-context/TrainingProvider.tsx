import React, { useState, useEffect, useRef } from 'react';
import { ReactNode } from "react";
import { trainingContext } from "./trainingContext";
import { TrainingSession } from '../../main/entities/TrainingSession';
import { TrainingSessionManager } from '../ui-services/TrainingSessionManager';
import { TrainingSessionStatus } from '../../main/enums/TrainingSessionStatus';

interface TrainingProviderProps {
    children: ReactNode;
}

// Pomocnicza funkcja do formatowania sekund -> HH:MM:SS
const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const mins = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
};

export const TrainingProvider: React.FC<TrainingProviderProps> = ({ children }) => {
    const [training, setTraining] = useState<TrainingSession | null>(null);
    const [elapsed, setElapsed] = useState<number>(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // Czyści poprzedni interwał
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        if (training && training.status === TrainingSessionStatus.IN_PROGRESS && training.startsAt) {
            const start = new Date(training.startsAt).getTime();

            // Ustawiamy początkową wartość
            setElapsed(Math.floor((Date.now() - start) / 1000));

            // Odliczanie co sekundę
            intervalRef.current = setInterval(() => {
                setElapsed(Math.floor((Date.now() - start) / 1000));
            }, 1000);
        } else {
            setElapsed(0);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [training]);

    const value = {
        training,
        setTraining,
        elapsed,
        elapsedFormatted: formatTime(elapsed),
    };

    return (
        <trainingContext.Provider value={value}>
            {children}
        </trainingContext.Provider>
    );
};
