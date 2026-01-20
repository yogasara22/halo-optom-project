import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsOfService() {
    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="bg-linear-to-r from-[#2563EB] to-[#3DBD61] px-8 py-10 text-white">
                    <Link href="/" className="inline-flex items-center text-white/80 hover:text-white transition-colors mb-6">
                        <ArrowLeft className="h-5 w-5 mr-2" />
                        Kembali ke Beranda
                    </Link>
                    <h1 className="text-4xl font-bold mb-2">Syarat dan Ketentuan</h1>
                    <p className="text-blue-100">Terakhir diperbarui: 20 Januari 2026</p>
                </div>

                {/* Content */}
                <div className="p-8 md:p-12 prose prose-lg prose-blue max-w-none text-gray-700">
                    <p>
                        Selamat datang di Halo Optom. Harap baca Syarat dan Ketentuan ini dengan seksama sebelum menggunakan layanan kami. Dengan mengakses atau menggunakan situs web kami, Anda setuju untuk terikat oleh ketentuan ini.
                    </p>

                    <h3>1. Layanan Kami</h3>
                    <p>
                        Halo Optom menyediakan platform digital untuk edukasi kesehatan mata, konsultasi awal dengan profesional, dan informasi produk kacamata. Layanan kami disediakan untuk tujuan informasi dan tidak menggantikan saran medis profesional, diagnosis, atau perawatan dari dokter mata secara langsung.
                    </p>

                    <h3>2. Pendaftaran Akun</h3>
                    <p>
                        Untuk mengakses fitur tertentu, Anda mungkin perlu mendaftar akun. Anda bertanggung jawab untuk menjaga kerahasiaan kata sandi dan akun Anda serta semua aktivitas yang terjadi di bawah akun Anda.
                    </p>

                    <h3>3. Penggunaan yang Dilarang</h3>
                    <p>
                        Anda setuju untuk tidak menggunakan layanan kami untuk tujuan ilegal atau melanggar hukum. Anda dilarang mencoba mengganggu keamanan situs web, mengirimkan virus, atau melakukan aktivitas yang dapat merusak infrastruktur kami.
                    </p>

                    <h3>4. Kepemilikan Intelektual</h3>
                    <p>
                        Semua konten yang ada di layanan kami, termasuk teks, grafik, logo, dan gambar, adalah milik Halo Optom atau pemberi lisensinya dan dilindungi oleh undang-undang hak cipta dan kekayaan intelektual lainnya.
                    </p>

                    <h3>5. Batasan Tanggung Jawab</h3>
                    <p>
                        Halo Optom tidak bertanggung jawab atas kerugian langsung, tidak langsung, insidental, atau konsekuensial yang timbul dari penggunaan atau ketidakmampuan untuk menggunakan layanan kami. Kami berusaha memberikan informasi yang akurat, tetapi tidak menjamin keakuratan atau kelengkapan konten.
                    </p>

                    <h3>6. Perubahan Ketentuan</h3>
                    <p>
                        Kami berhak untuk mengubah Syarat dan Ketentuan ini kapan saja. Perubahan akan berlaku segera setelah diposting di situs web. Penggunaan berkelanjutan Anda atas layanan kami setelah perubahan tersebut merupakan persetujuan Anda terhadap ketentuan baru.
                    </p>

                    <h3>7. Hukum yang Berlaku</h3>
                    <p>
                        Syarat dan Ketentuan ini diatur oleh dan ditafsirkan sesuai dengan hukum Republik Indonesia.
                    </p>

                    <h3>8. Hubungi Kami</h3>
                    <p>
                        Jika Anda memiliki pertanyaan tentang Syarat dan Ketentuan ini, silakan hubungi kami di info@halooptom.com.
                    </p>
                </div>
            </div>
        </div>
    );
}
