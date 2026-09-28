import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import AppRouter from './AppRouter';
import { AuthProvider } from './components/AuthContext';
import { AlertsBadgeProvider } from './components/AlertsBadgeContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <AlertsBadgeProvider>
                    <AppRouter />
                </AlertsBadgeProvider>
            </AuthProvider>
        </BrowserRouter>
    </React.StrictMode>
);
