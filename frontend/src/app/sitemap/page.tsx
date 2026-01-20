import Link from 'next/link';
import { ArrowLeft, ExternalLink } from 'lucide-react';

export default function Sitemap() {
    const sitemapGroups = [
        {
            title: "Utama",
            links: [
                { name: "Beranda", href: "/" },
                { name: "Fitur", href: "/#fitur" },
                { name: "Layanan", href: "/#layanan" },
                { name: "Tentang", href: "/#about" }, // Assuming section exists or will exist
            ]
        },
        {
            title: "Layanan",
            links: [
                { name: "Konsultasi Online", href: "/layanan/konsultasi" }, // Placeholder routes if they don't exist yet, can adjust to anchors
                { name: "Toko Kacamata", href: "/layanan/shop" },
                // { name: "Pemeriksaan Homecare", href: "/layanan/homecare" },
            ]
        },
        {
            title: "Legal & Bantuan",
            links: [
                { name: "Kebijakan Privasi", href: "/privacy-policy" },
                { name: "Syarat dan Ketentuan", href: "/terms-of-service" },
                { name: "Kebijakan Cookie", href: "/cookie-policy" },
                { name: "FAQ (Tanya Jawab)", href: "/faq" },
            ]
        },
        {
            title: "Akun",
            links: [
                { name: "Login Pasien", href: "/auth/login?role=patient" },
                { name: "Register Pasien", href: "/auth/register" },
                { name: "Login Optometris", href: "/auth/login?role=optometrist" },
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    {/* Header */}
                    <div className="bg-linear-to-r from-[#2563EB] to-[#3DBD61] px-8 py-12 text-center text-white">
                        <Link href="/" className="inline-flex items-center text-white/80 hover:text-white transition-colors mb-6 absolute left-8 top-8">
                            <ArrowLeft className="h-5 w-5 mr-2" />
                            Kembali
                        </Link>
                        <h1 className="text-4xl font-bold mb-4">Peta Situs</h1>
                        <p className="text-blue-100 text-lg max-w-2xl mx-auto">
                            Navigasi lengkap untuk menjelajahi seluruh layanan dan informasi di Halo Optom.
                        </p>
                    </div>

                    {/* Content */}
                    <div className="p-8 md:p-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                            {sitemapGroups.map((group, index) => (
                                <div key={index} className="space-y-6">
                                    <h2 className="text-xl font-bold text-gray-800 pb-2 border-b-2 border-[#3DBD61] inline-block">
                                        {group.title}
                                    </h2>
                                    <ul className="space-y-4">
                                        {group.links.map((link, lIndex) => (
                                            <li key={lIndex}>
                                                <Link
                                                    href={link.href}
                                                    className="text-gray-600 hover:text-[#2563EB] transition-colors flex items-center group"
                                                >
                                                    <span className="w-1.5 h-1.5 bg-gray-300 rounded-full mr-3 group-hover:bg-[#2563EB] transition-colors"></span>
                                                    {link.name}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>

                        <div className="mt-16 pt-8 border-t border-gray-100 text-center">
                            <p className="text-gray-500 mb-4">Butuh informasi lebih lanjut?</p>
                            <div className="flex justify-center space-x-6">
                                <a href="mailto:halooptom@gmail.com" className="flex items-center text-[#2563EB] hover:text-[#1d4ed8] font-medium transition-colors">
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    Hubungi Kami
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
