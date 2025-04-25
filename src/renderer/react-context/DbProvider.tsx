import React from 'react'
import { ReactNode } from "react";
import { DbContext } from "./dbContext"
import { DataSource } from 'typeorm';
import { Client } from '../../main/entities/Client';
import { ClientManager } from '../ui-services/ClientManager';

interface DbProviderProps {
    children: ReactNode;
}

export const DbProvider: React.FC<DbProviderProps> = ({ children }) => {

    const clientManager = ClientManager.getInstance();

    const value = {
        clientManager
    }
    return (
        <DbContext.Provider value={value}>
            {children}
        </DbContext.Provider>
    )
}


