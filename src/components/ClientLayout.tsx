"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "@/components/Sidebar"; // Assuming you have one
import TopNav from "./TopNav";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <PayPalScriptProvider options={{ clientId: "test" }}>
      <div className="flex min-h-screen bg-background text-foreground">
        
        {/* Sidebar - Desktop */}
        <aside className="hidden lg:block w-64 bg-zinc-900 text-white shadow-lg">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        </aside>

        {/* Sidebar - Mobile Drawer */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div className="w-64 bg-zinc-900 text-white shadow-xl">
              <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            </div>
            <div
              className="flex-1 bg-black bg-opacity-50"
              onClick={() => setSidebarOpen(false)}
            />
          </div>
        )}

        <main className="flex-1 flex flex-col">
          {/* Mobile Nav */}
          <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-zinc-800 text-white shadow-md">
            <button onClick={() => setSidebarOpen(true)}>
              <Menu size={28} />
            </button>
            <span className="font-bold text-xl">KnotReels</span>
          </div>

          {/* TopNav for larger screens */}
          <div className="hidden lg:block">
            <TopNav />
          </div>

          {/* Page Content */}
          <div className="p-4 flex-1">{children}</div>
        </main>
      </div>
    </PayPalScriptProvider>
  );
}
