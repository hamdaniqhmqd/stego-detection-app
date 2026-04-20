import { User } from "@/types/Users"
import ModalShell from "./ModalShell"
import Section from "../Ui/Section"
import { Field } from "../Ui/Field"
import { fmtDate } from "@/utils/format"

interface ModalDetailUserProps {
    user: User | null
    open: boolean
    onClose: () => void
}

export function ModalDetailUser({ user, open, onClose }: ModalDetailUserProps) {
    if (!user) return null

    return (
        <ModalShell
            open={open}
            onClose={onClose}
            title="Detail Pengguna"
            subtitle={`ID: ${user.id}`}
        >
            <div className="space-y-6">
                {/* Avatar + nama */}
                <div className="flex flex-col md:flex-row items-center gap-4 p-4 bg-neutral-50 rounded-xl
                    border border-neutral-100">
                    <img
                        src={
                            user.photo ??
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullname ?? user.username)
                            }&background=e5e7eb&color=374151&size=80`
                        }
                        alt="Avatar"
                        className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm"
                    />
                    <div>
                        <p className="font-semibold text-neutral-900">
                            {user.fullname ?? user.username}
                        </p>
                        <p className="text-sm text-neutral-500">@{user.username}</p>
                        <span className={`mt-1 inline-flex px-2 py-0.5 rounded-full text-xs font-medium
                            ${user.role === 'superadmin'
                                ? 'bg-violet-50 text-violet-700'
                                : 'bg-neutral-200 text-neutral-600'
                            }`}>
                            {user.role}
                        </span>
                    </div>
                </div>

                <Section title="Informasi Akun">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Email">{user.email}</Field>
                        <Field label="Status">
                            {user.deleted_at ? (
                                <span className="text-red-600">Dihapus</span>
                            ) : user.is_verified ? (
                                <span className="text-emerald-600">Aktif & Terverifikasi</span>
                            ) : (
                                <span className="text-amber-600">Belum Terverifikasi</span>
                            )}
                        </Field>
                        <Field label="Bergabung">{fmtDate(user.created_at)}</Field>
                        <Field label="Terakhir diupdate">{fmtDate(user.updated_at)}</Field>
                        {user.verified_at && (
                            <Field label="Diverifikasi pada">{fmtDate(user.verified_at)}</Field>
                        )}
                        {user.deleted_at && (
                            <Field label="Dihapus pada">
                                <span className="text-red-600">{fmtDate(user.deleted_at)}</span>
                            </Field>
                        )}
                    </div>
                </Section>
            </div>
        </ModalShell>
    )
}