import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth/session'
import Link from 'next/link'
import { ArrowIcon } from '@/components/ui/icons'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileEdit, ClipboardList, Lock, Unlock, Sparkles, Activity, User, TrendingUp, AlertTriangle, Shield } from 'lucide-react'
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
        <div className="min-h-screen bg-gray-50">
            <div className="bg-gradient-to-br from-white via-gray-50 to-gray-100 border-b-2 border-neon animate-fade-in-down">
                <div className="container mx-auto px-4 md:px-8 py-4 md:py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-dark w-8 h-8 rounded-lg flex items-center justify-center">
                                <Sparkles className="w-4 h-4 text-neon" />
                            </div>
                            <div>
                                <h1 className="text-xl md:text-3xl font-bold text-dark">
                                    Managing LOTO Requests
                                    <span className="text-neon ml-1 md:ml-2 block md:inline text-lg md:text-3xl">for Workplace Safety</span>
                                </h1>
                                <p className="text-xs md:text-sm text-gray-600 mt-1 hidden md:block">
                                    Manage your lockout/tagout procedures with our digital management system.
                                </p>
                            </div>
                        </div>
                        <div className="hidden md:flex items-center gap-3">
                            <div className="text-right">
                                <p className="text-xs text-gray-500">Logged in as</p>
                                <p className="font-semibold text-dark">{session.username}</p>
                            </div>
                            <Badge variant="dark" className="px-4 py-2">{session.role}</Badge>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 md:px-8 py-6 md:py-12">
                <div className="mb-12">
                    <div className="flex items-center gap-3 mb-6">
                        <Badge variant="default" className="text-base px-4 py-2">
                            Quick Actions
                        </Badge>
                        <div className="h-px flex-1 bg-gray-200"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="bg-neon border-neon hover:shadow-2xl transition-all group cursor-pointer animate-fade-in-up">
                            <CardHeader>
                                <div className="flex items-start justify-between mb-2">
                                    <div className="bg-dark w-12 h-12 rounded-xl flex items-center justify-center">
                                        <FileEdit className="w-6 h-6 text-neon" />
                                    </div>
                                    <ArrowIcon variant="dark" className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <CardTitle className="text-dark">Request LOTO</CardTitle>
                                <CardDescription className="text-dark-200">
                                    Create new lockout/tagout request for equipment isolation
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href="/loto/request">
                                    <Button variant="default" className="w-full">
                                        Create Request
                                        <ArrowIcon className="ml-2 w-4 h-4" />
                                    </Button>
                                </Link>
                                <p className="text-xs text-dark-200 mt-3 font-medium">Form CAT.02</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-dark border-dark hover:shadow-2xl transition-all group cursor-pointer animate-fade-in-up animate-delay-200">
                            <CardHeader>
                                <div className="flex items-start justify-between mb-2">
                                    <div className="bg-neon w-12 h-12 rounded-xl flex items-center justify-center">
                                        <ClipboardList className="w-6 h-6 text-dark" />
                                    </div>
                                    <ArrowIcon variant="neon" className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <CardTitle className="text-white">Browse All LOTO</CardTitle>
                                <CardDescription className="text-gray-300">
                                    View and manage all lockout/tagout requests in the system
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href="/loto">
                                    <Button variant="neon" className="w-full">
                                        View List
                                        <ArrowIcon className="ml-2 w-4 h-4" />
                                    </Button>
                                </Link>
                                <p className="text-xs text-neon mt-3 font-medium">All Requests</p>
                            </CardContent>
                        </Card>

                    </div>
                </div>

                <div className="mb-12">
                    <div className="flex items-center gap-3 mb-6">
                        <Badge variant="default" className="text-base px-4 py-2">
                            Overview
                        </Badge>
                        <div className="h-px flex-1 bg-gray-200"></div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                        <Card className="animate-scale-in">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-sm text-gray-500 font-medium">Total LOTO</p>
                                    <ClipboardList className="w-5 h-5 text-gray-400" />
                                </div>
                                <p className="text-4xl font-bold text-dark mb-1">{totalLoto}</p>
                                <p className="text-xs text-gray-400">All time requests</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-yellow-50 border-yellow-200 animate-scale-in animate-delay-100">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-sm text-yellow-700 font-medium">Requested</p>
                                    <FileEdit className="w-5 h-5 text-yellow-500" />
                                </div>
                                <p className="text-4xl font-bold text-yellow-800 mb-1">{requestCount}</p>
                                <p className="text-xs text-yellow-600">Awaiting operator · {draftCount} draft</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-neon-50 border-neon-200 animate-scale-in animate-delay-200">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-sm text-gray-700 font-medium">Active</p>
                                    <Activity className="w-5 h-5 text-neon-600" />
                                </div>
                                <p className="text-4xl font-bold text-dark mb-1">{activeCount}</p>
                                <p className="text-xs text-gray-500">Equipment tagged</p>
                            </CardContent>
                        </Card>

                        <Card className="bg-dark border-dark animate-scale-in animate-delay-300">
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-sm text-neon font-medium">Completed</p>
                                    <Shield className="w-5 h-5 text-neon" />
                                </div>
                                <p className="text-4xl font-bold text-neon mb-1">{closeCount}</p>
                                <p className="text-xs text-gray-400">Successfully closed</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <div>
                    <div className="flex items-center gap-3 mb-6">
                        <Badge variant="default" className="text-base px-4 py-2">
                            LOTO Services
                        </Badge>
                        <div className="h-px flex-1 bg-gray-200"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="hover:shadow-xl transition-all animate-fade-in-up animate-delay-100">
                            <CardHeader>
                                <div className="w-12 h-12 bg-neon rounded-xl flex items-center justify-center mb-3">
                                    <Lock className="w-6 h-6 text-dark" />
                                </div>
                                <CardTitle>Tagging Workflow</CardTitle>
                                <CardDescription>
                                    Complete CAT.01 through CAT.05 forms for equipment isolation, including HAR approval and operator confirmation.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button variant="ghost" className="group">
                                    Learn more
                                    <ArrowIcon className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="hover:shadow-xl transition-all animate-fade-in-up animate-delay-300">
                            <CardHeader>
                                <div className="w-12 h-12 bg-dark rounded-xl flex items-center justify-center mb-3">
                                    <Unlock className="w-6 h-6 text-neon" />
                                </div>
                                <CardTitle>Release Process</CardTitle>
                                <CardDescription>
                                    Execute CAT.06 release workflow with photo documentation and final approval before equipment reactivation.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button variant="ghost" className="group">
                                    Learn more
                                    <ArrowIcon className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
