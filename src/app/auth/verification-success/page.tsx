
import { Suspense } from 'react';
import MainLayouts from '@/components/Layouts/MainLayouts';
import VerificationSuccess from '@/components/Section/VerificationSuccess';

export default function VerificationSuccessPage() {
    return (
        <>
            {/* Header */}
            <MainLayouts>

                {/* FormRegister */}
                <Suspense fallback={<div></div>}>
                    <VerificationSuccess />
                </Suspense>

                {/* Footer */}
            </MainLayouts>
        </>
    );
}