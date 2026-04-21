'use client';

import DashboardLayoutUsers from "@/components/Layouts/DashboardLayoutUsers";
import InputAnalisis from "../../../components/Section/InputAnalisis";
import { useState } from "react";
import { useAuth } from "@/provider/AuthProvider";
import { AuthUser } from "@/types/Users";

export default function AnalisisStegoPage() {
    const { user } = useAuth();

    const [loadingStep, setLoadingStep] = useState<string>('')
    const [isLoading, setIsLoading] = useState(false)

    const handleLoading = (loading: boolean, step: string) => {
        setIsLoading(loading)
        setLoadingStep(step)
    }

    return (
        <DashboardLayoutUsers>
            <section className="w-full min-h-screen">
                <div className="space-y-4 pb-10 lg:pb-16 lg:pt-8 sm:pb-10 sm:pt-5">
                    <div className="mb-8 text-center">
                        <div className="inline-flex items-center gap-3 mb-3">
                            <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-neutral-900">Analisis Steganografi</h1>
                        </div>
                        <p className="text-neutral-600 text-sm md:w-2/3 mx-auto">
                            Deteksi penyisipan data tersembunyi pada gambar menggunakan teknik steganalysis Force Decode LSB yang memanfaatkan AI sebagai alat bantu Interpretasi
                        </p>
                    </div>

                    {/* InputAnalisis */}
                    <InputAnalisis user={user as AuthUser} onLoading={handleLoading} />

                    {/* Loading indicator global */}
                    {!isLoading && loadingStep && (
                        <div className="flex items-center gap-3 px-5 py-3 rounded-sm bg-neutral-100 border border-neutral-800 max-w-7xl mx-auto">
                            <svg className="animate-spin h-4 w-4 text-neutral-950 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                            </svg>
                            <span className="text-sm text-neutral-900">{loadingStep}</span>
                        </div>
                    )}
                </div>
            </section>
        </DashboardLayoutUsers>
    );
}