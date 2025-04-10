import { ReactNode } from 'react';
import Sidebar from '@/components/Sidebar';

export default function CreatorLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white flex">
      {/* Sidebar */}
      <div className="fixed z-30">
        <Sidebar isOpen={true} />
      </div>

      {/* Main content */}
      <div className="ml-64 w-full">
        <main className="overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
