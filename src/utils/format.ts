// src/utils/format.ts

export function getWaktuWIB() {
    const nowUTC = new Date();
    const nowWIB = new Date(nowUTC.getTime() + 7 * 60 * 60 * 1000);
    return nowWIB;
}

export const formatDateTime = (dateString: string) => {
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const utcDate = new Date(dateString);

    let day: string, month: string, year: number, hours: string, minutes: string;

    if (dateString.includes('+') || dateString.includes('Z')) {
        day = utcDate.getUTCDate().toString().padStart(2, '0');
        month = months[utcDate.getUTCMonth()];
        year = utcDate.getUTCFullYear();
        hours = utcDate.getUTCHours().toString().padStart(2, '0');
        minutes = utcDate.getUTCMinutes().toString().padStart(2, '0');
    } else {
        day = utcDate.getDate().toString().padStart(2, '0');
        month = months[utcDate.getMonth()];
        year = utcDate.getFullYear();
        hours = utcDate.getHours().toString().padStart(2, '0');
        minutes = utcDate.getMinutes().toString().padStart(2, '0');
    }

    return `${day} ${month} ${year} ${hours}:${minutes}`;
};

export const formatDateMonthYears = (dateString: string) => {
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const utcDate = new Date(dateString);

    let day: string, month: string, year: number;

    if (dateString.includes('+') || dateString.includes('Z')) {
        day = utcDate.getUTCDate().toString().padStart(2, '0');
        month = months[utcDate.getUTCMonth()];
        year = utcDate.getUTCFullYear();
    } else {
        day = utcDate.getDate().toString().padStart(2, '0');
        month = months[utcDate.getMonth()];
        year = utcDate.getFullYear();
    }

    return `${day} ${month} ${year}`;
};

export const formatDateSimple = (dateString: string) => {
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    const utcDate = new Date(dateString);

    let day: number, month: string, year: number, hours: string, minutes: string;

    if (dateString.includes('+') || dateString.includes('Z')) {
        day = utcDate.getUTCDate();
        month = (utcDate.getMonth() + 1).toString().padStart(2, '0');
        year = utcDate.getUTCFullYear();
        hours = utcDate.getUTCHours().toString().padStart(2, '0');
        minutes = utcDate.getUTCMinutes().toString().padStart(2, '0');
    } else {
        day = utcDate.getDate();
        month = (utcDate.getMonth() + 1).toString().padStart(2, '0');
        year = utcDate.getFullYear();
        hours = utcDate.getHours().toString().padStart(2, '0');
        minutes = utcDate.getMinutes().toString().padStart(2, '0');
    }

    return `${day}/${month}/${year} ${hours}:${minutes}`;
};

export const fmt = (d: string) =>
    new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })

export const fmtTime = (d: string) =>
    new Date(d).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })

export const fmtDayMonth = (d: string) =>
    new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })

export const fmtMonth = (d: string) =>
    new Date(d).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })

export function fmtTokens(n: number): string {
    if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`
    return String(n)
}

export function formatArah(arah: string): string {
    return arah
        .replace('kiri-kanan-atas-bawah', 'Kiri → Kanan, Atas → Bawah')
        .replace('kanan-kiri-bawah-atas', 'Kanan → Kiri, Bawah → Atas')
        .replace('atas-bawah-kiri-kanan', 'Atas → Bawah, Kiri → Kanan')
        .replace('bawah-atas-kanan-kiri', 'Bawah → Atas, Kanan → Kiri')
}

export const filename = (p?: string) => p?.split('/').pop() ?? '—'

/** Sensor API key: tampilkan 6 karakter pertama & 4 terakhir */
export function maskKey(key: string): string {
    if (key.length <= 12) return '••••••••••••'
    return key.slice(0, 6) + '••••••••••' + key.slice(-4)
}

export type ConfirmState = { type: 'soft' | 'hard'; id: string; label: string } | null

export function maskPassword(pwd: string): string {
    if (pwd.length <= 6) return '••••••••••'
    return pwd.slice(0, 3) + '••••••••' + pwd.slice(-2)
}

/** Group array of dated records by day (last N days) */
export function groupByDay<T extends { created_at: string; deleted_at?: string | null }>(
    items: T[],
    days = 7
): { label: string; count: number }[] {
    const now = new Date()
    const result: { label: string; count: number }[] = []

    for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now)
        d.setDate(now.getDate() - i)
        const label = fmt(d.toISOString())
        const count = items.filter(item => {
            const created = new Date(item.created_at)
            return (
                created.getFullYear() === d.getFullYear() &&
                created.getMonth() === d.getMonth() &&
                created.getDate() === d.getDate()
            )
        }).length
        result.push({ label, count })
    }
    return result
}

/** Group by month (last N months) */
export function groupByMonth<T extends { created_at: string }>(
    items: T[],
    months = 6
): { label: string; count: number }[] {
    const now = new Date()
    const result: { label: string; count: number }[] = []

    for (let i = months - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const label = fmtMonth(d.toISOString())
        const count = items.filter(item => {
            const created = new Date(item.created_at)
            return (
                created.getFullYear() === d.getFullYear() &&
                created.getMonth() === d.getMonth()
            )
        }).length
        result.push({ label, count })
    }
    return result
}