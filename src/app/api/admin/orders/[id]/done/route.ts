import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import HotelAdmin from '@/models/HotelAdmin';
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

    const hotelAdmin = await HotelAdmin.findById(decoded.user_id);

    if (!hotelAdmin) {
      return NextResponse.json({ message: 'Hotel admin not found' }, { status: 404 });
    }

    const orderIdToMarkDone = params.id;

    const orderIndex = hotelAdmin.currentOrders.findIndex(
      (order: any) => order._id.toString() === orderIdToMarkDone
    );

    if (orderIndex === -1) {
      return NextResponse.json({ message: 'Order not found in current orders' }, { status: 404 });
    }

    const [orderToMove] = hotelAdmin.currentOrders.splice(orderIndex, 1);
    orderToMove.status = 'true';
    hotelAdmin.completedOrders.push(orderToMove);

    await hotelAdmin.save();

    return NextResponse.json({ message: 'Order marked as done and moved to completed orders' }, { status: 200 });
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}
