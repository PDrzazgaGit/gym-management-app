import React from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { App } from './App';
import { Clients } from './components/pages/Clients';

export const AppRouter = () => {
    return (
        <HashRouter>
            <Routes>
                <Route path="/" element={<App />}>
                    <Route index element={<Navigate to="/clients" />} />
                    <Route path="clients" element={<Clients />} />
                    <Route path="passes" element={<></>} />
                    <Route path="workouts" element={<></>} />
                </Route>
            </Routes>
        </HashRouter>
    )
}