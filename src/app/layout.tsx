// src/app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/context/AuthContext';
import PageLoaderWrapper from '../components/PageLoaderWrapper';
import StripeWrapper from '../components/StripeWrapper';
import { Toaster } from '@/components/ui/toaster'; // ✅ Import Toaster

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'KnotReels – Watch, Create, Connect',
  description: 'A creative content platform for sharing powerful microfilms.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <StripeWrapper>
            <PageLoaderWrapper>
              {children}
              <Toaster /> {/* ✅ Toast UI gets mounted here */}
            </PageLoaderWrapper>
          </StripeWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
