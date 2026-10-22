import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import Link from 'next/link'
import { ArrowIcon } from '@/components/ui/icons'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileEdit, ClipboardList, Lock, Unlock, Sparkles, Activity, User, TrendingUp, AlertTriangle, Shield, CheckCircle2, Phone, Wrench } from 'lucide-react'
import prisma from '@/lib/db/prisma'

export default async function DashboardPage() {
    const session = await getSession()

    if (!session) {
        redirect('/login')
    }

    // Fetch LOTO statistics
    const stats = await prisma.lotoRequest.groupBy({
        by: ['status'],
        _count: true,
    })

    const totalLoto = stats.reduce((acc, curr) => acc + curr._count, 0)
    const requestCount = stats.find(s => s.status === 'REQUEST')?._count || 0
    const draftCount = stats.find(s => s.status === 'DRAFT')?._count || 0
    const activeCount = stats.find(s => s.status === 'ACTIVE')?._count || 0
    const closeCount = stats.find(s => s.status === 'CLOSE')?._count || 0

    return (
        <div className="min-h-screen bg-gray-50/70">
            {/* Hero Top Banner with Ambient Glow */}
            <div className="relative overflow-hidden bg-gradient-to-r from-dark via-gray-900 to-dark text-white border-b-2 border-neon animate-fade-in-down shadow-lg">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-neon/10 blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-1/3 w-64 h-64 rounded-full bg-neon/5 blur-2xl pointer-events-none"></div>

                <div className="container mx-auto px-4 md:px-8 py-6 md:py-8 relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                            <div className="bg-neon/15 border border-neon/40 w-11 h-11 md:w-12 md:h-12 rounded-xl flex items-center justify-center shadow-lg shadow-neon/20 animate-pulse-neon">
                                <Sparkles className="w-6 h-6 text-neon" />
                            </div>
                            <div>
                                <h1 className="text-xl md:text-3xl font-extrabold tracking-tight text-white flex flex-wrap items-center gap-2">
                                    Energy Verification & Isolation
                                    <span className="text-neon text-base md:text-2xl font-bold bg-neon/15 px-2.5 py-0.5 rounded-lg border border-neon/30">
                                        EVI System
                                    </span>
                                </h1>
                                <p className="text-xs md:text-sm text-gray-300 mt-1">
                                    Sistem manajemen keselamatan lockout/tagout digital terintegrasi PLTU/PLTGU Cilegon.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 self-end md:self-auto bg-white/5 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10">
                            <div className="text-right">
                                <p className="text-[11px] text-gray-400">Pengguna Aktif</p>
                                <p className="font-semibold text-white text-sm">{session.username}</p>
                            </div>
                            <Badge variant="outline" className="px-3 py-1 border-neon text-neon text-xs font-bold tracking-wider">
                                {session.role}
                            </Badge>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 md:px-8 py-6 md:py-10">
                {/* Section: Quick Actions */}
                <div className="mb-10">
                    <div className="flex items-center gap-3 mb-5">
                        <Badge variant="default" className="text-xs px-3.5 py-1.5 uppercase tracking-wider font-bold">
                            Aksi Cepat
                        </Badge>
                        <div className="h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {/* Card 1: Request LOTO */}
                        <Link href="/loto/request" className="block group">
                            <Card className="bg-neon border-neon/80 hover-lift h-full transition-all duration-300 shadow-md group-hover:shadow-neon/30">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="bg-dark w-12 h-12 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                                            <FileEdit className="w-6 h-6 text-neon" />
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-dark/10 flex items-center justify-center group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">
                                            <ArrowIcon variant="dark" className="w-4 h-4" />
                                        </div>
                                    </div>
                                    <CardTitle className="text-dark text-xl font-bold">Buat Request LOTO</CardTitle>
                                    <CardDescription className="text-dark-200 font-medium">
                                        Pengajuan izin isolasi peralatan baru (CAT.02 Single & Batch import WO).
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pt-2">
                                    <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider bg-dark text-white px-3 py-1.5 rounded-lg">
                                        Form Permintaan LOTO →
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>

                        {/* Card 2: Browse All LOTO */}
                        <Link href="/loto" className="block group">
                            <Card className="bg-dark border-dark hover-lift h-full transition-all duration-300 shadow-md group-hover:shadow-black/40">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="bg-neon w-12 h-12 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                                            <ClipboardList className="w-6 h-6 text-dark" />
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform">
                                            <ArrowIcon variant="neon" className="w-4 h-4" />
                                        </div>
                                    </div>
                                    <CardTitle className="text-white text-xl font-bold">Daftar Semua LOTO</CardTitle>
                                    <CardDescription className="text-gray-300 font-medium">
                                        Pantau status tiket, eksekusi tagging, print kartu tag, dan release.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="pt-2">
                                    <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider bg-neon text-dark px-3 py-1.5 rounded-lg">
                                        Lihat Seluruh Tiket →
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>

                        {/* Card 3: Asset & Contacts Management */}
                        <div className="flex flex-col gap-3">
                            <Link href="/admin/assets" className="flex-1 block group">
                                <Card className="bg-white border border-gray-200 hover-lift h-full p-4 flex items-center gap-4 transition-all duration-300 group-hover:border-blue-400 group-hover:shadow-md">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold flex-shrink-0 group-hover:scale-110 transition-transform">
                                        <Wrench className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-dark text-sm truncate">Manajemen Data Asset</p>
                                        <p className="text-xs text-gray-500 truncate">Tambah & perbarui data peralatan</p>
                                    </div>
                                    <ArrowIcon variant="dark" className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                </Card>
                            </Link>

                            <Link href="/admin/contacts" className="flex-1 block group">
                                <Card className="bg-white border border-gray-200 hover-lift h-full p-4 flex items-center gap-4 transition-all duration-300 group-hover:border-green-400 group-hover:shadow-md">
                                    <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center font-bold flex-shrink-0 group-hover:scale-110 transition-transform">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-dark text-sm truncate">Kontak WhatsApp</p>
                                        <p className="text-xs text-gray-500 truncate">Sesuaikan personil Har, Ops & K3</p>
                                    </div>
                                    <ArrowIcon variant="dark" className="w-4 h-4 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                </Card>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Section: Overview Statistics */}
                <div className="mb-10">
                    <div className="flex items-center gap-3 mb-5">
                        <Badge variant="default" className="text-xs px-3.5 py-1.5 uppercase tracking-wider font-bold">
                            Ringkasan Status
                        </Badge>
                        <div className="h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent"></div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
                        {/* Total LOTO */}
                        <Card className="hover-lift border-gray-200 bg-white shadow-sm hover:shadow-md animate-scale-in">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total LOTO</p>
                                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                                        <ClipboardList className="w-4 h-4 text-gray-600" />
                                    </div>
                                </div>
                                <p className="text-4xl font-extrabold text-dark tracking-tight mb-1">{totalLoto}</p>
                                <p className="text-xs text-gray-400 font-medium">Seluruh riwayat tiket</p>
                            </CardContent>
                        </Card>

                        {/* Requested / Draft */}
                        <Card className="hover-lift bg-amber-50/70 border-amber-200/80 shadow-sm hover:shadow-md animate-scale-in animate-delay-100">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-xs text-amber-800 font-bold uppercase tracking-wider">Menunggu</p>
                                    <div className="w-8 h-8 rounded-lg bg-amber-200/60 flex items-center justify-center">
                                        <FileEdit className="w-4 h-4 text-amber-700" />
                                    </div>
                                </div>
                                <p className="text-4xl font-extrabold text-amber-900 tracking-tight mb-1">{requestCount}</p>
                                <p className="text-xs text-amber-700 font-medium">Menunggu operator · {draftCount} draft</p>
                            </CardContent>
                        </Card>

                        {/* Active Tagged */}
                        <Card className="hover-lift bg-emerald-50/70 border-emerald-200/80 shadow-sm hover:shadow-md animate-scale-in animate-delay-200">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-xs text-emerald-800 font-bold uppercase tracking-wider">Aktif Diisolasi</p>
                                    <div className="w-8 h-8 rounded-lg bg-emerald-200/60 flex items-center justify-center">
                                        <Activity className="w-4 h-4 text-emerald-700 animate-pulse" />
                                    </div>
                                </div>
                                <p className="text-4xl font-extrabold text-emerald-900 tracking-tight mb-1">{activeCount}</p>
                                <p className="text-xs text-emerald-700 font-medium">Peralatan tagged & locked</p>
                            </CardContent>
                        </Card>

                        {/* Completed / Closed */}
                        <Card className="hover-lift bg-dark text-white border-dark shadow-sm hover:shadow-md animate-scale-in animate-delay-300">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-xs text-neon font-bold uppercase tracking-wider">Selesai / Release</p>
                                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                                        <Shield className="w-4 h-4 text-neon" />
                                    </div>
                                </div>
                                <p className="text-4xl font-extrabold text-neon tracking-tight mb-1">{closeCount}</p>
                                <p className="text-xs text-gray-400 font-medium">Berhasil dinormalkan</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Section: Workflow Info */}
                <div>
                    <div className="flex items-center gap-3 mb-5">
                        <Badge variant="default" className="text-xs px-3.5 py-1.5 uppercase tracking-wider font-bold">
                            Alur Prosedur Keselamatan
                        </Badge>
                        <div className="h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <Card className="hover-lift border-gray-200/90 shadow-sm hover:shadow-md animate-fade-in-up animate-delay-150">
                            <CardHeader className="pb-3">
                                <div className="w-11 h-11 bg-neon/20 border border-neon/50 rounded-xl flex items-center justify-center mb-2 shadow-sm">
                                    <Lock className="w-5 h-5 text-dark" />
                                </div>
                                <CardTitle className="text-lg font-bold">1. Tagging & Isolasi Energi</CardTitle>
                                <CardDescription className="text-gray-600 text-xs leading-relaxed">
                                    Mulai dari permohonan LOTO (CAT.02), verifikasi isolasi energi oleh tim operasi, penandatanganan konfirmasi, hingga pemasangan gembok dan print kartu tagging bahaya.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <Link href="/loto/request">
                                    <Button variant="outline" size="sm" className="font-semibold text-xs">
                                        Mulai Tagging <ArrowIcon className="ml-1.5 w-3.5 h-3.5" />
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>

                        <Card className="hover-lift border-gray-200/90 shadow-sm hover:shadow-md animate-fade-in-up animate-delay-300">
                            <CardHeader className="pb-3">
                                <div className="w-11 h-11 bg-dark text-neon rounded-xl flex items-center justify-center mb-2 shadow-sm">
                                    <Unlock className="w-5 h-5 text-neon" />
                                </div>
                                <CardTitle className="text-lg font-bold">2. Release & Normalisasi</CardTitle>
                                <CardDescription className="text-gray-600 text-xs leading-relaxed">
                                    Setelah pekerjaan pemeliharaan tuntas, lakukan inspeksi keselamatan, upload dokumentasi foto evidence, pencabutan kartu tag, dan normalisasi sistem kelistrikan / mekanikal.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="pt-0">
                                <Link href="/loto">
                                    <Button variant="outline" size="sm" className="font-semibold text-xs">
                                        Buka Tiket Aktif <ArrowIcon className="ml-1.5 w-3.5 h-3.5" />
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
