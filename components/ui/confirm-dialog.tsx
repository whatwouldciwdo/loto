"use client"

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { AlertTriangle, Info, XCircle, X } from 'lucide-react'
import { Button } from './button'

type ConfirmType = 'warning' | 'danger' | 'info'

interface ConfirmOptions {
    type?: ConfirmType
    title: string
    message: string
    confirmText?: string
    cancelText?: string
    onConfirm: () => void | Promise<void>
}

interface ConfirmDialogContextType {
    showConfirm: (options: ConfirmOptions) => void
}

const ConfirmDialogContext = createContext<ConfirmDialogContextType | undefined>(undefined)

export function ConfirmDialogProvider({ children }: { children: ReactNode }) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [options, setOptions] = useState<ConfirmOptions | null>(null)

    const showConfirm = useCallback((opts: ConfirmOptions) => {
        setOptions(opts)
        setOpen(true)
        setLoading(false)
    }, [])

    const handleClose = () => {
        if (loading) return
        setOpen(false)
        setOptions(null)
    }

    const handleConfirm = async () => {
        if (!options) return
        setLoading(true)
        try {
            await options.onConfirm()
        } finally {
            setLoading(false)
            setOpen(false)
            setOptions(null)
        }
    }

    const icons: Record<ConfirmType, ReactNode> = {
        warning: <AlertTriangle className="w-6 h-6 text-yellow-400" />,
        danger: <XCircle className="w-6 h-6 text-red-400" />,
        info: <Info className="w-6 h-6 text-blue-400" />,
    }

    const confirmColors: Record<ConfirmType, string> = {
        warning: 'bg-yellow-500 hover:bg-yellow-600 text-dark',
        danger: 'bg-red-500 hover:bg-red-600 text-white',
        info: 'bg-blue-500 hover:bg-blue-600 text-white',
    }

    const borderColors: Record<ConfirmType, string> = {
        warning: 'border-yellow-500/30',
        danger: 'border-red-500/30',
        info: 'border-blue-500/30',
    }

    const type = options?.type || 'warning'

    return (
        <ConfirmDialogContext.Provider value={{ showConfirm }}>
            {children}

            {open && options && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center"
                    style={{ animation: 'confirmFadeIn 0.2s ease-out' }}
                >
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={handleClose}
                    />

                    <div
                        className={`relative bg-dark border-2 ${borderColors[type]} rounded-2xl p-6 shadow-2xl w-full max-w-md mx-4`}
                        style={{ animation: 'confirmScaleIn 0.2s ease-out' }}
                    >
                        <button
                            onClick={handleClose}
                            disabled={loading}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                                {icons[type]}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-lg font-bold text-white mb-1">
                                    {options.title}
                                </h3>
                                <p className="text-sm text-gray-300 leading-relaxed">
                                    {options.message}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <Button
                                variant="outline"
                                onClick={handleClose}
                                disabled={loading}
                                className="flex-1 border-gray-600 text-gray-300 hover:bg-white/10 hover:text-white"
                            >
                                {options.cancelText || 'Batal'}
                            </Button>
                            <Button
                                onClick={handleConfirm}
                                disabled={loading}
                                className={`flex-1 ${confirmColors[type]} font-semibold`}
                            >
                                {loading ? 'Memproses...' : (options.confirmText || 'Konfirmasi')}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
                @keyframes confirmFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes confirmScaleIn {
                    from { opacity: 0; transform: scale(0.95) translateY(8px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
            `}</style>
        </ConfirmDialogContext.Provider>
    )
}

export function useConfirmDialog() {
    const context = useContext(ConfirmDialogContext)
    if (!context) {
        throw new Error('useConfirmDialog must be used within ConfirmDialogProvider')
    }
    return context
}
