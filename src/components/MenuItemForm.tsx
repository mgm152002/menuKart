'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';

interface MenuItemFormProps {
  initialData?: {
    _id?: string;
    itemname: string;
    price: number;
    category?: string;
    isVisible?: boolean;
    availableFrom?: string;
    availableTo?: string;
    daysOfWeek?: string[];
    isSpecial?: boolean;
    isNew?: boolean;
    isPopular?: boolean;
    discountPercentage?: number;
    upsellItems?: string[]; // Array of MenuItem IDs
  };
  onSubmit: (data: {
    itemname: string;
    price: number;
    category?: string;
    isVisible?: boolean;
    availableFrom?: string;
    availableTo?: string;
    daysOfWeek?: string[];
    isSpecial?: boolean;
    isNew?: boolean;
    isPopular?: boolean;
    discountPercentage?: number;
    upsellItems?: string[];
  }) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function MenuItemForm({
  initialData,
  onSubmit,
  onCancel,
  isEditing = false,
}: MenuItemFormProps) {
  const [itemname, setItemname] = useState(initialData?.itemname || '');
  const [price, setPrice] = useState<number>(initialData?.price || 0);
  const [category, setCategory] = useState(initialData?.category || '');
  const [isVisible, setIsVisible] = useState(initialData?.isVisible !== undefined ? initialData.isVisible : true);
  const [availableFrom, setAvailableFrom] = useState(initialData?.availableFrom || '');
  const [availableTo, setAvailableTo] = useState(initialData?.availableTo || '');
  const [selectedDays, setSelectedDays] = useState<string[]>(initialData?.daysOfWeek || []);
  const [isSpecial, setIsSpecial] = useState(initialData?.isSpecial || false);
  const [isNew, setIsNew] = useState(initialData?.isNew || false);
  const [isPopular, setIsPopular] = useState(initialData?.isPopular || false);
  const [discountPercentage, setDiscountPercentage] = useState<number>(initialData?.discountPercentage || 0);
  const [selectedUpsellItems, setSelectedUpsellItems] = useState<string[]>(initialData?.upsellItems || []);
  const [allMenuItems, setAllMenuItems] = useState<any[]>([]); // To fetch all menu items for upsell selection
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setItemname(initialData.itemname);
      setPrice(initialData.price);
      setCategory(initialData.category || '');
      setIsVisible(initialData.isVisible !== undefined ? initialData.isVisible : true);
      setAvailableFrom(initialData.availableFrom || '');
      setAvailableTo(initialData.availableTo || '');
      setSelectedDays(initialData.daysOfWeek || []);
      setIsSpecial(initialData.isSpecial || false);
      setIsNew(initialData.isNew || false);
      setIsPopular(initialData.isPopular || false);
      setDiscountPercentage(initialData.discountPercentage || 0);
      setSelectedUpsellItems(initialData.upsellItems || []);
    }
  }, [initialData]);

  useEffect(() => {
    const fetchAllMenuItems = async () => {
      try {
        const response = await fetch('/api/admin/menu'); // Fetch all menu items
        if (response.ok) {
          const data = await response.json();
          // Filter out the current item if in edit mode
          const filtered = data.menuItems.filter((item: any) => item._id !== initialData?._id);
          setAllMenuItems(filtered);
        }
      } catch (error) {
        console.error('Failed to fetch all menu items for upsell:', error);
      }
    };
    fetchAllMenuItems();
  }, [initialData]);

  const handleDayChange = (day: string, checked: boolean) => {
    setSelectedDays((prev) =>
      checked ? [...prev, day] : prev.filter((d) => d !== day)
    );
  };

  const handleUpsellItemChange = (itemId: string, checked: boolean) => {
    setSelectedUpsellItems((prev) =>
      checked ? [...prev, itemId] : prev.filter((id) => id !== itemId)
    );
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    await onSubmit({
      itemname,
      price,
      category,
      isVisible,
      availableFrom: availableFrom || undefined,
      availableTo: availableTo || undefined,
      daysOfWeek: selectedDays.length > 0 ? selectedDays : undefined,
      isSpecial,
      isNew,
      isPopular,
      discountPercentage,
      upsellItems: selectedUpsellItems.length > 0 ? selectedUpsellItems : undefined,
    });
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="itemname" className="text-right">
          Item Name
        </Label>
        <Input
          id="itemname"
          value={itemname}
          onChange={(e) => setItemname(e.target.value)}
          className="col-span-3"
          required
          disabled={loading}
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="price" className="text-right">
          Price
        </Label>
        <Input
          id="price"
          type="number"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(parseFloat(e.target.value))}
          className="col-span-3"
          required
          disabled={loading}
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="category" className="text-right">
          Category
        </Label>
        <Input
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="col-span-3"
          disabled={loading}
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="isVisible" className="text-right">
          Visible
        </Label>
        <Checkbox
          id="isVisible"
          checked={isVisible}
          onCheckedChange={(checked: boolean) => setIsVisible(checked)}
          className="col-span-3"
          disabled={loading}
        />
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="availableFrom" className="text-right">
          Available From
        </Label>
        <Input
          id="availableFrom"
          type="time"
          value={availableFrom}
          onChange={(e) => setAvailableFrom(e.target.value)}
          className="col-span-3"
          disabled={loading}
        />
      </div>
      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="availableTo" className="text-right">
          Available To
        </Label>
        <Input
          id="availableTo"
          type="time"
          value={availableTo}
          onChange={(e) => setAvailableTo(e.target.value)}
          className="col-span-3"
          disabled={loading}
        />
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">Days of Week</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="col-span-3 justify-start font-normal">
              {selectedDays.length > 0 ? selectedDays.join(', ') : 'Select Days'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <div className="grid gap-2 p-4">
              {days.map((day) => (
                <div key={day} className="flex items-center space-x-2">
                  <Checkbox
                    id={day}
                    checked={selectedDays.includes(day)}
                    onCheckedChange={(checked: boolean) => handleDayChange(day, checked)}
                    disabled={loading}
                  />
                  <Label htmlFor={day}>{day}</Label>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label htmlFor="discountPercentage" className="text-right">
          Discount (%)
        </Label>
        <Input
          id="discountPercentage"
          type="number"
          min="0"
          max="100"
          value={discountPercentage}
          onChange={(e) => setDiscountPercentage(parseFloat(e.target.value))}
          className="col-span-3"
          disabled={loading}
        />
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">Highlights</Label>
        <div className="col-span-3 flex flex-wrap gap-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isSpecial"
              checked={isSpecial}
              onCheckedChange={(checked: boolean) => setIsSpecial(checked)}
              disabled={loading}
            />
            <Label htmlFor="isSpecial">Special</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isNew"
              checked={isNew}
              onCheckedChange={(checked: boolean) => setIsNew(checked)}
              disabled={loading}
            />
            <Label htmlFor="isNew">New</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isPopular"
              checked={isPopular}
              onCheckedChange={(checked: boolean) => setIsPopular(checked)}
              disabled={loading}
            />
            <Label htmlFor="isPopular">Popular</Label>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">Upsell Items</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="col-span-3 justify-start font-normal">
              {selectedUpsellItems.length > 0
                ? `${selectedUpsellItems.length} selected`
                : 'Select Upsell Items'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Command>
              <CommandInput placeholder="Search items..." />
              <CommandList>
                <CommandEmpty>No items found.</CommandEmpty>
                <CommandGroup>
                  {allMenuItems.map((item) => (
                    <CommandItem key={item._id} onSelect={() => handleUpsellItemChange(item._id, !selectedUpsellItems.includes(item._id))}>
                      <Checkbox
                        checked={selectedUpsellItems.includes(item._id)}
                        onCheckedChange={(checked: boolean) => handleUpsellItemChange(item._id, checked)}
                        className="mr-2"
                      />
                      {item.itemname}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (isEditing ? 'Saving...' : 'Adding...') : (isEditing ? 'Save Changes' : 'Add Item')}
        </Button>
      </div>
    </form>
  );
}
