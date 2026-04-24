import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";
import { ConfirmDialogProvider } from "@/components/ui/confirm-dialog";

export const metadata: Metadata = {
    title: "Energy Verification & Isolation",
    description: "Lockout/Tagout Management System for Equipment Safety",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="antialiased" style={{ fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                <ToastProvider>
                    <ConfirmDialogProvider>
                        {children}
                    </ConfirmDialogProvider>
                </ToastProvider>
            </body>
        </html>
    );
}
