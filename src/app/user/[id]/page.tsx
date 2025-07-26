'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export default function UserFormPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id: hotelId } = params; // The hotel ID from the URL
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Track QR scan when the page loads
    const trackQrScan = async () => {
      try {
        await fetch('/api/track/qr-scan', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ hotelId }),
        });
      } catch (error) {
        console.error('Failed to track QR scan:', error);
      }
    };
    trackQrScan();
  }, [hotelId]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const phone = formData.get('phone');
    const tableno = parseInt(formData.get('tableno') as string);

    try {
      const response = await fetch(`/api/user/${hotelId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, tableno }),
      });

      if (response.ok) {
        toast.success('Details submitted successfully!');
        router.push(`/user/menu/${hotelId}`);
      } else {
        const errorData = await response.json();
        toast.error(`Error: ${errorData.message}`);
      }
    } catch (error: any) {
      toast.error(`An unexpected error occurred: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h2 className="mb-6 text-center text-2xl font-bold">Enter Details</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" name="phone" type="text" required disabled={loading} />
          </div>
          <div className="mb-6">
            <Label htmlFor="tableno">Table Number</Label>
            <Input id="tableno" name="tableno" type="number" required disabled={loading} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Submitting...' : 'Proceed'}
          </Button>
        </form>
      </div>
    </div>
  );
}
