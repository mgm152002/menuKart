import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import HotelAdmin from '@/models/HotelAdmin';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

export async function POST(request: Request) {
  await dbConnect();

  try {
    const body = await request.json();
    const { phone, password } = body;

    const found = await HotelAdmin.findOne({ phone });

    if (!found) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const isPasswordCorrect = bcrypt.compareSync(password, found.password);

    if (!isPasswordCorrect) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const token = jwt.sign(
      { user_id: found._id, phone: found.phone },
      process.env.TOKEN_KEY as string,
      { expiresIn: '1h' }
    );

    const setCookie = serialize('jwtToken', token, {
      httpOnly: true,
      maxAge: 60 * 60, // 1 hour
      path: '/',
    });

    return new NextResponse(JSON.stringify({ message: 'Logged in successfully' }), {
      status: 200,
      headers: { 'Set-Cookie': setCookie },
    });
  } catch (error: any) {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
