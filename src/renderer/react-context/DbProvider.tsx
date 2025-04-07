import React from 'react'
import { ReactNode } from "react";
import { DbContext } from "./dbContext"
import { DataSource } from 'typeorm';
import { Client } from '../../main/entities/Client';

interface DbProviderProps{
    children: ReactNode;
}

export const DbProvider: React.FC<DbProviderProps> = ({ children }) => {

const value = {
    
}
    return(
        <DbContext.Provider value={value}>
            {children}
        </DbContext.Provider>
    )
}

    
