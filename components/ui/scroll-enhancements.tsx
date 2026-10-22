"use client"

import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'

export default function ScrollEnhancements() {
    const [scrollProgress, setScrollProgress] = useState(0)
    const [showBackToTop, setShowBackToTop] = useState(false)

    useEffect(() => {
        // Detect scrolling target: either window or <main> container (which has overflow-y-auto)
        const mainEl = document.querySelector('main')

        const handleScroll = () => {
            let scrollTop = 0
            let scrollHeight = 0
            let clientHeight = 0

            if (mainEl && mainEl.scrollHeight > mainEl.clientHeight) {
                scrollTop = mainEl.scrollTop
                scrollHeight = mainEl.scrollHeight
                clientHeight = mainEl.clientHeight
            } else {
                scrollTop = window.scrollY || document.documentElement.scrollTop
                scrollHeight = document.documentElement.scrollHeight
                clientHeight = window.innerHeight
            }

            const totalScroll = scrollHeight - clientHeight
            if (totalScroll > 0) {
                const progress = (scrollTop / totalScroll) * 100
                setScrollProgress(Math.min(100, Math.max(0, progress)))
            } else {
                setScrollProgress(0)
            }

            setShowBackToTop(scrollTop > 250)
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        if (mainEl) {
            mainEl.addEventListener('scroll', handleScroll, { passive: true })
        }

        // Initial check
        handleScroll()

        return () => {
            window.removeEventListener('scroll', handleScroll)
            if (mainEl) {
                mainEl.removeEventListener('scroll', handleScroll)
            }
        }
    }, [])

    const scrollToTop = () => {
        const mainEl = document.querySelector('main')
        if (mainEl && mainEl.scrollTop > 0) {
            mainEl.scrollTo({ top: 0, behavior: 'smooth' })
        }
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    return (
        <>
            {/* Top Scroll Progress Line (Neon Glow) */}
            <div
                className="fixed top-0 left-0 right-0 h-[3.5px] z-50 pointer-events-none transition-all duration-150 ease-out"
                style={{
                    background: 'linear-gradient(90deg, #B9FF66 0%, #A3FF33 50%, #B9FF66 100%)',
                    width: `${scrollProgress}%`,
                    boxShadow: scrollProgress > 0 ? '0 0 14px rgba(185, 255, 102, 0.9), 0 0 4px #B9FF66' : 'none',
                    opacity: scrollProgress > 0 ? 1 : 0,
                }}
            />

            {/* Modern Floating Back to Top Button */}
            <button
                onClick={scrollToTop}
                aria-label="Scroll to top"
                className={`fixed bottom-6 right-6 z-40 p-3 rounded-full bg-dark/85 text-neon backdrop-blur-md border border-neon/30 shadow-xl shadow-black/20 hover:bg-neon hover:text-dark hover:border-neon hover:shadow-neon/40 hover:-translate-y-1.5 active:translate-y-0 active:scale-90 transition-all duration-300 ease-out flex items-center justify-center group ${showBackToTop
                    ? 'opacity-100 translate-y-0 pointer-events-auto scale-100'
                    : 'opacity-0 translate-y-4 pointer-events-none scale-75'
                    }`}
            >
                <ArrowUp className="w-5 h-5 transition-transform duration-300 group-hover:-translate-y-0.5" />
                <span className="sr-only">Kembali ke atas</span>
            </button>
        </>
    )
}
