import React from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { App } from './App';
import { Clients } from './components/pages/Clients';
import { Home } from './components/pages/Home';

export const AppRouter = () => {
    return (
        <HashRouter>
            <Routes>
                <Route path="/" element={<App />}>
                    <Route index element={<Navigate to="/home" />} />
                    <Route path="home" element={<Home/>} />
                    <Route path="clients" element={<Clients />} />
                    <Route path="passes" element={<></>} />
                    <Route path="workouts" element={<></>} />
                </Route>
            </Routes>
        </HashRouter>
    )
}