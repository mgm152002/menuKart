'use client';

import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';

interface MenuItem {
  _id: string;
  itemname: string;
  price: number;
  category?: string;
  isVisible?: boolean;
  isSpecial?: boolean;
  isNew?: boolean;
  isPopular?: boolean;
  discountPercentage?: number;
}

export default function UserMenuPage() {
  const router = useRouter();
  const params = useParams();
  const hotelId = params.id as string; // Access id from useParams
  console.log('UserMenuPage hotelId:', hotelId);

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [feedbackComment, setFeedbackComment] = useState('');

  useEffect(() => {
    const fetchMenuItems = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/user/menu/${hotelId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch menu items');
        }
        const data = await response.json();
        setMenuItems(Array.isArray(data.menuItems) ? data.menuItems : []);
        const initialQuantities: { [key: string]: number } = {};
        data.menuItems.forEach((item: MenuItem) => {
          initialQuantities[item._id] = 1;
        });
        setQuantities(initialQuantities);
      } catch (err: any) {
        setError(err.message);
        toast.error(`Error fetching menu: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (hotelId) { // Ensure hotelId is available before fetching
      fetchMenuItems();
    }
  }, [hotelId]);

  const handleQuantityChange = (itemId: string, value: string) => {
    const newQuantity = parseInt(value);
    setQuantities((prevQuantities) => ({
      ...prevQuantities,
      [itemId]: newQuantity > 0 ? newQuantity : 1,
    }));
  };

  const handleAddToCart = async (item: MenuItem) => {
    const quantity = quantities[item._id] || 1;
    setLoading(true);
    try {
      const response = await fetch(`/api/user/${hotelId}/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ itemname: item.itemname, price: item.price, quantity }),
      });

      if (response.ok) {
        toast.success(`${quantity} x ${item.itemname} added to cart!`);
      } else {
        const errorData = await response.json();
        toast.error(`Error adding to cart: ${errorData.message}`);
      }
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hotelId,
          rating: feedbackRating,
          comment: feedbackComment,
        }),
      });

      if (response.ok) {
        toast.success('Feedback submitted successfully!');
        setIsFeedbackModalOpen(false);
        setFeedbackRating(5);
        setFeedbackComment('');
      } else {
        const errorData = await response.json();
        toast.error(`Error submitting feedback: ${errorData.message}`);
      }
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const filteredMenuItems = menuItems.filter((item) => {
    const matchesSearch = item.itemname.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return item.isVisible && matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(menuItems.map((item) => item.category).filter(Boolean))) as string[];

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading menu...</div>;
  }

  if (error) {
    return <div className="flex min-h-screen items-center justify-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">Menu</h1>
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
        <Button onClick={() => router.push(`/user/cart/${hotelId}`)}>View Cart</Button>
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
        <Dialog open={isFeedbackModalOpen} onOpenChange={setIsFeedbackModalOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">Give Feedback</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Give Feedback</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="rating" className="text-right">Rating</Label>
                <RadioGroup
                  defaultValue="5"
                  onValueChange={(value) => setFeedbackRating(parseInt(value))}
                  className="flex col-span-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="r1" />
                    <Label htmlFor="r1">1</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="2" id="r2" />
                    <Label htmlFor="r2">2</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="3" id="r3" />
                    <Label htmlFor="r3">3</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="4" id="r4" />
                    <Label htmlFor="r4">4</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="5" id="r5" />
                    <Label htmlFor="r5">5</Label>
                  </div>
                </RadioGroup>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="comment" className="text-right">Comment</Label>
                <Textarea
                  id="comment"
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  className="col-span-3"
                  placeholder="Optional comments..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFeedbackModalOpen(false)}>Cancel</Button>
              <Button type="submit" onClick={handleFeedbackSubmit}>Submit Feedback</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
                <TableHead>Quantity</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMenuItems.map((item) => {
                console.log('Rendering item:', item.itemname, item._id);
                return (
                  <TableRow key={item._id}>
                  <TableCell>
                    {item.itemname}
                    {item.isSpecial && <span className="ml-2 text-xs font-semibold text-red-500">Special</span>}
                    {item.isNew && <span className="ml-2 text-xs font-semibold text-blue-500">New</span>}
                    {item.isPopular && <span className="ml-2 text-xs font-semibold text-green-500">Popular</span>}
                    {item.discountPercentage && item.discountPercentage > 0 && (
                      <span className="ml-2 text-xs font-semibold text-purple-500">-{item.discountPercentage}%</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {item.discountPercentage && item.discountPercentage > 0 ? (
                      <>
                        <span className="line-through text-gray-500">${item.price.toFixed(2)}</span>
                        <span className="ml-2 font-bold">${(item.price * (1 - item.discountPercentage / 100)).toFixed(2)}</span>
                      </>
                    ) : (
                      `$${item.price.toFixed(2)}`
                    )}
                  </TableCell>
                  <TableCell>{item.category || 'N/A'}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="1"
                      value={quantities[item._id] || 1}
                      onChange={(e) => handleQuantityChange(item._id, e.target.value)}
                      className="w-20"
                    />
                  </TableCell>
                  <TableCell>
                    <Button onClick={() => handleAddToCart(item)} size="sm">Add to Cart</Button>
                  </TableCell>
                </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}