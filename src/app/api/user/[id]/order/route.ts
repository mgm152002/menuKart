import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import MenuUser from '@/models/MenuUser';
import HotelAdmin from '@/models/HotelAdmin';
import jwt from 'jsonwebtoken';
import { parse } from 'cookie';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  await dbConnect();

  try {
    const cookies = parse(request.headers.get('cookie') || '');
    const token = cookies.jwtuserToken;

    if (!token) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, process.env.TOKEN_KEY as string);

    const hotelId = params.id; // This is the hotel ID

    const user = await MenuUser.findOne({ phone: decoded.phone });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    if (user.cart.length === 0) {
      return NextResponse.json({ message: 'Cart is empty' }, { status: 400 });
    }

    const hotelAdmin = await HotelAdmin.findById(hotelId);

    if (!hotelAdmin) {
      return NextResponse.json({ message: 'Hotel not found' }, { status: 404 });
    }

    const newOrder = {
      order: user.cart,
      status: 'false',
      paymentstatus: 'pending', // Assuming a default payment status
      customer: decoded.phone,
    };

    hotelAdmin.currentOrders.push(newOrder);
    await hotelAdmin.save();

    // Clear the user's cart after placing the order
    user.cart = [];
    await user.save();

    return NextResponse.json({ message: 'Order placed successfully' }, { status: 200 });
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}
