import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import HotelAdmin from '@/models/HotelAdmin';
import Menu from '@/models/Menu';
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

    const hotelAdmin = await HotelAdmin.findById(decoded.user_id).populate('hotelMenu');

    if (!hotelAdmin) {
      return NextResponse.json({ message: 'Hotel admin not found' }, { status: 404 });
    }

    // KPI 1: Total Menu Items for this admin
    const totalMenuItems = hotelAdmin.hotelMenu.length;

    // KPI 2: Total Current Orders for this admin
    const totalCurrentOrders = hotelAdmin.currentOrders.length;

    // KPI 3: Total Completed Orders for this admin
    const totalCompletedOrders = hotelAdmin.completedOrders.length;

    // KPI 4: Total Revenue from Completed Orders
    let totalRevenue = 0;
    hotelAdmin.completedOrders.forEach((order: any) => {
      order.order.forEach((item: any) => {
        totalRevenue += item.price * item.quantity;
      });
    });

    return NextResponse.json({
      totalMenuItems,
      totalCurrentOrders,
      totalCompletedOrders,
      totalRevenue,
    }, { status: 200 });
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
    console.error('Dashboard API Error:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}
