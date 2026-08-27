import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

const MainLayout: React.FC = () => {
    return (
        <div className="min-h-screen flex flex-col dark:bg-neutral-900 transition-colors duration-200">
            <Navbar />
            <main className="flex-1">
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default MainLayout;
