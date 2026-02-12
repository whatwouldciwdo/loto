"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { API_ROUTES } from '@/lib/constants'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

export default function LoginPage() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const response = await fetch(API_ROUTES.AUTH.LOGIN, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            })

            const data = await response.json()

            if (!response.ok) {
                setError(data.error || 'Login failed')
                return
            }

            // Full page navigation to ensure cookie is sent
            window.location.href = '/'
        } catch (err) {
            setError('An error occurred. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Features */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-dark via-dark-200 to-dark-400 p-12 flex-col justify-center relative overflow-hidden">
                {/* Decorative background pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-20 left-20 w-64 h-64 bg-neon rounded-full blur-3xl"></div>
                    <div className="absolute bottom-20 right-20 w-96 h-96 bg-neon rounded-full blur-3xl"></div>
                </div>

                <div className="relative z-10">
                    {/* Logo */}
                    <div className="mb-12">
                        <Image
                            src="/logo.png"
                            alt="LOTO Safe Web App"
                            width={180}
                            height={180}
                            className="mb-6"
                        />
                        <h1 className="text-4xl font-bold text-white mb-2">
                            LOTO Safe Web App
                        </h1>
                        <p className="text-neon text-lg font-semibold">
                            Lockout/Tagout Management System
                        </p>
                    </div>

                    {/* Features List */}
                    <div className="space-y-6 mt-12">
                        <FeatureItem
                            icon={<LockIcon />}
                            title="Adaptive Safety"
                            description="Our system effortlessly adapts to your safety needs, boosting compliance and simplifying your workflow."
                        />
                        <FeatureItem
                            icon={<ShieldIcon />}
                            title="Built to Last"
                            description="Experience unmatched reliability that goes above and beyond with lasting investment."
                        />
                        <FeatureItem
                            icon={<UsersIcon />}
                            title="Great User Experience"
                            description="Integrate our product into your workflow with an intuitive and easy-to-use interface."
                        />
                        <FeatureItem
                            icon={<RocketIcon />}
                            title="Innovative Safety"
                            description="Stay ahead with features that set new standards, addressing your evolving needs better than the rest."
                        />
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex justify-center mb-8">
                        <Image
                            src="/logo.png"
                            alt="LOTO Safe Web App"
                            width={80}
                            height={80}
                        />
                    </div>

                    <Card className="shadow-2xl border-2 border-gray-100">
                        <CardContent className="pt-8 pb-8 px-8">
                            <div className="mb-6">
                                <h2 className="text-3xl font-bold text-dark mb-2">Sign in</h2>
                                <p className="text-gray-600">Enter your credentials to access your account</p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                {error && (
                                    <Card className="bg-red-50 border-red-200">
                                        <CardContent className="pt-4 pb-4">
                                            <p className="text-red-700 font-medium text-sm">{error}</p>
                                        </CardContent>
                                    </Card>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="username">
                                        Username
                                    </Label>
                                    <Input
                                        id="username"
                                        type="text"
                                        required
                                        value={formData.username}
                                        onChange={(e) =>
                                            setFormData({ ...formData, username: e.target.value })
                                        }
                                        placeholder="Enter your username"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <Label htmlFor="password">
                                            Password
                                        </Label>
                                        <button
                                            type="button"
                                            className="text-xs text-gray-600 hover:text-dark transition-colors"
                                        >
                                            Forgot password?
                                        </button>
                                    </div>
                                    <Input
                                        id="password"
                                        type="password"
                                        required
                                        value={formData.password}
                                        onChange={(e) =>
                                            setFormData({ ...formData, password: e.target.value })
                                        }
                                        placeholder="Enter your password"
                                    />
                                </div>

                                <div className="flex items-center">
                                    <input
                                        id="remember"
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-gray-300 text-neon focus:ring-neon"
                                    />
                                    <label htmlFor="remember" className="ml-2 text-sm text-gray-700">
                                        Remember me
                                    </label>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={loading}
                                    variant="default"
                                    size="lg"
                                    className="w-full"
                                >
                                    {loading ? 'Signing in...' : 'Sign in'}
                                </Button>
                            </form>

                            <div className="mt-6 text-center">
                                <p className="text-sm text-gray-600">
                                    Don't have an account?{' '}
                                    <button className="text-dark font-semibold hover:underline">
                                        Contact Admin
                                    </button>
                                </p>
                            </div>

                            {/* Test Credentials */}
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <p className="text-xs text-gray-400 text-center mb-2">Test Credentials:</p>
                                <div className="flex justify-center">
                                    <Badge variant="outline" className="font-mono text-xs">
                                        admin / password123
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

// Feature Item Component
function FeatureItem({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
    return (
        <div className="flex gap-4">
            <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-neon rounded-lg flex items-center justify-center">
                    {icon}
                </div>
            </div>
            <div>
                <h3 className="text-white font-bold text-lg mb-1">{title}</h3>
                <p className="text-gray-300 text-sm leading-relaxed">{description}</p>
            </div>
        </div>
    )
}

// Modern SVG Icons
function LockIcon() {
    return (
        <svg className="w-6 h-6 text-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
    )
}

function ShieldIcon() {
    return (
        <svg className="w-6 h-6 text-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
    )
}

function UsersIcon() {
    return (
        <svg className="w-6 h-6 text-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
    )
}

function RocketIcon() {
    return (
        <svg className="w-6 h-6 text-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
    )
}
