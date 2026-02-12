'use client';

import { Suspense } from 'react';
import CheckEmailContent from './section/CheckEmailContent';
import MainLayouts from '@/components/Layouts/MainLayouts';

export default function CheckEmail() {
    return (
        <MainLayouts>

            <Suspense fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">Loading...</div>
                </div>
            }>
                <CheckEmailContent />
            </Suspense>
            );

        </MainLayouts>
    )
}