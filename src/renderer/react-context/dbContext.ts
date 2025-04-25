import React from 'react'
import { createContext } from "react";
import { Client } from '../../main/entities/Client';
import { ClientManager } from '../ui-services/ClientManager';

interface DbContextType{
   clientManager: ClientManager; 
}

export const DbContext = createContext<DbContextType | undefined>(undefined);