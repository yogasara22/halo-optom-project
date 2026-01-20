'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Minus, HelpCircle, CreditCard, ShieldCheck, AlertCircle } from 'lucide-react';

export default function FAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const faqs = [
        {
            category: "Umum",
            icon: HelpCircle,
            questions: [
                {
                    q: "Apa itu Halo Optom?",
                    a: "Halo Optom adalah platform kesehatan mata digital yang menghubungkan pasien dengan optometris profesional. Kami menyediakan layanan konsultasi online, edukasi kesehatan mata, dan panduan pemilihan kacamata yang tepat."
                },
                {
                    q: "Apakah Halo Optom melayani seluruh Indonesia?",
                    a: "Ya, layanan konsultasi online kami dapat diakses dari seluruh Indonesia. Untuk layanan fisik atau pengiriman produk kacamata, kami juga melayani pengiriman ke seluruh wilayah di Indonesia yang terjangkau oleh ekspedisi logistik."
                },
                {
                    q: "Bagaimana cara menghubungi layanan pelanggan?",
                    a: "Anda dapat menghubungi tim layanan pelanggan kami melalui email di halooptom@gmail.com atau melalui WhatsApp di nomor +62 823-2161-6003. Tim kami siap membantu Anda pada jam operasional Senin - Minggu, pukul 08.00 - 21.00 WIB."
                }
            ]
        },
        {
            category: "Layanan & Konsultasi",
            icon: ShieldCheck,
            questions: [
                {
                    q: "Bagaimana cara melakukan konsultasi?",
                    a: "Anda cukup mendaftar akun, memilih menu 'Konsultasi', dan memilih optometris yang tersedia sesuai jadwal yang Anda inginkan. Setelah pembayaran dikonfirmasi, Anda akan mendapatkan link untuk sesi konsultasi video atau chat."
                },
                {
                    q: "Apakah optometris di Halo Optom bersertifikat?",
                    a: "Tentu. Semua optometris mitra kami telah melalui proses verifikasi ketat, memiliki STR (Surat Tanda Registrasi) aktif, dan berpengalaman di bidangnya untuk memastikan Anda mendapatkan saran medis yang akurat."
                }
            ]
        },
        {
            category: "Pembayaran",
            icon: CreditCard,
            questions: [
                {
                    q: "Metode pembayaran apa saja yang tersedia?",
                    a: "Kami menerima berbagai metode pembayaran yang aman dan mudah, termasuk Transfer Bank (Virtual Account), E-Wallet (OVO, GoPay, Dana, ShopeePay), dan Kartu Kredit/Debit. Semua transaksi diproses melalui payment gateway resmi yang terdaftar dan diawasi."
                },
                {
                    q: "Apakah transaksi di Halo Optom aman?",
                    a: "Keamanan transaksi adalah prioritas kami. Sistem pembayaran kami menggunakan enkripsi standar industri dan kami tidak menyimpan informasi kartu kredit Anda secara langsung. Data pribadi Anda juga dilindungi sesuai dengan Kebijakan Privasi kami."
                }
            ]
        },
        {
            category: "Kebijakan Pengembalian Dana (Refund Policy)",
            icon: AlertCircle,
            questions: [
                {
                    q: "Bagaimana kebijakan pembatalan jadwal konsultasi?",
                    a: "Anda dapat membatalkan jadwal konsultasi hingga 24 jam sebelum waktu yang ditentukan untuk mendapatkan pengembalian dana penuh (100%). Pembatalan yang dilakukan kurang dari 24 jam sebelum jadwal tidak dapat dikembalikan."
                },
                {
                    q: "Kapan saya bisa mengajukan refund?",
                    a: "Pengajuan refund dapat dilakukan jika: (1) Terjadi kesalahan sistem yang menyebabkan pembayaran terdebet namun pesanan gagal, (2) Optometris membatalkan sesi secara sepihak, atau (3) Anda membatalkan pesanan sesuai dengan ketentuan waktu pembatalan (H-1)."
                },
                {
                    q: "Berapa lama proses pengembalian dana?",
                    a: "Proses pengembalian dana biasanya memakan waktu 3-7 hari kerja, tergantung pada metode pembayaran yang Anda gunakan dan kebijakan bank penerbit. Dana akan dikembalikan ke metode pembayaran asl atau rekening yang Anda daftarkan."
                },
                {
                    q: "Apakah produk kacamata bisa ditukar atau dikembalikan?",
                    a: "Untuk produk fisik (kacamata/lensa), kami menerima penukaran atau pengembalian jika terdapat cacat produksi atau ketidaksesuaian dengan pesanan (salah ukuran/resep) yang dilaporkan maksimal 2x24 jam setelah barang diterima. Lensa yang sudah dipotong sesuai resep khusus tidak dapat dikembalikan kecuali terdapat kesalahan pengerjaan dari pihak kami."
                }
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-10 text-center">
                    <Link href="/" className="inline-flex items-center text-[#2563EB] hover:text-[#1d4ed8] transition-colors mb-6 font-medium">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Kembali ke Beranda
                    </Link>
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Pusat Bantuan & FAQ</h1>
                    <p className="text-xl text-gray-600">
                        Temukan jawaban atas pertanyaan umum seputar layanan Halo Optom
                    </p>
                </div>

                <div className="space-y-8">
                    {faqs.map((section, sIndex) => {
                        const Icon = section.icon;
                        return (
                            <div key={sIndex} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="bg-linear-to-r from-[#2563EB]/5 to-[#3DBD61]/5 px-6 py-4 border-b border-gray-100 flex items-center">
                                    <div className="p-2 bg-white rounded-lg shadow-sm mr-4 text-[#2563EB]">
                                        <Icon className="h-6 w-6" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-800">{section.category}</h2>
                                </div>

                                <div className="divide-y divide-gray-100">
                                    {section.questions.map((item, qIndex) => {
                                        const globalIndex = sIndex * 100 + qIndex;
                                        const isOpen = openIndex === globalIndex;

                                        return (
                                            <div key={qIndex} className="group">
                                                <button
                                                    onClick={() => setOpenIndex(isOpen ? null : globalIndex)}
                                                    className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none hover:bg-gray-50 transition-colors duration-200"
                                                >
                                                    <span className={`font-medium text-lg ${isOpen ? 'text-[#2563EB]' : 'text-gray-700'}`}>
                                                        {item.q}
                                                    </span>
                                                    <div className={`ml-4 shrink-0 flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 ${isOpen ? 'bg-[#2563EB] text-white rotate-180' : 'bg-gray-100 text-gray-500 group-hover:bg-[#2563EB]/10 group-hover:text-[#2563EB]'}`}>
                                                        {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                                                    </div>
                                                </button>
                                                <div
                                                    className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                                        }`}
                                                >
                                                    <div className="px-6 pb-6 text-gray-600 leading-relaxed">
                                                        {item.a}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-12 bg-linear-to-r from-[#2563EB] to-[#3DBD61] rounded-2xl p-8 text-center text-white shadow-lg">
                    <h3 className="text-2xl font-bold mb-4">Masih butuh bantuan?</h3>
                    <p className="mb-8 text-blue-50 text-lg">
                        Tim layanan pelanggan kami siap membantu Anda setiap hari.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <a href="https://wa.me/6282321616003" target="_blank" rel="noopener noreferrer" className="bg-white text-[#2563EB] px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all transform hover:-translate-y-1">
                            Chat WhatsApp
                        </a>
                        <a href="mailto:halooptom@gmail.com" className="bg-[#2563EB]/30 backdrop-blur-sm border border-white/30 text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#2563EB]/40 transition-all transform hover:-translate-y-1">
                            Kirim Email
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
