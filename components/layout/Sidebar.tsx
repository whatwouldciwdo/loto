"use client"

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Home, FileEdit, ClipboardList, Users, LogOut, ChevronLeft, ChevronRight } from 'lucide-react'

interface SidebarProps {
    session: any
}

export default function Sidebar({ session }: SidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(false)

    return (
        <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-dark text-white flex flex-col transition-all duration-300`}>
            {/* Logo Section */}
            <div className="p-6 border-b border-gray-700 flex items-center justify-between">
                {!isCollapsed ? (
                    <Link href="/" className="flex items-center gap-3 group">
                        <Image
                            src="/logo.png"
                            alt="LOTO System"
                            width={48}
                            height={48}
                            className="group-hover:scale-105 transition-transform"
                        />
                        <div>
                            <h1 className="text-xl font-bold text-white">LOTO System</h1>
                            <p className="text-xs text-gray-400">Lockout/Tagout</p>
                        </div>
                    </Link>
                ) : (
                    <Link href="/" className="mx-auto">
                        <Image
                            src="/logo.png"
                            alt="LOTO System"
                            width={100}
                            height={100}
                            className="hover:scale-105 transition-transform"
                        />
                    </Link>
                )}
            </div>

            {/* Toggle Button */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="mx-4 my-2 p-2 rounded-lg bg-gray-800 hover:bg-neon hover:text-dark transition-colors flex items-center justify-center"
                title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
                {isCollapsed ? (
                    <ChevronRight className="w-5 h-5" />
                ) : (
                    <ChevronLeft className="w-5 h-5" />
                )}
            </button>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
                <Link
                    href="/"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-neon hover:text-dark transition-colors group"
                    title="Dashboard"
                >
                    <Home className="w-5 h-5 flex-shrink-0" />
                    {!isCollapsed && <span className="font-medium">Dashboard</span>}
                </Link>

                <Link
                    href="/loto/request"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-neon hover:text-dark transition-colors group"
                    title="Create Request"
                >
                    <FileEdit className="w-5 h-5 flex-shrink-0" />
                    {!isCollapsed && <span className="font-medium">Create Request</span>}
                </Link>

                <Link
                    href="/loto"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-neon hover:text-dark transition-colors group"
                    title="All LOTO"
                >
                    <ClipboardList className="w-5 h-5 flex-shrink-0" />
                    {!isCollapsed && <span className="font-medium">All LOTO</span>}
                </Link>

                {session?.role === 'ADMIN' && (
                    <Link
                        href="/admin/users"
                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-neon hover:text-dark transition-colors group"
                        title="User Management"
                    >
                        <Users className="w-5 h-5 flex-shrink-0" />
                        {!isCollapsed && <span className="font-medium">User Management</span>}
                    </Link>
                )}
            </nav>

            {/* Copyright Section */}
            <div className="px-4 py-3">
                {!isCollapsed ? (
                    <div className="text-center">
                        <p className="text-xs text-gray-400 mb-1">© 2026 LoTo System</p>
                        <p className="text-xs text-gray-500">All rights reserved</p>
                    </div>
                ) : (
                    <div className="text-center">
                        <p className="text-xs text-gray-500">©</p>
                    </div>
                )}
            </div>

            {/* User Section */}
            <div className="p-4 border-t border-gray-700">
                {!isCollapsed ? (
                    <>
                        <Link
                            href="/profile"
                            className="flex items-center gap-3 mb-3 p-2 -m-2 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer group"
                            title="Profile & Change Password"
                        >
                            <div className="w-10 h-10 bg-neon rounded-full flex items-center justify-center text-dark font-bold flex-shrink-0 group-hover:ring-2 group-hover:ring-neon/50 transition-all">
                                {session?.username?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-white truncate">{session?.username || 'User'}</p>
                                <Badge variant="outline" className="text-xs border-neon text-neon">{session?.role || 'USER'}</Badge>
                            </div>
                        </Link>
                        <form action="/api/auth/logout" method="POST">
                            <Button
                                type="submit"
                                variant="outline"
                                size="sm"
                                className="w-full border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Logout
                            </Button>
                        </form>
                    </>
                ) : (
                    <div className="flex flex-col items-center gap-3">
                        <Link
                            href="/profile"
                            className="hover:ring-2 hover:ring-neon/50 rounded-full transition-all"
                            title="Profile & Change Password"
                        >
                            <div className="w-10 h-10 bg-neon rounded-full flex items-center justify-center text-dark font-bold">
                                {session?.username?.[0]?.toUpperCase() || 'U'}
                            </div>
                        </Link>
                        <form action="/api/auth/logout" method="POST">
                            <Button
                                type="submit"
                                variant="ghost"
                                size="sm"
                                className="p-2 hover:bg-gray-800"
                                title="Logout"
                            >
                                <LogOut className="w-5 h-5" />
                            </Button>
                        </form>
                    </div>
                )}
            </div>
        </aside>
    )
}
