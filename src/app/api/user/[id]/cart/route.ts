import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import MenuUser from '@/models/MenuUser';
import Order from '@/models/Order';
import jwt from 'jsonwebtoken';
import { parse } from 'cookie';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  await dbConnect();

  try {
    const cookies = parse(request.headers.get('cookie') || '');
    const token = cookies.jwtuserToken;

    if (!token) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, process.env.TOKEN_KEY as string);

    const user = await MenuUser.findById(decoded.user_id);

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ cart: user.cart }, { status: 200 });
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  await dbConnect();

  try {
    const cookies = parse(request.headers.get('cookie') || '');
    const token = cookies.jwtuserToken;

    if (!token) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, process.env.TOKEN_KEY as string);

    const { itemname, price, quantity } = await request.json();

    const user = await MenuUser.findById(decoded.user_id);

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const newOrderItem = new Order({
      itemname,
      price,
      quantity: quantity || 1, // Default to 1 if quantity is not provided
    });

    user.cart.push(newOrderItem);
    await user.save();

    return NextResponse.json({ message: 'Item added to cart successfully', cart: user.cart }, { status: 200 });
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  await dbConnect();

  try {
    const cookies = parse(request.headers.get('cookie') || '');
    const token = cookies.jwtuserToken;

    if (!token) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, process.env.TOKEN_KEY as string);

    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('id');

    const user = await MenuUser.findOne({ phone: decoded.phone });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    user.cart = user.cart.filter((item: any) => item._id.toString() !== itemId);
    await user.save();

    return NextResponse.json({ message: 'Item removed from cart successfully', cart: user.cart }, { status: 200 });
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}
