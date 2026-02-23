'use client';

import { useState, useRef, useEffect } from 'react';
import DashboardLayoutUsers from '@/components/Layouts/DashboardLayoutUsers';
import { useAuth } from '@/provider/AuthProvider';
import bcrypt from 'bcryptjs';
import supabaseAnonKey from '@/libs/supabase/anon_key';

export default function ProfilePage() {
    const { user, refreshUser } = useAuth();
    // console.log('ProfilePage - User:', user);

    // Form state — diisi dari useAuth langsung
    const [fullname, setFullname] = useState(user?.fullname ?? '');
    const [photoPreview, setPhotoPreview] = useState(user?.photo ?? null);
    const [photoFile, setPhotoFile] = useState<File | null>(null);

    // Save state
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    // Delete modal state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!user) return;
        setFullname(user.fullname ?? '');
        setPhotoPreview(user.photo ?? null);
    }, [user]);

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setPhotoFile(file);
        // Hanya untuk preview lokal, TIDAK disimpan ke DB
        setPhotoPreview(URL.createObjectURL(file));
    };

    const uploadPhoto = async (file: File): Promise<string | null> => {
        if (file.size > 5 * 1024 * 1024) {
            setSaveError('Ukuran file melebihi 5MB');
            return null;
        }

        // Sanitasi nama file: hapus spasi & karakter aneh agar URL aman
        const safeName = file.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');

        // Path di dalam bucket "stego-images", folder "user_photo"
        const filePath = `user_photo/${user?.id}-${Date.now()}-${safeName}`;

        // Upload file ke Supabase Storage
        const { error: uploadError } = await supabaseAnonKey.storage
            .from('stego-images')
            .upload(filePath, file, {
                contentType: file.type,
                upsert: true,
            });

        if (uploadError) {
            setSaveError('Gagal upload foto: ' + uploadError.message);
            return null;
        }

        // Ambil public URL — getPublicUrl TIDAK async, langsung return data
        const { data } = supabaseAnonKey.storage
            .from('stego-images')
            .getPublicUrl(filePath);

        if (!data?.publicUrl) {
            setSaveError('Gagal mendapatkan URL foto.');
            return null;
        }

        // Pastikan URL yang dikembalikan adalah Supabase URL, bukan blob/base64
        const publicUrl = data.publicUrl;
        if (!publicUrl.startsWith('https://')) {
            setSaveError('URL foto tidak valid: ' + publicUrl);
            return null;
        }

        return publicUrl;
    };

    const handleSave = async () => {
        if (!user) return;

        const fullnameChanged = fullname !== (user.fullname ?? '');
        const photoChanged = photoFile !== null;

        if (!fullnameChanged && !photoChanged) {
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 2500);
            return;
        }

        setIsSaving(true);
        setSaveError(null);
        setSaveSuccess(false);

        try {
            const updatePayload: Record<string, string> = {};

            if (fullnameChanged) {
                updatePayload.fullname = fullname;
            }

            if (photoChanged && photoFile) {
                const photoUrl = await uploadPhoto(photoFile);
                // console.log('Photo URL:', photoUrl);
                if (!photoUrl) {
                    // uploadPhoto sudah set error, hentikan proses
                    setIsSaving(false);
                    return;
                }
                updatePayload.photo = photoUrl;

                // Update preview ke Supabase URL agar konsisten
                setPhotoPreview(photoUrl);
            }
            // console.log('Update payload:', updatePayload);

            // Simpan ke tabel users
            const { data, error } = await supabaseAnonKey
                .from('users')
                .update({
                    ...updatePayload,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', user.id)
                .select()
                .single();

            console.log('Update data:', data);

            if (error) {
                console.error('Save error:', error);
            };

            // Reset file state setelah berhasil
            setPhotoFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';

            setSaveSuccess(true);
            await refreshUser();
            setTimeout(() => setSaveSuccess(false), 2500);
        } catch (err) {
            console.error('Save error:', err);
            setSaveError('Gagal menyimpan perubahan. Coba lagi.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!deletePassword || !user) return;

        setIsDeleting(true);
        setDeleteError(null);

        try {
            const { data: userData, error: userError } = await supabaseAnonKey
                .from('users')
                .select('password')
                .eq('id', user.id)
                .single();

            if (userError || !userData) throw new Error('Gagal mengambil data user.');

            const isMatch = await bcrypt.compare(deletePassword, userData.password);
            if (!isMatch) throw new Error('Password salah.');

            const { error: deleteError } = await supabaseAnonKey
                .from('users')
                .update({
                    deleted_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                })
                .eq('id', user.id);

            if (deleteError) throw deleteError;
        } catch (err: any) {
            console.error('Delete error:', err);
            setDeleteError(err?.message ?? 'Terjadi kesalahan. Coba lagi.');
        } finally {
            setIsDeleting(false);
        }
    };

    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setDeletePassword('');
        setDeleteError(null);
        setShowPassword(false);
    };

    return (
        <DashboardLayoutUsers>
            <section className=" flex items-center justify-center lg:py-12 md:py-12 py-10">
                <div className="
                    w-full max-w-2xl bg-neutral-100 rounded-md 
                    border border-neutral-700 p-8
                    shadow-[-10px_10px_0_rgba(26,26,46,1)]
                ">

                    {/* Avatar */}
                    <div className="flex flex-col items-center gap-1 mb-4">
                        <button
                            className="relative w-24 h-24 rounded-full focus:outline-none group mb-1"
                            onClick={() => fileInputRef.current?.click()}
                            type="button"
                        >
                            {photoPreview ? (
                                <img
                                    src={photoPreview ?? user?.photo}
                                    alt="Foto profil"
                                    className="w-24 h-24 rounded-full object-cover border-2 border-neutral-500"
                                />
                            ) : (
                                <img
                                    src={`https://ui-avatars.com/api/?name=${user?.username}&background=random&size=256`}
                                    alt="Foto profil"
                                    className="w-24 h-24 rounded-full object-cover border-2 border-neutral-500"
                                />
                            )}
                            <span className="absolute inset-0 rounded-full bg-neutral-900/30
                                flex items-center justify-center opacity-0 
                                group-hover:opacity-100 border border-neutral-900
                                transition-all duration-300 ease-in-out
                                ">
                                <svg className="text-white w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                                </svg>
                            </span>
                        </button>
                        <span className="text-xs text-neutral-600">Klik untuk ganti foto</span>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handlePhotoChange}
                        />
                    </div>

                    {/* Heading */}
                    <h2 className="text-center text-lg md:text-xl lg:text-2xl font-semibold text-neutral-900 mb-6">Edit Profil</h2>

                    {/* Form */}
                    <div className="space-y-4 mb-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-neutral-800 tracking-wide mb-2">Username</label>
                                <input
                                    className="w-full px-3 py-3 rounded-md border border-neutral-600 bg-neutral-200 text-sm text-neutral-900 cursor-not-allowed"
                                    value={user?.username ?? ''}
                                    disabled
                                    readOnly />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-neutral-800 tracking-wide mb-2">Email</label>
                                <input
                                    className="w-full px-3 py-3 rounded-md border border-neutral-600 bg-neutral-200 text-sm text-neutral-900 cursor-not-allowed"
                                    value={user?.email ?? ''}
                                    disabled
                                    readOnly />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-neutral-800 tracking-wide mb-2">Nama Lengkap</label>
                            <input
                                className="w-full px-3 py-3 rounded-md border border-neutral-600 bg-neutral-100 text-sm text-neutral-900 outline-none focus:border-neutral-500 focus:ring-2 focus:ring-neutral-500/10 transition"
                                placeholder="Masukkan nama lengkap..."
                                value={fullname}
                                onChange={(e) => setFullname(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-neutral-900 tracking-wide mb-2">Role</label>
                            <input className="w-full px-3 py-3 rounded-md border border-neutral-600 bg-neutral-200 text-sm text-neutral-900 capitalize cursor-not-allowed" value={user?.role ?? ''} disabled readOnly />
                        </div>
                    </div>

                    {/* Feedback */}
                    {saveSuccess && (
                        <div className="mt-4 mb-4 flex items-center gap-2 px-4 py-3 rounded-md bg-neutral-200 text-neutral-800 text-sm">
                            <svg className="w-4 h-4 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                            Profil berhasil diperbarui!
                        </div>
                    )}
                    {saveError && (
                        <div className="mt-4 mb-4 flex items-center gap-2 px-4 py-3 rounded-md bg-red-200 text-red-700 text-sm">
                            <svg className="w-4 h-4 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9.303 3.376c.866 1.5-.217 3.374-1.948 3.374H4.645c-1.73 0-2.813-1.874-1.948-3.374L10.05 3.378c.866-1.5 3.032-1.5 3.898 0L21.303 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>
                            {saveError}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-col-reverse justify-between gap-4 md:flex-row md:gap-3">
                        <button
                            className="flex items-center gap-2 px-6 py-3 rounded-sm
                                text-red-950 font-semibold
                                text-sm bg-red-100
                                border border-red-900
                                transition-all duration-300 ease-in-out
                                hover:-translate-y-0.5 hover:shadow-[-5px_5px_0_rgba(153,27,27,1)]
                            "
                            type="button"
                            onClick={() => setShowDeleteModal(true)}
                        >
                            <svg className="w-4 h-4 font-bold" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                            Hapus Akun
                        </button>

                        <button
                            className="flex items-center gap-2 px-6 py-3 rounded-sm 
                                bg-neutral-100 text-neutral-900 text-sm font-medium 
                                border border-neutral-900
                                disabled:opacity-50 disabled:cursor-not-allowed
                                transition-all duration-300 ease-in-out
                                hover:-translate-y-0.5 hover:shadow-[-5px_5px_0_rgba(26,26,46,1)]
                            "
                            type="button"
                            onClick={handleSave}
                            disabled={isSaving}
                        >
                            {isSaving ? (
                                <>
                                    <svg className="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                                    Simpan Perubahan
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </section>

            {/* MODAL HAPUS AKUN */}
            {showDeleteModal && (
                <div
                    className="fixed inset-0 bg-neutral-900/50 
                        flex items-center justify-center z-50 px-4
                    "
                    onClick={(e) => { if (e.target === e.currentTarget) closeDeleteModal(); }}
                >
                    <div className="bg-neutral-100 rounded-md w-full max-w-lg
                        border-2 border-neutral-900 p-8
                        shadow-[-10px_10px_0_rgba(26,26,46,1)]
                    ">
                        <div className="w-16 h-16 rounded-full bg-red-200 flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-red-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>
                        </div>
                        <h3 className="text-center text-lg font-semibold text-neutral-900 mb-2">Hapus Akun?</h3>
                        <p className="text-center text-sm text-neutral-700 leading-relaxed mb-5">
                            Tindakan ini <span className="text-red-700 font-semibold">tidak dapat dibatalkan</span>. Masukkan password untuk konfirmasi.
                        </p>

                        <div className="mb-1">
                            <label className="block text-xs font-medium text-neutral-900 uppercase tracking-wide mb-1">Password</label>
                            <div className="relative">
                                <input
                                    className="w-full px-4 py-3 pr-11 rounded-md border 
                                        border-neutral-600 text-sm outline-none 
                                        text-neutral-900
                                        focus:border-neutral-700 focus:ring-2 focus:ring-neutral-700/10 transition"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Masukkan password kamu..."
                                    value={deletePassword}
                                    onChange={(e) => setDeletePassword(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter' && deletePassword && !isDeleting) handleDeleteAccount(); }}
                                    autoFocus
                                />
                                <button
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-700 hover:text-neutral-900 transition"
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    tabIndex={-1}
                                >
                                    {showPassword ? (
                                        <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                                    ) : (
                                        <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {deleteError && (
                            <div className="flex items-center gap-2 px-3 py-3 rounded-md bg-red-100 text-red-700 text-sm mt-3">
                                <svg className="w-4 h-4 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9.303 3.376c.866 1.5-.217 3.374-1.948 3.374H4.645c-1.73 0-2.813-1.874-1.948-3.374L10.05 3.378c.866-1.5 3.032-1.5 3.898 0L21.303 16.126ZM12 15.75h.007v.008H12v-.008Z" /></svg>
                                {deleteError}
                            </div>
                        )}

                        <div className="flex items-center gap-4 mt-8">
                            <button
                                className="flex-1 flex items-center gap-2 px-6 py-3 rounded-sm 
                                bg-neutral-100 text-neutral-900 text-sm font-medium 
                                border border-neutral-900
                                disabled:opacity-50 disabled:cursor-not-allowed
                                transition-all duration-300 ease-in-out
                                hover:-translate-y-0.5 hover:shadow-[-5px_5px_0_rgba(26,26,46,1)]"
                                type="button"
                                onClick={closeDeleteModal}
                            >
                                Batal
                            </button>
                            <button
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-sm
                                text-red-950 font-semibold
                                text-sm bg-red-100
                                border border-red-900
                                transition-all duration-300 ease-in-out
                                hover:-translate-y-0.5 hover:shadow-[-5px_5px_0_rgba(153,27,27,1)]"
                                type="button"
                                disabled={!deletePassword || isDeleting}
                                onClick={handleDeleteAccount}
                            >
                                {isDeleting ? (
                                    <>
                                        <svg className="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
                                        Menghapus...
                                    </>
                                ) : 'Ya, Hapus Akun'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayoutUsers>
    );
}