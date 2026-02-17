// src/utils/format.ts

export const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const wib = new Date(date.getTime() + 7 * 60 * 60 * 1000);
    return wib.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

export const formatCurrency = (price: number) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(price);

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