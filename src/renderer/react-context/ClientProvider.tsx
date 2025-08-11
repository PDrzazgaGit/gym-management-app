import React, { useState } from 'react'
import { ReactNode } from "react";
import { clientContext } from "./clientContext"
import { DataSource } from 'typeorm';
import { Client } from '../../main/entities/Client';
import { ClientManager } from '../ui-services/ClientManager';

interface ClientProviderProps {
    children: ReactNode;
}

export const ClientProvider: React.FC<ClientProviderProps> = ({ children }) => {

    const [client, setClient] = useState<undefined | Client>();

    const value = {
        client, setClient
    }
    return (
        <clientContext.Provider value={value}>
            {children}
        </clientContext.Provider>
    )
}


