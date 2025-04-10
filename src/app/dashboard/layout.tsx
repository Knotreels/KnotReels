import { ReactNode } from "react";
import Sidebar from "@/components/Sidebar";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/context/AuthContext"; // ✅ Import AuthProvider

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider> {/* ✅ Wrap entire app in AuthProvider */}
      <div className="min-h-screen bg-[#0e0e0e] text-white flex">
        <div className="fixed z-30">
          <Sidebar isOpen={true} />
        </div>

        <div className="ml-64 w-full">
          <main className="overflow-y-auto">{children}</main>
          <Toaster />
        </div>
      </div>
    </AuthProvider>
  );
}
