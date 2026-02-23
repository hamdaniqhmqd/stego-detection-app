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
            <main className="bg-neutral-100 overflow-y-auto min-h-screen">
                {children}
            </main>
            <Footer />
        </>
    );
};

export default MainLayouts;