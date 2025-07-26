'use client';

import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import MenuItemForm from '@/components/MenuItemForm';
import AdminNavbar from '@/components/AdminNavbar';
import { toast } from 'sonner';

interface MenuItem {
  _id: string;
  itemname: string;
  price: number;
  category?: string;
  isVisible?: boolean;
}

export default function AdminMenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const router = useRouter();

  const fetchMenuItems = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/menu');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to fetch menu items: ${errorData.message || response.statusText}`);
      }
      const data = await response.json();
      setMenuItems(Array.isArray(data.menuItems) ? data.menuItems : []);
    } catch (err: any) {
      setError(err.message);
      toast.error(`Error fetching menu: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const handleAddMenuItem = async (formData: { itemname: string; price: number; category?: string; isVisible?: boolean }) => {
    setLoading(true);
    try {
      const response = await fetch('/api/menu/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Menu item added successfully!');
        setIsAddModalOpen(false);
        fetchMenuItems();
      } else {
        const errorData = await response.json();
        toast.error(`Error adding item: ${errorData.message}`);
      }
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditMenuItem = async (formData: { itemname: string; price: number; category?: string; isVisible?: boolean }) => {
    if (!editingItem) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/menu/${editingItem._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Menu item updated successfully!');
        setIsEditModalOpen(false);
        setEditingItem(null);
        fetchMenuItems();
      } else {
        const errorData = await response.json();
        toast.error(`Error updating item: ${errorData.message}`);
      }
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      setLoading(true);
      try {
        const response = await fetch(`/api/menu/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          toast.success('Menu item deleted successfully!');
          fetchMenuItems(); // Refresh the menu list
        } else {
          const errorData = await response.json();
          toast.error(`Error deleting item: ${errorData.message}`);
        }
      } catch (err: any) {
        toast.error(`Error: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const filteredMenuItems = menuItems.filter((item) => {
    const matchesSearch = item.itemname.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(menuItems.map((item) => item.category).filter(Boolean))) as string[];

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading menu...</div>;
  }

  if (error) {
    return <div className="flex min-h-screen items-center justify-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AdminNavbar />
      <div className="container mx-auto p-4 flex-grow">
        <h1 className="mb-4 text-2xl font-bold">Admin Menu</h1>
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button>Add New Item</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Menu Item</DialogTitle>
              </DialogHeader>
              <MenuItemForm onSubmit={handleAddMenuItem} onCancel={() => setIsAddModalOpen(false)} />
            </DialogContent>
          </Dialog>
          <Button onClick={() => router.push('/qr')}>Generate QR</Button>
          <Input
            type="text"
            placeholder="Search by item name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-auto flex-grow"
          />
          <Select onValueChange={setSelectedCategory} value={selectedCategory}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {filteredMenuItems.length === 0 ? (
          <p>No menu items available or matching your search/filter criteria.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Visible</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMenuItems.map((item) => (
                  <TableRow key={item._id}>
                    <TableCell>{item.itemname}</TableCell>
                    <TableCell>${item.price.toFixed(2)}</TableCell>
                    <TableCell>{item.category || 'N/A'}</TableCell>
                    <TableCell>{item.isVisible ? 'Yes' : 'No'}</TableCell>
                    <TableCell className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingItem(item);
                          setIsEditModalOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(item._id)}>Delete</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Menu Item</DialogTitle>
            </DialogHeader>
            {editingItem && (
              <MenuItemForm
                initialData={editingItem}
                onSubmit={handleEditMenuItem}
                onCancel={() => setIsEditModalOpen(false)}
                isEditing
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
