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

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-gray-50">
                {children}
            </main>
        </div>
    )
}
