'use client';

import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminNavbar from '@/components/AdminNavbar';
import { toast } from 'sonner';

interface FeedbackItem {
  _id: string;
  hotelId: string;
  userId?: { _id: string; phone: string };
  itemId?: { _id: string; itemname: string };
  rating: number;
  comment?: string;
  timestamp: string;
}

export default function AdminFeedbackPage() {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeedback = async () => {
      setLoading(true);
      try {
        // In a real app, you'd get the hotelId from the logged-in admin's session/token
        // For now, I'll assume a placeholder or fetch from a known admin ID if needed for testing.
        // For this example, I'll assume the API handles filtering by the logged-in admin.
        const response = await fetch('/api/feedback'); // API needs to filter by hotelId based on admin token
        if (!response.ok) {
          throw new Error('Failed to fetch feedback');
        }
        const data = await response.json();
        setFeedback(Array.isArray(data.feedback) ? data.feedback : []);
      } catch (err: any) {
        setError(err.message);
        toast.error(`Error fetching feedback: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, []);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading feedback...</div>;
  }

  if (error) {
    return <div className="flex min-h-screen items-center justify-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AdminNavbar />
      <div className="container mx-auto p-4 flex-grow">
        <h1 className="mb-4 text-2xl font-bold">Customer Feedback</h1>
        {feedback.length === 0 ? (
          <p>No feedback received yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rating</TableHead>
                  <TableHead>Comment</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>User Phone</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feedback.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell>{item.rating} / 5</TableCell>
                    <TableCell>{item.comment || 'N/A'}</TableCell>
                    <TableCell>{item.itemId?.itemname || 'Overall'}</TableCell>
                    <TableCell>{item.userId?.phone || 'Anonymous'}</TableCell>
                    <TableCell>{new Date(item.timestamp).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
