// src/app/dashboard/layout.tsx
import { ReactNode } from 'react';
import Sidebar from '@/components/Sidebar';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/context/AuthContext';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const sidebarWidth = 800; // ensure this matches your sidebar width exactly

  return (
    <AuthProvider>
      <div className="min-h-screen bg-[#0e0e0e] text-white flex overflow-hidden">
        <Sidebar isOpen={true} />

        <div className={`flex-1 ml-[${100}px] overflow-auto`}>
          <main>{children}</main>
          <Toaster />
        </div>
      </div>
    </AuthProvider>
  );
}
