'use client'

import { ReactNode } from 'react'
import Sidebar from '@/components/Sidebar'

interface CreatorLayoutProps {
  children: ReactNode
}

export default function CreatorLayout({ children }: CreatorLayoutProps) {
  return (
    <div className="min-h-screen bg-[#0e0e0e] flex">
      {/* Sidebar */}
      <div className="fixed z-30">
        <Sidebar isOpen={true} />
      </div>

      {/* Main content */}
      <div className="ml-64 w-full overflow-y-auto">
        {children}
      </div>
    </div>
  )
}
