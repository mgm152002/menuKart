'use client';

import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
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

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/orders/current');
      if (!response.ok) {
        throw new Error('Failed to fetch current orders');
      }
      const data = await response.json();
      setOrders(Array.isArray(data.orders) ? data.orders : []);
    } catch (err: any) {
      setError(err.message);
      toast.error(`Error fetching orders: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleOrderDone = async (orderId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/done`, {
        method: 'PUT',
      });
      if (!response.ok) {
        throw new Error('Failed to mark order as done');
      }
      toast.success('Order marked as done!');
      fetchOrders(); // Refresh the orders list
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading current orders...</div>;
  }

  if (error) {
    return <div className="flex min-h-screen items-center justify-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AdminNavbar />
      <div className="container mx-auto p-4 flex-grow">
        <h1 className="mb-4 text-2xl font-bold">Current Orders</h1>
        {orders.length === 0 ? (
          <p>No current orders.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer Phone</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment Status</TableHead>
                  <TableHead>Actions</TableHead>
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
                    <TableCell>
                      <Button onClick={() => handleOrderDone(order._id)} size="sm">Mark Done</Button>
                    </TableCell>
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