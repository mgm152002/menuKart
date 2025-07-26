import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import HotelAdmin from '@/models/HotelAdmin';
import jwt from 'jsonwebtoken';
import { parse } from 'cookie';

export async function GET(request: Request) {
  await dbConnect();

  try {
    const cookies = parse(request.headers.get('cookie') || '');
    const token = cookies.jwtToken;

    if (!token) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, process.env.TOKEN_KEY as string);

    const hotelAdmin = await HotelAdmin.findById(decoded.user_id);

    if (!hotelAdmin) {
      return NextResponse.json({ message: 'Hotel admin not found' }, { status: 404 });
    }

    const popularItems: { [key: string]: { itemname: string; count: number } } = {};

    hotelAdmin.completedOrders.forEach((order: any) => {
      order.order.forEach((item: any) => {
        if (popularItems[item.itemname]) {
          popularItems[item.itemname].count += item.quantity;
        } else {
          popularItems[item.itemname] = { itemname: item.itemname, count: item.quantity };
        }
      });
    });

    const sortedPopularItems = Object.values(popularItems).sort((a, b) => b.count - a.count);

    return NextResponse.json({ popularItems: sortedPopularItems }, { status: 200 });
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
    console.error('Popular Items API Error:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}
