'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';

export default function SignupPage() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const phone = formData.get('phone');
    const password = formData.get('password');

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, password }),
      });

      if (response.ok) {
        toast.success('Account created successfully!');
        window.location.href = '/login';
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to create account.');
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
        <h2 className="mb-6 text-center text-2xl font-bold">Sign Up</h2>
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
            {loading ? 'Signing Up...' : 'Sign Up'}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account? <Link href="/login" className="text-blue-500 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}