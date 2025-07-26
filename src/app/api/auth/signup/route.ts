import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import HotelAdmin from '@/models/HotelAdmin';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

const saltRounds = 10;

export async function POST(request: Request) {
  await dbConnect();

  try {
    const body = await request.json();
    const { phone, password } = body;

    const found = await HotelAdmin.findOne({ phone });

    if (found) {
      return NextResponse.json({ message: 'User already exists' }, { status: 409 });
    }

    const hashedPassword = bcrypt.hashSync(password, saltRounds);

    const user = new HotelAdmin({
      phone,
      password: hashedPassword,
    });

    await user.save();

    const token = jwt.sign(
      { user_id: user._id, phone: user.phone },
      process.env.TOKEN_KEY as string,
      { expiresIn: '1h' }
    );

    const setCookie = serialize('jwtToken', token, {
      httpOnly: true,
      maxAge: 60 * 60, // 1 hour
      path: '/',
    });

    return new NextResponse(JSON.stringify({ message: 'User created successfully' }), {
      status: 201,
      headers: { 'Set-Cookie': setCookie },
    });
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
