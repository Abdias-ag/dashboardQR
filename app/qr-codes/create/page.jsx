'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function QrCodesCreateRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/create-qr');
  }, [router]);

  return null;
}
