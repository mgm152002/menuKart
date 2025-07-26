import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import HotelAdmin from '@/models/HotelAdmin';
import Menu from '@/models/Menu';
import jwt from 'jsonwebtoken';
import { parse } from 'cookie';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  await dbConnect();

  try {
    const cookies = parse(request.headers.get('cookie') || '');
    const token = cookies.jwtToken;

    if (!token) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, process.env.TOKEN_KEY as string);

    const { itemname, price, category, isVisible, availableFrom, availableTo, daysOfWeek, isSpecial, isNew, isPopular, discountPercentage, upsellItems } = await request.json();
    const { id } = params;

    const hotelAdmin = await HotelAdmin.findById(decoded.user_id);

    if (!hotelAdmin) {
      return NextResponse.json({ message: 'Hotel admin not found' }, { status: 404 });
    }

    const menuIndex = hotelAdmin.hotelMenu.findIndex((menuId: any) => menuId.toString() === id);

    if (menuIndex === -1) {
      return NextResponse.json({ message: "Menu item not found in admin's menu" }, { status: 404 });
    }

    const updatedMenuItem = await Menu.findByIdAndUpdate(
      id,
      { itemname, price, category, isVisible, availableFrom, availableTo, daysOfWeek, isSpecial, isNew, isPopular, discountPercentage, upsellItems },
      { new: true, runValidators: true }
    );

    if (!updatedMenuItem) {
      return NextResponse.json({ message: 'Menu item not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Menu item updated successfully', menuItem: updatedMenuItem }, { status: 200 });
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
    console.error('Error updating menu item:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  await dbConnect();

  try {
    const cookies = parse(request.headers.get('cookie') || '');
    const token = cookies.jwtToken;

    if (!token) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, process.env.TOKEN_KEY as string);

    const { id } = params;

    const hotelAdmin = await HotelAdmin.findById(decoded.user_id);

    if (!hotelAdmin) {
      return NextResponse.json({ message: 'Hotel admin not found' }, { status: 404 });
    }

    // Remove the menu item reference from the hotelAdmin's menu array
    hotelAdmin.hotelMenu = hotelAdmin.hotelMenu.filter((menuId: any) => menuId.toString() !== id);
    await hotelAdmin.save();

    // Delete the menu item from the Menu collection
    const deletedMenuItem = await Menu.findByIdAndDelete(id);

    if (!deletedMenuItem) {
      return NextResponse.json({ message: 'Menu item not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Menu item deleted successfully' }, { status: 200 });
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
    console.error('Error deleting menu item:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}
