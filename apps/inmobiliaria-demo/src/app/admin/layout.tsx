'use client';

import React from 'react';
import AdminSidebar from './components/AdminSidebar';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-[#d4a843]/30">
            {/* Sidebar */}
            <AdminSidebar />

            {/* Main Content Area */}
            <main className="pl-72 min-h-screen" style={{ paddingTop: '100px' }}>
                <div className="p-8 max-w-[1600px] mx-auto">
                    {children}
                </div>
            </main>

            {/* Background elements */}
            <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none -z-10" />
            <div className="fixed bottom-0 left-72 w-[400px] h-[400px] bg-[#d4a843]/5 rounded-full blur-[100px] pointer-events-none -z-10" />
        </div>
    );
}
