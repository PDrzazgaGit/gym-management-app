import React, { useState, useEffect, useRef } from 'react';
import { ReactNode } from "react";
import { trainingContext } from "./trainingContext";
import { TrainingSession } from '../../main/entities/TrainingSession';
import { TrainingSessionManager } from '../ui-services/TrainingSessionManager';

interface TrainingProviderProps {
    children: ReactNode;
}

export const TrainingProvider: React.FC<TrainingProviderProps> = ({ children }) => {
    const [training, setTraining] = useState<TrainingSession | undefined>();
    const [elapsedTime, setElapsedTime] = useState(0); // sekundy od startu
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const [startTime, setStartTime] = useState<Date | null>(null);

    const trainingManager = TrainingSessionManager.getInstance();

    // Start treningu
    const startTraining = async () => {
        if (!training) return;

        await trainingManager.start(training.id);

        const now = new Date();
        setStartTime(now);
        setElapsedTime(0);

        // Odświeżanie co 1s
        timerRef.current = setInterval(() => {
            setElapsedTime(Math.floor((new Date().getTime() - now.getTime()) / 1000));
        }, 1000);
    };

    // Stop treningu
    const stopTraining = async () => {
        if (!training) return;

        await trainingManager.end(training.id); 
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    // Czyścimy timer przy odmontowaniu
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    // Funkcja formatująca hh:mm:ss
    const formatTime = (totalSeconds: number) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };

    const value = {
        training,
        setTraining,
        startTraining,
        stopTraining,
        elapsedTime, // liczba sekund
        formattedElapsedTime: formatTime(elapsedTime), // gotowy string
        startTime
    };

    return (
        <trainingContext.Provider value={value}>
            {children}
        </trainingContext.Provider>
    );
};
