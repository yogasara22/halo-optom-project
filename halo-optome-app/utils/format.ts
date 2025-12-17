export const formatRupiah = (value: number | string): string => {
    const number = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(number)) return 'Rp 0';

    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(number).replace(/,00$/, '').replace(/\u00A0/g, ' ');
};
