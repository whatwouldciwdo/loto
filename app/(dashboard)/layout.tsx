import { getSession } from '@/lib/auth/session'
import Sidebar from '@/components/layout/Sidebar'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getSession()

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar session={session} />

            <main className="flex-1 overflow-y-auto bg-gray-50 pt-14 md:pt-0">
                {children}
            </main>
        </div>
    )
}
