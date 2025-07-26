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
    console.log('API Menu Items:', hotelAdmin.hotelMenu.map((item: any) => item.itemname));

    if (!hotelAdmin) {
      return NextResponse.json({ message: 'Hotel admin not found' }, { status: 404 });
    }

    return NextResponse.json({ menuItems: hotelAdmin.hotelMenu }, { status: 200 });
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}
