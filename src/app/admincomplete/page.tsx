'use client';

import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AdminNavbar from '@/components/AdminNavbar';
import { toast } from 'sonner';

interface OrderItem {
  itemname: string;
  price: number;
  quantity: number;
}

interface Order {
  _id: string;
  order: OrderItem[];
  status: string;
  paymentstatus: string;
  customer: string;
}

export default function AdminCompletedOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/admin/orders/completed');
        if (!response.ok) {
          throw new Error('Failed to fetch completed orders');
        }
        const data = await response.json();
        setOrders(Array.isArray(data.orders) ? data.orders : []);
      } catch (err: any) {
        setError(err.message);
        toast.error(`Error fetching completed orders: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading completed orders...</div>;
  }

  if (error) {
    return <div className="flex min-h-screen items-center justify-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AdminNavbar />
      <div className="container mx-auto p-4 flex-grow">
        <h1 className="mb-4 text-2xl font-bold">Completed Orders</h1>
        {orders.length === 0 ? (
          <p>No completed orders.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer Phone</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell>
                      <ul>
                        {order.order.map((item, index) => (
                          <li key={index}>{item.itemname} (x{item.quantity}) - ${item.price.toFixed(2)}</li>
                        ))}
                      </ul>
                    </TableCell>
                    <TableCell>{order.status === 'true' ? 'Completed' : 'Pending'}</TableCell>
                    <TableCell>{order.paymentstatus}</TableCell>
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