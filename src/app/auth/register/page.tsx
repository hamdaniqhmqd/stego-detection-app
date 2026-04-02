import FormRegister from '@/components/Section/FormRegister';
import MainLayouts from '@/components/Layouts/MainLayouts';
import { Suspense } from 'react';

export default function Register() {
  return (
    <>
      {/* Header */}
      <MainLayouts>

        {/* FormRegister */}
        <Suspense fallback={<div></div>}>
          <FormRegister />
        </Suspense>

        {/* Footer */}
      </MainLayouts>
    </>
  );
}