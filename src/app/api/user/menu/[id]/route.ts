import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import HotelAdmin from '@/models/HotelAdmin';
import Menu from '@/models/Menu'; // Import Menu model to access its schema

export async function GET(request: Request, { params }: { params: { id: string } }) {
  await dbConnect();

  try {
    const hotelId = params.id;
    const hotelAdmin = await HotelAdmin.findById(hotelId).populate('hotelMenu');

    if (!hotelAdmin) {
      return NextResponse.json({ message: 'Hotel not found' }, { status: 404 });
    }

    const now = new Date();
    const currentDay = now.toLocaleString('en-US', { weekday: 'long' });
    const currentTime = now.toTimeString().slice(0, 5); // "HH:MM"

    const filteredMenu = hotelAdmin.hotelMenu.filter((item: any) => {
      // Check isVisible
      if (!item.isVisible) {
        return false;
      }

      // Check availableFrom and availableTo
      if (item.availableFrom && item.availableTo) {
        if (currentTime < item.availableFrom || currentTime > item.availableTo) {
          return false;
        }
      }

      // Check daysOfWeek
      if (item.daysOfWeek && item.daysOfWeek.length > 0) {
        if (!item.daysOfWeek.includes(currentDay)) {
          return false;
        }
      }

      return true;
    });

    return NextResponse.json({ menuItems: filteredMenu }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching user menu:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}