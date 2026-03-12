import MainLayouts from '@/components/Layouts/MainLayouts';
import { Suspense } from 'react';
import VerificationFailed from '@/components/Section/VerificationFailedContent';

export default function VerificationFailedPage() {
    return (
        <>
            {/* Header */}
            <MainLayouts>

                {/* FormRegister */}
                <Suspense fallback={
                    <div className="min-h-screen flex items-center justify-center">
                        <div className="text-center">Loading...</div>
                    </div>
                }>
                    <VerificationFailed />
                </Suspense>

                {/* Footer */}
            </MainLayouts>
        </>
    );
}