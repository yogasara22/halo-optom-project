import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="bg-linear-to-r from-[#2563EB] to-[#3DBD61] px-8 py-10 text-white">
                    <Link href="/" className="inline-flex items-center text-white/80 hover:text-white transition-colors mb-6">
                        <ArrowLeft className="h-5 w-5 mr-2" />
                        Kembali ke Beranda
                    </Link>
                    <h1 className="text-4xl font-bold mb-2">Kebijakan Privasi</h1>
                    <p className="text-blue-100">Terakhir diperbarui: 20 Januari 2026</p>
                </div>

                {/* Content */}
                <div className="p-8 md:p-12 prose prose-lg prose-blue max-w-none text-gray-700">
                    <p>
                        Di Halo Optom ("kami", "kita", atau "milik kami"), kami menghargai privasi Anda dan berkomitmen untuk melindungi informasi pribadi Anda. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi data Anda saat Anda menggunakan layanan kami.
                    </p>

                    <h3>1. Informasi yang Kami Kumpulkan</h3>
                    <p>
                        Kami mengumpulkan informasi yang Anda berikan secara langsung kepada kami, seperti saat Anda membuat akun, membuat janji temu, atau menghubungi layanan pelanggan. Informasi ini dapat mencakup:
                    </p>
                    <ul>
                        <li>Nama lengkap</li>
                        <li>Alamat email</li>
                        <li>Nomor telepon</li>
                        <li>Data kesehatan mata (untuk keperluan konsultasi)</li>
                    </ul>

                    <h3>2. Penggunaan Informasi</h3>
                    <p>
                        Kami menggunakan informasi yang kami kumpulkan untuk berbagai tujuan, termasuk:
                    </p>
                    <ul>
                        <li>Menyediakan, memelihara, dan meningkatkan layanan kami.</li>
                        <li>Memproses transaksi dan mengelola janji temu Anda.</li>
                        <li>Mengirimkan informasi teknis, pembaruan keamanan, dan dukungan administratif.</li>
                        <li>Berkomunikasi dengan Anda tentang layanan, penawaran, dan acara.</li>
                    </ul>

                    <h3>3. Keamanan Data</h3>
                    <p>
                        Kami menerapkan langkah-langkah keamanan teknis dan organisasi yang sesuai untuk melindungi informasi pribadi Anda dari akses, penggunaan, atau pengungkapan yang tidak sah. Namun, harap diingat bahwa tidak ada metode transmisi melalui internet atau metode penyimpanan elektronik yang 100% aman.
                    </p>

                    <h3>4. Berbagi Informasi</h3>
                    <p>
                        Kami tidak menjual atau menyewakan informasi pribadi Anda kepada pihak ketiga. Kami hanya membagikan informasi Anda dalam keadaan terbatas, seperti:
                    </p>
                    <ul>
                        <li>Dengan penyedia layanan yang bekerja atas nama kami (misalnya, penyedia hosting, pemrosesan pembayaran).</li>
                        <li>Untuk mematuhi hukum atau menanggapi proses hukum yang sah.</li>
                    </ul>

                    <h3>5. Hak Anda</h3>
                    <p>
                        Anda memiliki hak untuk mengakses, mengoreksi, atau menghapus informasi pribadi Anda yang kami simpan. Jika Anda ingin menggunakan hak ini, silakan hubungi kami melalui informasi kontak yang tersedia di situs kami.
                    </p>

                    <h3>6. Perubahan pada Kebijakan Ini</h3>
                    <p>
                        Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu. Kami akan memberi tahu Anda tentang perubahan apa pun dengan memposting kebijakan baru di halaman ini dan memperbarui tanggal "Terakhir diperbarui".
                    </p>

                    <h3>7. Hubungi Kami</h3>
                    <p>
                        Jika Anda memiliki pertanyaan tentang Kebijakan Privasi ini, silakan hubungi kami di: <strong>Halo Optom</strong> - info@halooptom.com
                    </p>
                </div>
            </div>
        </div>
    );
}
