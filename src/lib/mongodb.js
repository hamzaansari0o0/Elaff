import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI is not set in .env.local');
}

// Reuse the connection across hot-reloads in dev instead of opening a new one per request.
let cached = global._mongoose;

if (!cached) {
  cached = global._mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    // If this attempt fails (e.g. a transient DNS blip), drop the cached
    // promise so the next call retries fresh instead of replaying the same
    // rejection forever for the life of the process.
    cached.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false }).catch((err) => {
      cached.promise = null;
      throw err;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
