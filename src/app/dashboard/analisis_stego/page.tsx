'use client';

import DashboardLayoutUsers from "@/components/Layouts/DashboardLayoutUsers";
import { useState } from "react";
import Image from "next/image";

export default function AnalisisStegoPage() {
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>("");
    const [selectedMethod, setSelectedMethod] = useState<string>("force-decode");
    const [useAI, setUseAI] = useState<boolean>(true);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();

        const file = e.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAnalyze = async () => {
        if (!selectedImage) {
            alert("Silakan pilih gambar terlebih dahulu!");
            return;
        }

        setIsAnalyzing(true);

        // Simulasi proses analisis
        // Nanti akan diimplementasikan dengan logic dari komponen upload
        setTimeout(() => {
            setIsAnalyzing(false);
            alert(`Analisis selesai!\nMetode: ${selectedMethod}\nGunakan AI: ${useAI ? 'Ya' : 'Tidak'}`);
        }, 2000);
    };

    const handleReset = () => {
        setSelectedImage(null);
        setPreviewUrl("");
        setSelectedMethod("force-decode");
        setUseAI(true);
    };

    return (
        <DashboardLayoutUsers>
            <section className="w-full min-h-screen pt-6 pb-12 px-4 lg:px-6">
                <div className="mb-8 text-center">
                    <div className="inline-flex items-center gap-3 mb-3">
                        <h1 className="text-2xl font-bold text-gray-50">Analisis Steganografi</h1>
                    </div>
                    <p className="text-gray-300 text-sm max-w-2xl mx-auto">
                        Deteksi penyisipan data tersembunyi pada gambar menggunakan teknik LSB steganalysis Force Decode yang memanfaatkan AI sebagai alat bantu Interpretasi
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 max-w-7xl mx-auto">
                    {/* Left Section - Upload Image */}
                    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow duration-300">
                        <div className="flex items-center gap-2 mb-5">
                            <h2 className="text-xl font-bold text-gray-800">Masukkan Gambar Disini</h2>
                        </div>

                        <div
                            className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-gray-500 hover:bg-gray-50/30 transition-all duration-200 cursor-pointer bg-gray-50 group"
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            onClick={() => document.getElementById('fileInput')?.click()}
                        >
                            {previewUrl ? (
                                <div className="relative w-full h-72">
                                    <img
                                        src={previewUrl}
                                        alt="Preview"
                                        className="w-full h-full object-contain rounded-xl"
                                    />
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleReset();
                                        }}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-lg hover:scale-110 transform duration-200"
                                        title="Hapus gambar"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                            ) : (
                                <div className="py-8">
                                    <div className="mb-4 flex justify-center">
                                        <div className="p-4 bg-gray-100 rounded-full group-hover:bg-gray-200 transition-colors">
                                            <svg className="h-16 w-16 text-gray-600" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                    </div>
                                    <p className="text-base text-gray-600 mb-2">
                                        <span className="font-semibold text-gray-700">Klik untuk upload</span> atau drag and drop
                                    </p>
                                    <p className="text-sm text-gray-500">Direkomendasikan menggunakan format <strong>PNG</strong></p>
                                    <p className="text-xs text-gray-400 mt-1">(Maksimal 5MB)</p>
                                </div>
                            )}
                        </div>

                        <input
                            id="fileInput"
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                        />

                        {selectedImage && (
                            <div className="mt-4 p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg border-l-4 border-gray-500">
                                <div className="flex items-start gap-3">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-800 truncate">{selectedImage.name}</p>
                                        <div className="flex items-center gap-4 mt-1">
                                            <p className="text-xs text-gray-600">
                                                <span className="font-medium">Ukuran:</span> {(selectedImage.size / 1024).toFixed(2)} KB
                                            </p>
                                            <p className="text-xs text-gray-600">
                                                <span className="font-medium">Tipe:</span> {selectedImage.type}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Section - Analysis Options */}
                    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                        {/* Metode Analisa */}
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-4">
                                <h2 className="text-xl font-bold text-gray-800">Pilih Metode Analisa</h2>
                            </div>

                            <div
                                className={`border-2 rounded-xl p-5 cursor-pointer transition-all duration-200 ${selectedMethod === 'force-decode'
                                    ? 'border-gray-500 bg-gray-50 shadow-md'
                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/30'
                                    }`}
                                onClick={() => setSelectedMethod('force-decode')}
                            >
                                <div className="flex items-start gap-3">
                                    <input
                                        type="radio"
                                        id="force-decode"
                                        name="method"
                                        value="force-decode"
                                        checked={selectedMethod === 'force-decode'}
                                        onChange={(e) => setSelectedMethod(e.target.value)}
                                        className="w-5 h-5 text-gray-600 focus:ring-gray-500 mt-0.5 cursor-pointer"
                                    />
                                    <label htmlFor="force-decode" className="flex-1 cursor-pointer">
                                        <span className="font-bold text-gray-800 text-lg block mb-1">Force Decode</span>
                                        {/* <p className="text-sm text-gray-600 leading-relaxed">
                                            Ekstraksi pesan tersembunyi menggunakan algoritma LSB tanpa memerlukan kunci atau password
                                        </p> */}
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Interpretasi AI */}
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-4">
                                <h2 className="text-xl font-bold text-gray-800">Interpretasi Dengan AI?</h2>
                            </div>

                            <div className="space-y-3">
                                {/* Ya - Gunakan AI */}
                                <div
                                    className={`border-2 rounded-xl p-5 cursor-pointer transition-all duration-200 ${useAI
                                        ? 'border-gray-500 bg-gray-50 shadow-md'
                                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/30'
                                        }`}
                                    onClick={() => setUseAI(true)}
                                >
                                    <div className="flex items-start gap-3">
                                        <input
                                            type="radio"
                                            id="ai-yes"
                                            name="ai"
                                            checked={useAI}
                                            onChange={() => setUseAI(true)}
                                            className="w-5 h-5 text-gray-600 focus:ring-gray-500 mt-0.5 cursor-pointer"
                                        />
                                        <label htmlFor="ai-yes" className="flex-1 cursor-pointer">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-bold text-gray-800 text-lg">Ya, Gunakan AI</span>
                                                {/* <span className="px-2 py-0.5 bg-gray-200 text-gray-800 text-xs font-semibold rounded-full">
                                                    Direkomendasikan
                                                </span> */}
                                            </div>
                                            {/* <p className="text-sm text-gray-600 leading-relaxed">
                                                Analisis mendalam dengan interpretasi AI untuk memahami konteks dan makna dari data yang diekstrak
                                            </p> */}
                                        </label>
                                    </div>
                                </div>

                                {/* Tidak - Tanpa AI */}
                                <div
                                    className={`border-2 rounded-xl p-5 cursor-pointer transition-all duration-200 ${!useAI
                                        ? 'border-gray-500 bg-gray-50 shadow-md'
                                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/30'
                                        }`}
                                    onClick={() => setUseAI(false)}
                                >
                                    <div className="flex items-start gap-3">
                                        <input
                                            type="radio"
                                            id="ai-no"
                                            name="ai"
                                            checked={!useAI}
                                            onChange={() => setUseAI(false)}
                                            className="w-5 h-5 text-gray-600 focus:ring-gray-500 mt-0.5 cursor-pointer"
                                        />
                                        <label htmlFor="ai-no" className="flex-1 cursor-pointer">
                                            <span className="font-bold text-gray-800 text-lg block mb-1">Tidak, Hanya Decode</span>
                                            {/* <p className="text-sm text-gray-600 leading-relaxed">
                                                Hanya menampilkan hasil ekstraksi data mentah tanpa interpretasi tambahan
                                            </p> */}
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Analyze Button */}
                        <button
                            onClick={handleAnalyze}
                            disabled={!selectedImage || isAnalyzing}
                            className={`w-full py-4 px-6 rounded-xl font-bold text-white text-lg transition-all duration-200 shadow-lg ${!selectedImage || isAnalyzing
                                ? 'bg-gray-400 cursor-not-allowed shadow-none'
                                : 'bg-gray-600 hover:bg-gray-700 active:scale-95 hover:shadow-xl'
                                }`}
                        >
                            {isAnalyzing ? (
                                <span className="flex items-center justify-center gap-3">
                                    <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Menganalisis Gambar...</span>
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    Analisa Gambar
                                </span>
                            )}
                        </button>

                        {/* Info Box */}
                        <div className="hidden mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg">
                            <div className="flex gap-3">
                                <svg className="h-6 w-6 text-blue-500 flex-shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                                <div>
                                    <h3 className="text-sm font-bold text-blue-900 mb-1">Informasi Penting</h3>
                                    <p className="text-sm text-blue-800 leading-relaxed">
                                        Force Decode menggunakan algoritma LSB untuk ekstraksi cepat. Interpretasi AI memberikan analisis mendalam menggunakan Gemini 1.5 Flash untuk memahami konteks data yang ditemukan.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </DashboardLayoutUsers>
    );
}