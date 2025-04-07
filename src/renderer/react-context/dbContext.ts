import React from 'react'
import { createContext } from "react";
import { Client } from '../../main/entities/Client';

interface DbContextType{

}

export const DbContext = createContext<DbContextType | undefined>(undefined);