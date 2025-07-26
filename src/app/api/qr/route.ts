import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { parse } from 'cookie';
import qrcode from 'qrcode';

export async function GET(request: Request) {
  try {
    const cookies = parse(request.headers.get('cookie') || '');
    const token = cookies.jwtToken;

    if (!token) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, process.env.TOKEN_KEY as string);

    const protocol = request.headers.get('x-forwarded-proto') || (process.env.NODE_ENV === 'production' ? 'https' : 'http');
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
    const userMenuUrl = `${protocol}://${host}/user/${decoded.user_id}`;

    const qrDataUrl = await qrcode.toDataURL(userMenuUrl);

    return NextResponse.json({ qrCode: qrDataUrl, userMenuUrl }, { status: 200 });
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}