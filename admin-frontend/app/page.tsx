'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect handled by middleware — this is just a fallback
    router.replace('/login');
  }, [router]);

  return null;
}
