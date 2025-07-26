import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import HotelAdmin from '@/models/HotelAdmin';
import Menu from '@/models/Menu';
import jwt from 'jsonwebtoken';
import { parse } from 'cookie';

export async function POST(request: Request) {
  await dbConnect();

  try {
    const cookies = parse(request.headers.get('cookie') || '');
    const token = cookies.jwtToken;

    if (!token) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, process.env.TOKEN_KEY as string);

    const { itemname, price, category, isVisible, availableFrom, availableTo, daysOfWeek, isSpecial, isNew, isPopular, discountPercentage, upsellItems } = await request.json();

    const hotelAdmin = await HotelAdmin.findById(decoded.user_id);

    if (!hotelAdmin) {
      return NextResponse.json({ message: 'Hotel admin not found' }, { status: 404 });
    }

    const newMenuItem = new Menu({
      itemname,
      price,
      category,
      isVisible: isVisible !== undefined ? isVisible : true, // Default to true if not provided
      availableFrom,
      availableTo,
      daysOfWeek,
      isSpecial: isSpecial !== undefined ? isSpecial : false,
      isNew: isNew !== undefined ? isNew : false,
      isPopular: isPopular !== undefined ? isPopular : false,
      discountPercentage: discountPercentage !== undefined ? discountPercentage : 0,
      upsellItems: upsellItems || [],
    });

    await newMenuItem.save();

    hotelAdmin.hotelMenu.push(newMenuItem._id);
    await hotelAdmin.save();

    return NextResponse.json({ message: 'Menu item added successfully', menuItem: newMenuItem }, { status: 201 });
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
    console.error('Error adding menu item:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}
