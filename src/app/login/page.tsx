'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const phone = formData.get('phone');
    const password = formData.get('password');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, password }),
      });

      if (response.ok) {
        toast.success('Logged in successfully!');
        window.location.href = '/adminmenu'; // Redirect to admin menu after successful login
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to login.');
      }
    } catch (error) {
      toast.error('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h2 className="mb-6 text-center text-2xl font-bold">Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" type="text" required disabled={loading} />
          </div>
          <div className="mb-6">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required disabled={loading} />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Logging In...' : 'Login'}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account? <Link href="/signup" className="text-blue-500 hover:underline">Sign Up</Link>
        </p>
      </div>
    </div>
  );
}