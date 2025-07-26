import mongoose from 'mongoose';

// Import all models to ensure they are registered
import '@/models/Menu';
import '@/models/Order';
import '@/models/HotelAdmin';
import '@/models/MenuUser';
import '@/models/QrScan';
import '@/models/Feedback';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/menukart';

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

let cached = global as typeof global & {
  mongoose: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
};

if (!cached.mongoose) {
  cached.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.mongoose.conn) {
    return cached.mongoose.conn;
  }

  if (!cached.mongoose.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.mongoose.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }
  cached.mongoose.conn = await cached.mongoose.promise;
  return cached.mongoose.conn;
}

export default dbConnect;