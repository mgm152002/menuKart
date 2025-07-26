'use client';

import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';

interface CartItem {
  _id: string;
  itemname: string;
  price: number;
  quantity: number;
}

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
  upsellItems?: string[];
}

export default function UserCartPage() {
  const router = useRouter();
  const params = useParams();
  const hotelId = params.id as string; // Access id from useParams

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [upsellSuggestions, setUpsellSuggestions] = useState<MenuItem[]>([]);
  const [upsellQuantities, setUpsellQuantities] = useState<{ [key: string]: number }>({});

  const fetchCartItems = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/user/${hotelId}/cart`); // Assuming a GET route for cart
      if (!response.ok) {
        throw new Error('Failed to fetch cart items');
      }
      const data = await response.json();
      setCartItems(Array.isArray(data.cart) ? data.cart : []);

      // Fetch upsell suggestions based on items in cart
      if (data.cart.length > 0) {
        const itemIdsInCart = data.cart.map((item: CartItem) => item._id);
        const upsellResponse = await fetch(`/api/user/menu/${hotelId}`); // Fetch all menu items for upsell suggestions
        if (upsellResponse.ok) {
          const allMenuItems = await upsellResponse.json();
          const suggestions: MenuItem[] = [];
          allMenuItems.menuItems.forEach((menuItem: MenuItem) => {
            if (menuItem.upsellItems && menuItem.upsellItems.length > 0) {
              menuItem.upsellItems.forEach((upsellItemId: string) => {
                // Check if the upsell item is not already in the cart
                if (!itemIdsInCart.includes(upsellItemId)) {
                  const suggestedItem = allMenuItems.menuItems.find((item: MenuItem) => item._id === upsellItemId);
                  if (suggestedItem && suggestedItem.isVisible) {
                    suggestions.push(suggestedItem);
                  }
                }
              });
            }
          });
          // Remove duplicates
          const uniqueSuggestions = Array.from(new Map(suggestions.map(item => [item._id, item])).values());
          setUpsellSuggestions(uniqueSuggestions);

          // Initialize upsell quantities
          const initialUpsellQuantities: { [key: string]: number } = {};
          uniqueSuggestions.forEach((item: MenuItem) => {
            initialUpsellQuantities[item._id] = 1;
          });
          setUpsellQuantities(initialUpsellQuantities);
        }
      }

    } catch (err: any) {
      setError(err.message);
      toast.error(`Error fetching cart: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hotelId) { // Ensure hotelId is available before fetching
      fetchCartItems();
    }
  }, [hotelId]);

  const handleDeleteItem = async (itemId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/user/${hotelId}/cart?id=${itemId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Item removed from cart!');
        fetchCartItems(); // Refresh cart after deletion
      } else {
        const errorData = await response.json();
        toast.error(`Error removing item: ${errorData.message}`);
      }
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/user/${hotelId}/order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast.success('Order placed successfully!');
        router.push(`/user/menu/${hotelId}`); // Redirect to menu after order
      } else {
        const errorData = await response.json();
        toast.error(`Error placing order: ${errorData.message}`);
      }
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpsellQuantityChange = (itemId: string, value: string) => {
    const newQuantity = parseInt(value);
    setUpsellQuantities((prevQuantities) => ({
      ...prevQuantities,
      [itemId]: newQuantity > 0 ? newQuantity : 1,
    }));
  };

  const handleAddUpsellItem = async (item: MenuItem) => {
    const quantity = upsellQuantities[item._id] || 1;
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
        fetchCartItems(); // Refresh cart after adding upsell item
      } else {
        const errorData = await response.json();
        toast.error(`Error adding upsell item: ${errorData.message}`);
      }
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading cart...</div>;
  }

  if (error) {
    return <div className="flex min-h-screen items-center justify-center text-red-500">Error: {error}</div>;
  }

  const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-4 text-2xl font-bold">Your Cart</h1>
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cartItems.map((item) => (
                <TableRow key={item._id}>
                  <TableCell>{item.itemname}</TableCell>
                  <TableCell>${item.price.toFixed(2)}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>${(item.price * item.quantity).toFixed(2)}</TableCell>
                  <TableCell>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteItem(item._id)}>Remove</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4 text-right text-xl font-bold">
            Total: ${totalAmount.toFixed(2)}
          </div>
          <div className="mt-6 flex justify-end">
            <Button onClick={handlePlaceOrder}>Place Order</Button>
          </div>
        </>
      )}

      {upsellSuggestions.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-4 text-xl font-bold">You might also like:</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {upsellSuggestions.map((item) => (
              <div key={item._id} className="border p-4 rounded-lg shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold">{item.itemname}</h3>
                  <p className="text-gray-600">${item.price.toFixed(2)}</p>
                  {item.isSpecial && <span className="ml-2 text-xs font-semibold text-red-500">Special</span>}
                  {item.isNew && <span className="ml-2 text-xs font-semibold text-blue-500">New</span>}
                  {item.isPopular && <span className="ml-2 text-xs font-semibold text-green-500">Popular</span>}
                  {item.discountPercentage && item.discountPercentage > 0 && (
                    <span className="ml-2 text-xs font-semibold text-purple-500">-{item.discountPercentage}%</span>
                  )}
                </div>
                <div className="flex items-center mt-4">
                  <Input
                    type="number"
                    min="1"
                    value={upsellQuantities[item._id] || 1}
                    onChange={(e) => handleUpsellQuantityChange(item._id, e.target.value)}
                    className="w-20 mr-2"
                  />
                  <Button onClick={() => handleAddUpsellItem(item)} size="sm">Add to Cart</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4">
        <Button variant="outline" onClick={() => router.push(`/user/menu/${hotelId}`)}>Back to Menu</Button>
      </div>
    </div>
  );
}