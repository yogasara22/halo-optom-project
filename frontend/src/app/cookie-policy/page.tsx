import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function CookiePolicy() {
    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="bg-linear-to-r from-[#2563EB] to-[#3DBD61] px-8 py-10 text-white">
                    <Link href="/" className="inline-flex items-center text-white/80 hover:text-white transition-colors mb-6">
                        <ArrowLeft className="h-5 w-5 mr-2" />
                        Kembali ke Beranda
                    </Link>
                    <h1 className="text-4xl font-bold mb-2">Kebijakan Cookie</h1>
                    <p className="text-blue-100">Terakhir diperbarui: 20 Januari 2026</p>
                </div>

                {/* Content */}
                <div className="p-8 md:p-12 prose prose-lg prose-blue max-w-none text-gray-700">
                    <p>
                        Kebijakan Cookie ini menjelaskan apa itu cookie dan bagaimana kami menggunakannya di situs web Halo Optom. Anda harus membaca kebijakan ini untuk memahami jenis cookie yang kami gunakan, informasi yang kami kumpulkan menggunakan cookie, dan bagaimana informasi tersebut digunakan.
                    </p>

                    <h3>1. Apa itu Cookie?</h3>
                    <p>
                        Cookie adalah file teks kecil yang disimpan di komputer atau perangkat seluler Anda saat Anda mengunjungi situs web. Cookie banyak digunakan untuk membuat situs web berfungsi, atau berfungsi lebih efisien, serta untuk memberikan informasi kepada pemilik situs.
                    </p>

                    <h3>2. Bagaimana Kami Menggunakan Cookie?</h3>
                    <p>
                        Kami menggunakan cookie untuk berbagai tujuan, termasuk:
                    </p>
                    <ul>
                        <li><strong>Cookie Penting:</strong> Cookie ini diperlukan agar situs web berfungsi dengan baik. Mereka memungkinkan Anda menavigasi situs dan menggunakan fitur-fiturnya.</li>
                        <li><strong>Cookie Analitik:</strong> Kami menggunakan cookie ini untuk memahami bagaimana pengunjung berinteraksi dengan situs web kami, yang membantu kami meningkatkan pengalaman pengguna.</li>
                        <li><strong>Cookie Fungsionalitas:</strong> Cookie ini memungkinkan situs web mengingat pilihan yang Anda buat (seperti nama pengguna atau bahasa) dan menyediakan fitur yang disempurnakan.</li>
                    </ul>

                    <h3>3. Mengelola Cookie</h3>
                    <p>
                        Sebagian besar browser web memungkinkan Anda untuk mengontrol cookie melalui pengaturan browser. Anda dapat mengatur browser Anda untuk menolak cookie atau menghapus cookie yang sudah ada. Namun, harap diingat bahwa jika Anda menonaktifkan cookie, beberapa fitur situs web kami mungkin tidak berfungsi sebagaimana mestinya.
                    </p>

                    <h3>4. Cookie Pihak Ketiga</h3>
                    <p>
                        Kami mungkin juga menggunakan cookie dari penyedia layanan pihak ketiga (seperti Google Analytics) untuk membantu kami menganalisis penggunaan situs web. Pihak ketiga ini memiliki kebijakan privasi mereka sendiri.
                    </p>

                    <h3>5. Perubahan pada Kebijakan Cookie</h3>
                    <p>
                        Kami dapat memperbarui Kebijakan Cookie ini dari waktu ke waktu. Kami menyarankan Anda untuk memeriksa halaman ini secara berkala untuk mengetahui perubahan apa pun.
                    </p>

                    <h3>6. Hubungi Kami</h3>
                    <p>
                        Jika Anda memiliki pertanyaan tentang penggunaan cookie kami, silakan hubungi kami di info@halooptom.com.
                    </p>
                </div>
            </div>
        </div>
    );
}
