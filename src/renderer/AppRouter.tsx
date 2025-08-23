import React from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { App } from './App';
import { Clients } from './components/pages/Clients';
import { PassTypes } from './components/pages/PassTypes';
import { Trainings } from './components/pages/Trainings';
import { ClientPage } from './components/pages/ClientPage';
import { Start } from './components/pages/Start';
import { ClientLayout } from './components/ClientRouteLayout';
import { Settings } from './components/pages/Settings';

export const AppRouter = () => {
    return (
        
        <HashRouter>
            
            <Routes>
                <Route path="/" element={<App />}>
                    <Route index element={<Navigate to="/start" />} />
                    <Route path="start" element={
                         <Start />
                    } />
                    <Route path="passes" element={<PassTypes></PassTypes>} />
                    <Route element={<ClientLayout />}>
                        <Route path="trainings" element={<Trainings></Trainings>} />
                        <Route path="clients" element={<Clients />} />
                        <Route path="clientpanel" element={<ClientPage />} />
                    </Route>
                    <Route path="settings" element={<Settings></Settings>} />
                </Route>
            </Routes>
        </HashRouter>
    )
}