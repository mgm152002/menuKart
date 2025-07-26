import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Feedback from '@/models/Feedback';
import jwt from 'jsonwebtoken';
import { parse } from 'cookie';

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { hotelId, itemId, rating, comment } = await request.json();

    let userId = null;
    const cookies = parse(request.headers.get('cookie') || '');
    const token = cookies.jwtuserToken; // Assuming user token for user-specific feedback

    if (token) {
      try {
        const decoded: any = jwt.verify(token, process.env.TOKEN_KEY as string);
        userId = decoded.user_id;
      } catch (error) {
        console.warn('Invalid user token for feedback, proceeding anonymously.', error);
      }
    }

    const newFeedback = new Feedback({
      hotelId,
      userId,
      itemId,
      rating,
      comment,
    });

    await newFeedback.save();

    return NextResponse.json({ message: 'Feedback submitted successfully' }, { status: 201 });
  } catch (error: any) {
    console.error('Error submitting feedback:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(request.url);
    const hotelId = searchParams.get('hotelId');

    if (!hotelId) {
      return NextResponse.json({ message: 'hotelId is required' }, { status: 400 });
    }

    const feedback = await Feedback.find({ hotelId }).populate('userId').populate('itemId');

    return NextResponse.json({ feedback }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}
