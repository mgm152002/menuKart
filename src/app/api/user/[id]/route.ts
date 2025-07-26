import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import MenuUser from '@/models/MenuUser';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  await dbConnect();

  try {
    const body = await request.json();
    const { phone, tableno } = body;
    const hotelId = params.id; // This is the hotel ID from the URL

    let user = await MenuUser.findOne({ phone });

    if (!user) {
      // Create new user if not found
      user = new MenuUser({
        phone,
        tableno,
      });
      await user.save();
    } else {
      // Update existing user's table number
      user.tableno = tableno;
      await user.save();
    }

    const token = jwt.sign(
      { user_id: user._id, phone: user.phone },
      process.env.TOKEN_KEY as string,
      { expiresIn: '1h' }
    );

    const setCookie = serialize('jwtuserToken', token, {
      httpOnly: true,
      maxAge: 60 * 60, // 1 hour
      path: '/',
    });

    return new NextResponse(JSON.stringify({ message: 'User processed successfully', user }), {
      status: 200,
      headers: { 'Set-Cookie': setCookie },
    });
  } catch (error: any) {
    console.error('API Error (user/[id]):', error);
    if (error.name === 'ValidationError') {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}
