'use client';

import Link from 'next/link';
import { Eye, Shield, Clock, Users, Star, CheckCircle, ArrowRight, Phone, Mail, MapPin, Sparkles, Heart, Award } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-green-50">
      {/* Header */}
      <header className={`fixed w-full z-50 transition-all duration-300 ${isScrolled
        ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-white/20'
        : 'bg-transparent'
        }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 relative">
            <div className="flex items-center space-x-2 group relative z-10">
              <div className="relative">
                <Eye className="h-8 w-8 text-[#2563EB] group-hover:scale-110 transition-transform duration-300" />
                <div className="absolute -inset-1 bg-linear-to-r from-[#2563EB] to-[#3DBD61] rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-300 blur"></div>
              </div>
              <span className="text-2xl font-bold bg-linear-to-r from-[#2563EB] to-[#3DBD61] bg-clip-text text-transparent">
                Halo Optom
              </span>
            </div>

            <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
              <nav className="hidden md:flex space-x-8 pointer-events-auto">
                {['Fitur', 'Layanan', 'Tentang', 'Kontak'].map((item, index) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    className="relative text-gray-600 hover:text-[#2563EB] transition-all duration-300 group"
                  >
                    {item}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-linear-to-r from-[#2563EB] to-[#3DBD61] group-hover:w-full transition-all duration-300"></span>
                  </a>
                ))}
              </nav>
            </div>

            {/* Hidden Admin Login and empty div to balance flex if needed, but absolute centering works best */}
            <div className="w-[140px] hidden md:block"></div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-linear-to-r from-[#2563EB]/10 to-[#3DBD61]/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-linear-to-r from-[#3DBD61]/10 to-[#2563EB]/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-linear-to-r from-blue-100/20 to-green-100/20 rounded-full blur-3xl animate-spin" style={{ animationDuration: '20s' }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-white/20 shadow-lg mb-8 animate-fade-in-up">
              <Sparkles className="h-4 w-4 text-[#3DBD61] mr-2" />
              {/* <span className="text-sm font-medium text-gray-700">Platform Kesehatan Mata #1 di Indonesia</span> */}
              <span className="text-sm font-medium text-gray-700">
                Layanan Konsultasi & Edukasi Kesehatan Mata
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in-up delay-200">
              <span className="bg-linear-to-r from-gray-900 via-[#2563EB] to-gray-900 bg-clip-text text-transparent">
                Solusi Kesehatan Mata
              </span>
              <span className="block bg-linear-to-r from-[#2563EB] to-[#3DBD61] bg-clip-text text-transparent mt-2">
                Terdepan
              </span>
            </h1>

            {/* <p className="text-xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed animate-fade-in-up delay-400">
              Platform terintegrasi untuk konsultasi mata, pemeriksaan komprehensif,
              dan layanan homecare profesional dengan teknologi AI terdepan.
            </p> */}
            <p className="text-xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed animate-fade-in-up delay-400">
              Layanan digital untuk konsultasi awal, edukasi kesehatan mata,
              dan panduan pemilihan kacamata secara online.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center animate-fade-in-up delay-600">
              <button className="group relative bg-linear-to-r from-[#2563EB] to-[#3DBD61] text-white px-10 py-4 rounded-2xl text-lg font-semibold hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
                <span className="relative z-10 flex items-center justify-center">
                  Mulai Konsultasi
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
                <div className="absolute inset-0 bg-linear-to-r from-[#3DBD61] to-[#2563EB] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>

              <button className="group relative border-2 border-[#3DBD61] text-[#3DBD61] px-10 py-4 rounded-2xl text-lg font-semibold hover:bg-[#3DBD61] hover:text-white transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
                <span className="relative z-10">Pelajari Lebih Lanjut</span>
                <div className="absolute inset-0 bg-linear-to-r from-[#3DBD61] to-[#2563EB] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
              </button>
            </div>

            {/* Floating Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 animate-fade-in-up delay-800">
              {[
                // { number: '10K+', label: 'Pasien Terlayani', icon: Users },
                { number: '10K+', label: 'Pengguna Terdaftar', icon: Users },
                // { number: '500+', label: 'Optometris Berpengalaman', icon: Award },
                { number: '100+', label: 'Mitra Optik & Konsultan', icon: Award },
                { number: '98%', label: 'Tingkat Kepuasan', icon: Heart }
              ].map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <div key={index} className="group bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-white/20">
                    <IconComponent className="h-8 w-8 text-[#2563EB] mx-auto mb-3 group-hover:scale-110 transition-transform duration-300" />
                    <div className="text-3xl font-bold bg-linear-to-r from-[#2563EB] to-[#3DBD61] bg-clip-text text-transparent mb-2">
                      {stat.number}
                    </div>
                    <div className="text-gray-600 font-medium">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="fitur" className="py-24 bg-linear-to-b from-white to-slate-50 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%232563EB' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 bg-linear-to-r from-[#2563EB]/10 to-[#3DBD61]/10 rounded-full border border-[#2563EB]/20 mb-6">
              <Sparkles className="h-4 w-4 text-[#2563EB] mr-2" />
              <span className="text-sm font-medium text-[#2563EB]">Teknologi Terdepan</span>
            </div>
            <h2 className="text-5xl font-bold bg-linear-to-r from-gray-900 to-[#2563EB] bg-clip-text text-transparent mb-6">
              Fitur Unggulan
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Teknologi AI dan digital terdepan untuk memberikan layanan kesehatan mata terbaik
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Eye,
                // title: "Pemeriksaan Komprehensif",
                // description: "Pemeriksaan mata lengkap dengan teknologi digital terkini dan AI analysis",
                title: "Konsultasi & Edukasi Mata",
                description: "Konsultasi awal dan edukasi kesehatan mata berbasis digital",
                color: "from-blue-500 to-blue-600",
                bgColor: "from-blue-50 to-blue-100"
              },
              {
                icon: Shield,
                title: "Keamanan Data",
                // description: "Sistem keamanan berlapis untuk melindungi data medis dengan enkripsi end-to-end",
                description: "Sistem keamanan berlapis untuk melindungi data pengguna",
                color: "from-green-500 to-green-600",
                bgColor: "from-green-50 to-green-100"
              },
              {
                icon: Clock,
                title: "Layanan 24/7",
                description: "Konsultasi dan dukungan tersedia kapan saja dengan response time < 5 menit",
                color: "from-[#2563EB] to-[#3DBD61]",
                bgColor: "from-blue-50 to-green-50"
              },
              {
                icon: Users,
                // title: "Tim Profesional",
                // description: "Optometris bersertifikat dengan pengalaman 10+ tahun dan rating 4.9/5",
                title: "Konsultan Berpengalaman",
                description: "Pendampingan oleh konsultan optik berpengalaman",
                color: "from-orange-500 to-orange-600",
                bgColor: "from-orange-50 to-orange-100"
              }
            ].map((feature, index) => {
              const IconComponent = feature.icon;
              const isActive = activeFeature === index;
              return (
                <div
                  key={index}
                  className={`group relative text-center p-8 rounded-3xl border transition-all duration-500 transform hover:-translate-y-3 cursor-pointer ${isActive
                    ? 'bg-linear-to-br from-white to-blue-50 border-[#2563EB]/30 shadow-2xl shadow-blue-500/20 scale-105'
                    : 'bg-white border-gray-100 hover:shadow-xl hover:border-[#2563EB]/20'
                    }`}
                  onMouseEnter={() => setActiveFeature(index)}
                >
                  {/* Animated Background */}
                  <div className={`absolute inset-0 bg-linear-to-br ${feature.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl`}></div>

                  {/* Floating Icon */}
                  <div className={`relative z-10 bg-linear-to-r ${feature.color} w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all duration-300 shadow-lg`}>
                    <IconComponent className="h-10 w-10 text-white" />
                    <div className={`absolute inset-0 bg-linear-to-r ${feature.color} rounded-2xl blur opacity-50 group-hover:opacity-75 transition-opacity duration-300`}></div>
                  </div>

                  <h3 className="relative z-10 text-xl font-bold text-gray-900 mb-4 group-hover:text-[#2563EB] transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="relative z-10 text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                    {feature.description}
                  </p>

                  {/* Hover Effect Border */}
                  <div className="absolute inset-0 rounded-3xl bg-linear-to-r from-[#2563EB] to-[#3DBD61] opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl"></div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="layanan" className="py-24 bg-linear-to-br from-slate-50 to-blue-50 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 -left-20 w-80 h-80 bg-linear-to-r from-[#2563EB]/5 to-[#3DBD61]/5 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 -right-20 w-96 h-96 bg-linear-to-r from-[#3DBD61]/5 to-[#2563EB]/5 rounded-full blur-3xl animate-float-delayed"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-white/20 shadow-lg mb-6">
              <Heart className="h-4 w-4 text-[#3DBD61] mr-2" />
              <span className="text-sm font-medium text-gray-700">Layanan Terpercaya</span>
            </div>
            <h2 className="text-5xl font-bold bg-linear-to-r from-gray-900 to-[#2563EB] bg-clip-text text-transparent mb-6">
              Layanan Kami
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Solusi lengkap untuk semua kebutuhan kesehatan mata dengan teknologi terdepan
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {[
              {
                title: "Konsultasi Online",
                description: "Konsultasi dengan optometris berpengalaman melalui video call HD",
                // features: ["Video call 4K HD", "Rekam medis digital", "Resep online", "Follow-up gratis"],
                features: [
                  "Video call online",
                  "Ringkasan konsultasi",
                  "Panduan non-medis",
                  "Follow-up edukatif"
                ],
                icon: "💻",
                gradient: "from-blue-500 to-blue-600",
                bgGradient: "from-blue-50 to-blue-100"
              },
              /*
              {
                title: "Pemeriksaan Homecare",
                description: "Layanan pemeriksaan mata profesional langsung di rumah Anda",
                features: ["Peralatan portable", "Optometris bersertifikat", "Laporan lengkap", "Jadwal fleksibel"],
                icon: "🏠",
                gradient: "from-green-500 to-green-600",
                bgGradient: "from-green-50 to-green-100"
              },
              */
              {
                title: "Toko Kacamata",
                description: "Koleksi kacamata dan lensa berkualitas tinggi dengan teknologi terbaru",
                features: ["Frame premium", "Lensa anti radiasi", "Garansi resmi", "Pengiriman gratis"],
                icon: "👓",
                gradient: "from-[#2563EB] to-[#3DBD61]",
                bgGradient: "from-blue-50 to-green-50"
              }
            ].map((service, index) => (
              <div key={index} className="group relative bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 border border-white/20 overflow-hidden">
                {/* Animated Background */}
                <div className={`absolute inset-0 bg-linear-to-br ${service.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>

                {/* Service Icon */}
                <div className="relative z-10 text-4xl mb-6 transform group-hover:scale-110 transition-transform duration-300">
                  {service.icon}
                </div>

                <h3 className="relative z-10 text-2xl font-bold text-gray-900 mb-4 group-hover:text-[#2563EB] transition-colors duration-300">
                  {service.title}
                </h3>
                <p className="relative z-10 text-gray-600 mb-8 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                  {service.description}
                </p>

                <ul className="relative z-10 space-y-4 mb-8">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center group/item">
                      <div className="bg-linear-to-r from-[#3DBD61] to-[#2563EB] rounded-full p-1 mr-3 group-hover:scale-110 transition-transform duration-300">
                        <CheckCircle className="h-4 w-4 text-white" />
                      </div>
                      <span className="text-gray-700 group-hover:text-gray-800 transition-colors duration-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button className={`relative z-10 w-full bg-linear-to-r ${service.gradient} text-white py-4 rounded-2xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 group-hover:scale-105 overflow-hidden`}>
                  <span className="relative z-10">Pilih Layanan</span>
                  <div className="absolute inset-0 bg-linear-to-r from-[#3DBD61] to-[#2563EB] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>

                {/* Decorative Elements */}
                <div className="absolute top-4 right-4 w-20 h-20 bg-linear-to-r from-[#2563EB]/10 to-[#3DBD61]/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {/* <section className="py-24 bg-linear-to-r from-[#2563EB] via-blue-600 to-[#3DBD61] relative overflow-hidden"> */}
      {/* Animated Background Pattern */}
      {/* <div className="absolute inset-0">
          <div className="absolute inset-0 bg-linear-to-r from-blue-600/20 to-green-600/20 animate-pulse"></div>
          <div className="absolute top-0 left-0 w-full h-full opacity-10">
            <div className="absolute top-10 left-10 w-32 h-32 border border-white/20 rounded-full animate-spin" style={{ animationDuration: '20s' }}></div>
            <div className="absolute bottom-10 right-10 w-48 h-48 border border-white/20 rounded-full animate-spin" style={{ animationDuration: '25s', animationDirection: 'reverse' }}></div>
            <div className="absolute top-1/2 left-1/4 w-24 h-24 border border-white/20 rounded-full animate-bounce"></div>
          </div>
        </div> */}

      {/* <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Dipercaya Jutaan Pengguna</h2>
            <p className="text-blue-100 text-lg">Statistik yang membuktikan kualitas layanan kami</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { number: "10,000+", label: "Pasien Terlayani", icon: "👥" },
              { number: "500+", label: "Optometris Berpengalaman", icon: "👨‍⚕️" },
              { number: "50+", label: "Kota di Indonesia", icon: "🏙️" },
              { number: "98%", label: "Tingkat Kepuasan", icon: "⭐" }
            ].map((stat, index) => (
              <div key={index} className="group text-center">
                <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-2 border border-white/20">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {stat.icon}
                  </div>
                  <div className="text-5xl font-bold text-white mb-3 group-hover:scale-110 transition-transform duration-300">
                    {stat.number}
                  </div>
                  <div className="text-blue-100 font-medium group-hover:text-white transition-colors duration-300">
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div> */}
      {/* </section> */}

      {/* CTA Section */}
      <section className="py-24 bg-linear-to-br from-[#3DBD61] via-green-500 to-[#2563EB] relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-linear-to-r from-green-600/20 to-blue-600/20 animate-pulse"></div>
          <div className="absolute -top-20 -left-20 w-80 h-80 bg-white/5 rounded-full blur-3xl animate-float"></div>
          <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-float-delayed"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/3 rounded-full blur-3xl animate-spin" style={{ animationDuration: '30s' }}></div>
        </div>

        <div className="max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 shadow-lg mb-8">
            <Sparkles className="h-5 w-5 text-white mr-2" />
            <span className="text-white font-medium">Mulai Hari Ini - Gratis Konsultasi Pertama</span>
          </div>

          <h2 className="text-5xl md:text-6xl font-bold text-white mb-8 leading-tight">
            Siap Memulai Perjalanan
            <span className="block bg-linear-to-r from-yellow-200 to-white bg-clip-text text-transparent">
              Kesehatan Mata Anda?
            </span>
          </h2>

          <p className="text-xl text-green-100 mb-12 max-w-3xl mx-auto leading-relaxed">
            Bergabunglah dengan ribuan pengguna yang telah merasakan layanan terbaik kami.
            Dapatkan konsultasi gratis dan solusi kesehatan mata terpersonalisasi.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
            <button className="group relative bg-white text-[#2563EB] px-10 py-4 rounded-2xl text-lg font-bold hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
              <span className="relative z-10 flex items-center justify-center">
                Daftar Sekarang
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
              <div className="absolute inset-0 bg-linear-to-r from-yellow-100 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>

            <button className="group relative border-2 border-white text-white px-10 py-4 rounded-2xl text-lg font-bold hover:bg-white hover:text-[#2563EB] transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
              <span className="relative z-10 flex items-center justify-center">
                <Phone className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                Hubungi Kami
              </span>
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-8 text-white/80">
            <div className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              <span className="text-sm font-medium">100% Aman & Terpercaya</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              <span className="text-sm font-medium">Response &lt; 5 Menit</span>
            </div>
            <div className="flex items-center">
              <Star className="h-5 w-5 mr-2 text-yellow-300" />
              <span className="text-sm font-medium">Rating 4.9/5</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-linear-to-br from-gray-900 via-slate-900 to-gray-800 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>

        <div className="relative z-10 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
              <div className="md:col-span-1">
                <div className="flex items-center space-x-3 mb-6 group">
                  <div className="relative">
                    <Eye className="h-10 w-10 text-[#2563EB] group-hover:scale-110 transition-transform duration-300" />
                    <div className="absolute -inset-2 bg-linear-to-r from-[#2563EB] to-[#3DBD61] rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-300 blur"></div>
                  </div>
                  <span className="text-3xl font-bold bg-linear-to-r from-[#2563EB] to-[#3DBD61] bg-clip-text text-transparent">
                    Halo Optom
                  </span>
                </div>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  {/* Layanan kesehatan mata terdepan di Indonesia dengan teknologi AI dan layanan profesional terpercaya. */}
                  Layanan konsultasi dan edukasi kesehatan mata yang dikelola secara personal.
                </p>
                {/* <div className="flex space-x-4">
                  {['f', 't', 'i', 'y'].map((social, index) => (
                    <div key={index} className="group w-12 h-12 bg-linear-to-r from-[#2563EB] to-[#3DBD61] rounded-xl flex items-center justify-center hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
                      <span className="text-white font-bold text-lg group-hover:scale-110 transition-transform duration-300">{social}</span>
                    </div>
                  ))}
                </div> */}
              </div>

              <div>
                <h3 className="text-xl font-bold mb-6 text-white">Layanan</h3>
                <ul className="space-y-4">
                  {/* {['Konsultasi Online', 'Pemeriksaan Homecare', 'Toko Kacamata', 'Rekam Medis'].map((item, index) => ( */}
                  {['Konsultasi Online', 'Toko Kacamata'].map((item, index) => {
                    const links = ['/layanan/konsultasi', '/layanan/shop']; // Map to appropriate links
                    return (
                      <li key={index}>
                        <a href={links[index]} className="text-gray-300 hover:text-[#3DBD61] transition-all duration-300 flex items-center group">
                          <ArrowRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                          {item}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-6 text-white">Informasi</h3>
                <ul className="space-y-4">
                  {['Tentang Halo Optom', 'Layanan', 'FAQ', 'Sitemap'].map((item, index) => {
                    const links = ['/#about', '/#layanan', '/faq', '/sitemap'];
                    return (
                      <li key={index}>
                        <a href={links[index]} className="text-gray-300 hover:text-[#3DBD61] transition-all duration-300 flex items-center group">
                          <ArrowRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300" />
                          {item}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-6 text-white">Kontak</h3>
                <div className="space-y-4">
                  {[
                    { icon: Phone, text: '+62 823-2161-6003' },
                    { icon: Mail, text: 'halooptom@gmail.com' },
                    { icon: MapPin, text: 'Paseh Babakan Baru, Tuguraja, Cihideung, Kota Tasikmalaya, Jawa Barat' }
                  ].map((contact, index) => {
                    const IconComponent = contact.icon;
                    return (
                      <div key={index} className="flex items-center group cursor-pointer">
                        <div className="bg-linear-to-r from-[#2563EB] to-[#3DBD61] p-2 rounded-lg mr-4 group-hover:scale-110 transition-transform duration-300">
                          <IconComponent className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-gray-300 group-hover:text-white transition-colors duration-300">{contact.text}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Newsletter Signup */}
                <div className="mt-8">
                  <h4 className="text-lg font-semibold mb-4 text-white">Newsletter</h4>
                  <div className="flex">
                    <input
                      type="email"
                      placeholder="Email Anda"
                      className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-l-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#2563EB] transition-colors duration-300"
                    />
                    <button className="bg-linear-to-r from-[#2563EB] to-[#3DBD61] px-6 py-3 rounded-r-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:-translate-y-0.5">
                      <ArrowRight className="h-5 w-5 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-700 mt-16 pt-8">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <p className="text-gray-400 mb-4 md:mb-0">
                  &copy; 2024 Halo Optom. All rights reserved.
                </p>
                <div className="flex space-x-6 text-gray-400">
                  <Link href="/privacy-policy" className="hover:text-[#3DBD61] transition-colors duration-300">
                    Privacy Policy
                  </Link>
                  <Link href="/terms-of-service" className="hover:text-[#3DBD61] transition-colors duration-300">
                    Terms of Service
                  </Link>
                  <Link href="/cookie-policy" className="hover:text-[#3DBD61] transition-colors duration-300">
                    Cookie Policy
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        
        @keyframes float-delayed {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-15px);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
        
        .delay-200 {
          animation-delay: 0.2s;
        }
        
        .delay-400 {
          animation-delay: 0.4s;
        }
        
        .delay-600 {
          animation-delay: 0.6s;
        }
        
        .delay-800 {
          animation-delay: 0.8s;
        }
      `}</style>
    </div>
  );
}
