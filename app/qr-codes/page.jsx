'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function QrCodesRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/my-qrcodes');
  }, [router]);

  return null;
}
