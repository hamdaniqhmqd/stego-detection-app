'use client';

import React, { ReactNode } from 'react';
import Navbar from './Header';
import Footer from './Footer';

type MainLayoutsProps = {
    children: ReactNode;
};

const MainLayouts: React.FC<MainLayoutsProps> = ({ children }) => {
    return (
        <>
            <Navbar />
            <main className="bg-white overflow-y-auto">
                {children}
            </main>
            <Footer />
        </>
    );
};

export default MainLayouts;