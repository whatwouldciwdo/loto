"use client"

import { createContext, useContext, useState, ReactNode } from 'react'
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
    id: string
    type: ToastType
    title: string
    message?: string
}

interface ToastContextType {
    showToast: (type: ToastType, title: string, message?: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([])

    const showToast = (type: ToastType, title: string, message?: string) => {
        const id = Math.random().toString(36).substr(2, 9)
        const newToast = { id, type, title, message }

        setToasts(prev => [...prev, newToast])

        // Auto remove after 5 seconds
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id))
        }, 5000)
    }

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}

            {/* Toast Container */}
            <div className="fixed top-4 right-4 z-50 space-y-3 max-w-md">
                {toasts.map(toast => (
                    <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
                ))}
            </div>
        </ToastContext.Provider>
    )
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
    const icons = {
        success: <CheckCircle2 className="w-5 h-5 text-neon" />,
        error: <XCircle className="w-5 h-5 text-red-400" />,
        warning: <AlertCircle className="w-5 h-5 text-yellow-400" />,
        info: <Info className="w-5 h-5 text-blue-400" />,
    }

    const backgrounds = {
        success: 'bg-dark border-neon',
        error: 'bg-dark border-red-500',
        warning: 'bg-dark border-yellow-500',
        info: 'bg-dark border-blue-500',
    }

    return (
        <div
            className={`${backgrounds[toast.type]} border-2 rounded-xl p-4 shadow-2xl backdrop-blur-sm animate-slide-in-right`}
            style={{ animation: 'slideInRight 0.3s ease-out' }}
        >
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                    {icons[toast.type]}
                </div>
                <div className="flex-1">
                    <h4 className="font-semibold text-white mb-1">{toast.title}</h4>
                    {toast.message && (
                        <p className="text-sm text-gray-300">{toast.message}</p>
                    )}
                </div>
                <button
                    onClick={onClose}
                    className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    )
}

export function useToast() {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error('useToast must be used within ToastProvider')
    }
    return context
}
