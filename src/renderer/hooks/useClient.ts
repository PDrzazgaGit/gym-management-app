import { useContext } from "react";
import { clientContext } from "../react-context/clientContext";

export const useClient = () => {
    const context = useContext(clientContext);
    if (!context) {
        throw new Error("ClientContext must be used within an ClientProvider")
    }
    return context;
}