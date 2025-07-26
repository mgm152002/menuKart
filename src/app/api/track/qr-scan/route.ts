import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import QrScan from '@/models/QrScan';

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { hotelId } = await request.json();
    const userAgent = request.headers.get('user-agent');
    const ipAddress = request.headers.get('x-forwarded-for') || request.ip; // Get IP from header or request object

    // Basic device type detection (can be expanded)
    let deviceType = 'Unknown';
    if (userAgent) {
      if (/Mobi|Android/i.test(userAgent)) {
        deviceType = 'Mobile';
      } else if (/Tablet|iPad/i.test(userAgent)) {
        deviceType = 'Tablet';
      } else {
        deviceType = 'Desktop';
      }
    }

    const newScan = new QrScan({
      hotelId,
      deviceType,
      ipAddress,
    });

    await newScan.save();

    return NextResponse.json({ message: 'QR scan tracked successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error tracking QR scan:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}
