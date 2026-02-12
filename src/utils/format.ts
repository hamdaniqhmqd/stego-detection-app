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