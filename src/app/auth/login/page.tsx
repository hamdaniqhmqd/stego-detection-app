'use client';

import MainLayouts from '@/components/Layouts/MainLayouts';
import FormLogin from './section/FormLogin';
import { Suspense } from 'react';

export default function Home() {
    return (
        <>
            {/* Header */}
            <MainLayouts>

                {/* FormLogin */}
                <Suspense fallback={<div></div>}>
                    <FormLogin />
                </Suspense>

                {/* Footer */}
            </MainLayouts>
        </>
    );
}
