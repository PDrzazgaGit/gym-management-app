import { useContext } from "react";
import { trainingContext } from "../react-context/trainingContext";

export const useTraining = () => {
    const context = useContext(trainingContext);
    if (!context) {
        throw new Error("TrainingContext must be used within an TrainingProvider")
    }
    return context;
}