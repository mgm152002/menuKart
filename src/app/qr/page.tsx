'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import AdminNavbar from '@/components/AdminNavbar';
import { toast } from 'sonner';

export default function QRPage() {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [userMenuUrl, setUserMenuUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQrCode = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/qr');
        if (!response.ok) {
          throw new Error('Failed to fetch QR code');
        }
        const data = await response.json();
        setQrCode(data.qrCode);
        setUserMenuUrl(data.userMenuUrl);
      } catch (err: any) {
        setError(err.message);
        toast.error(`Error generating QR: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchQrCode();
  }, []);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Generating QR Code...</div>;
  }

  if (error) {
    return <div className="flex min-h-screen items-center justify-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AdminNavbar />
      <div className="flex-grow flex flex-col items-center justify-center p-4">
        <h1 className="mb-4 text-2xl font-bold">Your QR Code</h1>
        {qrCode ? (
          <div className="relative h-64 w-64">
            <Image src={qrCode} alt="QR Code" layout="fill" objectFit="contain" />
          </div>
        ) : (
          <p>No QR code generated.</p>
        )}
        {userMenuUrl && (
          <div className="mt-4 text-center">
            <p className="font-semibold">Scan this QR code or visit:</p>
            <a href={userMenuUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
              {userMenuUrl}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}