'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import LogoLoader from './LogoLoader'; // or wherever your loading logo component lives

export default function PageLoaderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 700); // adjust duration if needed

    return () => clearTimeout(timeout);
  }, [pathname]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
        <LogoLoader />
      </div>
    );
  }

  return <>{children}</>;
}
