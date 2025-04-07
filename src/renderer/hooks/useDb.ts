import { useContext } from "react";
import { DbContext } from "../react-context/dbContext";

export const useDb = () => {
    const context = useContext(DbContext);
    if (!context) {
        throw new Error("DbContext must be used within an DbProvider")
    }
    return context;
}