import React from 'react';
import {createRoot} from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import { App } from './App';
import './index.css';

const root = createRoot(document.body);
root.render(<App/>);