'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AdminNavbar from '@/components/AdminNavbar';
import { toast } from 'sonner';

interface KpiData {
  totalMenuItems: number;
  totalCurrentOrders: number;
  totalCompletedOrders: number;
  totalRevenue: number;
}

interface PopularItem {
  itemname: string;
  count: number;
}

export default function DashboardPage() {
  const [kpiData, setKpiData] = useState<KpiData | null>(null);
  const [popularItems, setPopularItems] = useState<PopularItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch KPIs
        const kpiResponse = await fetch('/api/admin/dashboard');
        if (!kpiResponse.ok) {
          const errorData = await kpiResponse.json();
          throw new Error(`Failed to fetch dashboard KPIs: ${errorData.message || kpiResponse.statusText}`);
        }
        const kpiData = await kpiResponse.json();
        setKpiData(kpiData);

        // Fetch Popular Items
        const popularItemsResponse = await fetch('/api/admin/analytics/popular-items');
        if (!popularItemsResponse.ok) {
          const errorData = await popularItemsResponse.json();
          throw new Error(`Failed to fetch popular items: ${errorData.message || popularItemsResponse.statusText}`);
        }
        const popularItemsData = await popularItemsResponse.json();
        setPopularItems(Array.isArray(popularItemsData.popularItems) ? popularItemsData.popularItems : []);

      } catch (err: any) {
        setError(err.message);
        toast.error(`Error fetching dashboard data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="flex min-h-screen items-center justify-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AdminNavbar />
      <div className="container mx-auto p-4 flex-grow">
        <h1 className="mb-6 text-3xl font-bold">Admin Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Menu Items</CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpiData?.totalMenuItems}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Orders</CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpiData?.totalCurrentOrders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Orders</CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <rect width="20" height="14" x="2" y="6" rx="2"></rect>
                <path d="M2 10h20"></path>
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpiData?.totalCompletedOrders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                className="h-4 w-4 text-muted-foreground"
              >
                <path d="M12 2v20M17 5H7l-2 10h14l-2 10z"></path>
              </svg>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${kpiData?.totalRevenue.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Popular Menu Items</CardTitle>
          </CardHeader>
          <CardContent>
            {popularItems.length === 0 ? (
              <p>No popular items yet.</p>
            ) : (
              <ul className="list-disc pl-5">
                {popularItems.map((item, index) => (
                  <li key={index}>{item.itemname} ({item.count} orders)</li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
