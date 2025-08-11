import React from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { App } from './App';
import { Clients } from './components/pages/Clients';
import { Home } from './components/pages/Home';
import { PassTypes } from './components/pages/PassTypes';
import { Trainings } from './components/pages/Trainings';
import { ClientPage } from './components/pages/ClientPage';

export const AppRouter = () => {
    return (
        <HashRouter>
            <Routes>
                <Route path="/" element={<App />}>
                    <Route index element={<Navigate to="/home" />} />
                    <Route path="home" element={<Home/>} />
                    <Route path="clients" element={<Clients />} />
                    <Route path="passes" element={<PassTypes></PassTypes>} />
                    <Route path="trainings" element={<Trainings></Trainings>} />
                    <Route path="clientpanel" element={<ClientPage></ClientPage>} />
                </Route>
            </Routes>
        </HashRouter>
    )
}