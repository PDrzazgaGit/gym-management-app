import React from "react";
import { Outlet } from "react-router-dom";
import { ClientProvider } from "../react-context/ClientProvider";

export const ClientLayout = () => {
    return (
        <ClientProvider>
            <Outlet />
        </ClientProvider>
    );
};
