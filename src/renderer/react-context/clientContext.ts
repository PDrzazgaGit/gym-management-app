import React from 'react'
import { createContext } from "react";
import { Client } from '../../main/entities/Client';

interface ClientContextType{
   client? :Client;
   setClient: (client: Client | undefined) => void;
}

export const clientContext = createContext<ClientContextType | undefined>(undefined);