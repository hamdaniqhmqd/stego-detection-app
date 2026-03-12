
import MainLayouts from '@/components/Layouts/MainLayouts';
import { Suspense } from 'react';
import ResendVerification from './section/ResendVerification';

export default function ResendVerificationPage() {
    return (
        <>
            {/* Header */}
            <MainLayouts>

                {/* FormRegister */}
                <Suspense fallback={<div></div>}>
                    <ResendVerification />
                </Suspense>

                {/* Footer */}
            </MainLayouts>
        </>
    );
}