import { useContext } from "react";
import { acrContext } from "../react-context/acrContext";

export const useAcr = () => {
    const context = useContext(acrContext);
    if (!context) {
        throw new Error("AcrContext must be used within an AcrProvider")
    }
    return context;
}