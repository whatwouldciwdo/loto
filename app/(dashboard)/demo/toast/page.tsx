"use client"

import { useToast } from '@/components/ui/toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle, AlertCircle, Info } from 'lucide-react'

export default function ToastDemoPage() {
    const { showToast } = useToast()

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-dark mb-2">Toast Notification Demo</h1>
                    <p className="text-gray-600">Test all toast variants with LOTO system design</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border-2 border-neon">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-6 h-6 text-neon" />
                                <CardTitle className="text-neon">Success Toast</CardTitle>
                            </div>
                            <CardDescription>For completed actions and approvals</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button
                                variant="neon"
                                className="w-full"
                                onClick={() => showToast('success', 'HAR Approved!', 'LOTO status updated to PENDING_OP')}
                            >
                                Approval Success
                            </Button>
                            <Button
                                variant="neon"
                                className="w-full"
                                onClick={() => showToast('success', 'LOTO Created!', 'Request #LOTO-20260127-0001 has been created')}
                            >
                                Creation Success
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-red-500">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <XCircle className="w-6 h-6 text-red-500" />
                                <CardTitle className="text-red-600">Error Toast</CardTitle>
                            </div>
                            <CardDescription>For failures and validation errors</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button
                                variant="destructive"
                                className="w-full"
                                onClick={() => showToast('error', 'Submission Failed', 'Required fields are missing')}
                            >
                                Validation Error
                            </Button>
                            <Button
                                variant="destructive"
                                className="w-full"
                                onClick={() => showToast('error', 'Network Error', 'Failed to connect to server. Please try again.')}
                            >
                                Network Error
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-yellow-500">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <AlertCircle className="w-6 h-6 text-yellow-500" />
                                <CardTitle className="text-yellow-600">Warning Toast</CardTitle>
                            </div>
                            <CardDescription>For pending actions and alerts</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button
                                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
                                onClick={() => showToast('warning', 'Pending HAR Approval', 'Cannot proceed until approved by SP/SPS HAR')}
                            >
                                Pending Action
                            </Button>
                            <Button
                                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
                                onClick={() => showToast('warning', 'Equipment Not Found', 'Selected equipment may have been removed')}
                            >
                                Data Warning
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-blue-500">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Info className="w-6 h-6 text-blue-500" />
                                <CardTitle className="text-blue-600">Info Toast</CardTitle>
                            </div>
                            <CardDescription>For general information and updates</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <Button
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                                onClick={() => showToast('info', 'System Update', 'New features have been added to the LOTO system')}
                            >
                                System Info
                            </Button>
                            <Button
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                                onClick={() => showToast('info', 'Pending Requests', 'You have 3 LOTO requests awaiting your review')}
                            >
                                Notification
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                <Card className="mt-8 bg-dark text-white">
                    <CardHeader>
                        <CardTitle className="text-neon">Usage Example</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <pre className="text-sm bg-gray-900 p-4 rounded overflow-x-auto">
                            {`import { useToast } from '@/components/ui/toast'

const { showToast } = useToast()

// Success
showToast('success', 'HAR Approved!', 'LOTO status: PENDING_OP')

// Error  
showToast('error', 'Failed to submit', 'Check required fields')

// Warning
showToast('warning', 'Pending approval', 'HAR approval required')

// Info
showToast('info', 'System update', 'New features available')`}
                        </pre>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
