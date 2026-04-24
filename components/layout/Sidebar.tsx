"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Home, FileEdit, ClipboardList, Users, LogOut, ChevronLeft, ChevronRight, Menu, X } from 'lucide-react'

interface SidebarProps {
    session: any
}

export default function Sidebar({ session }: SidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [isMobileOpen, setIsMobileOpen] = useState(false)
    const pathname = usePathname()

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileOpen(false)
    }, [pathname])

    // Close mobile menu on resize to desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setIsMobileOpen(false)
            }
        }
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => { document.body.style.overflow = '' }
    }, [isMobileOpen])

    const navLinks = [
        { href: '/', icon: Home, label: 'Dashboard' },
        { href: '/loto/request', icon: FileEdit, label: 'Create Request' },
        { href: '/loto', icon: ClipboardList, label: 'All LOTO' },
    ]

    const isActive = (href: string) => {
        if (href === '/') return pathname === '/'
        return pathname.startsWith(href)
    }

    const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => {
        const collapsed = mobile ? false : isCollapsed

        return (
            <>
                <div className="p-4 md:p-6 border-b border-gray-700 flex items-center justify-between">
                    {!collapsed ? (
                        <Link href="/" className="flex items-center gap-3 group">
                            <Image
                                src="/logo.png"
                                alt="LOTO System"
                                width={120}
                                height={120}
                                className="group-hover:scale-105 transition-transform"
                            />
                            <div>
                                <h1 className="text-xl font-bold text-white">EVI</h1>
                                <p className="text-xs text-gray-400">Energy Verification & Isolation</p>
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
                    {mobile && (
                        <button
                            onClick={() => setIsMobileOpen(false)}
                            className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            <X className="w-5 h-5 text-white" />
                        </button>
                    )}
                </div>

                {!mobile && (
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
                )}

                <nav className="flex-1 p-4 space-y-2">
                    {navLinks.map(({ href, icon: Icon, label }) => (
                        <Link
                            key={href}
                            href={href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${isActive(href)
                                ? 'bg-neon text-dark font-semibold'
                                : 'hover:bg-neon hover:text-dark hover:translate-x-1'
                                }`}
                            title={label}
                        >
                            <Icon className="w-5 h-5 flex-shrink-0" />
                            {!collapsed && <span className="font-medium">{label}</span>}
                        </Link>
                    ))}

                    {session?.role === 'ADMIN' && (
                        <Link
                            href="/admin/users"
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${isActive('/admin/users')
                                ? 'bg-neon text-dark font-semibold'
                                : 'hover:bg-neon hover:text-dark hover:translate-x-1'
                                }`}
                            title="User Management"
                        >
                            <Users className="w-5 h-5 flex-shrink-0" />
                            {!collapsed && <span className="font-medium">User Management</span>}
                        </Link>
                    )}
                </nav>

                <div className="px-4 py-3">
                    {!collapsed ? (
                        <div className="text-center">
                            <p className="text-xs text-gray-400 mb-1">© 2026 EVI System</p>
                            <p className="text-xs text-gray-500">All rights reserved</p>
                        </div>
                    ) : (
                        <div className="text-center">
                            <p className="text-xs text-gray-500">©</p>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-gray-700">
                    {!collapsed ? (
                        <>
                            <Link
                                href="/profile"
                                className="flex items-center gap-3 mb-3 p-2 -m-2 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer group"
                                title="Profile & Change Password"
                            >
                                <div className="w-10 h-10 bg-neon rounded-full flex items-center justify-center text-dark font-bold flex-shrink-0 group-hover:ring-4 group-hover:ring-neon/30 transition-all duration-300">
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
            </>
        )
    }

    return (
        <>
            <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-dark text-white flex items-center justify-between px-4 py-3 shadow-lg">
                <button
                    onClick={() => setIsMobileOpen(true)}
                    className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                    <Menu className="w-6 h-6" />
                </button>
                <Link href="/" className="flex items-center gap-2">
                    <Image src="/logo.png" alt="LOTO" width={32} height={32} />
                    <span className="font-bold text-lg">LOTO System</span>
                </Link>
                <Link
                    href="/profile"
                    className="w-8 h-8 bg-neon rounded-full flex items-center justify-center text-dark font-bold text-sm"
                >
                    {session?.username?.[0]?.toUpperCase() || 'U'}
                </Link>
            </div>

            {isMobileOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            <aside
                className={`md:hidden fixed top-0 left-0 bottom-0 w-72 bg-dark text-white flex flex-col z-50 transform transition-transform duration-300 ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <SidebarContent mobile={true} />
            </aside>

            <aside className={`hidden md:flex ${isCollapsed ? 'w-20' : 'w-64'} bg-dark text-white flex-col transition-all duration-300`}>
                <SidebarContent mobile={false} />
            </aside>
        </>
    )
}
