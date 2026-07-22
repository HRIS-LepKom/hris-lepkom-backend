import mongoose from 'mongoose';
import dns      from 'node:dns';

const isLoopback = (s) => s.startsWith('127.') || s === '::1';
const dnsServers = dns.getServers();
if (dnsServers.length === 0 || dnsServers.every(isLoopback)) {
  dns.setServers(['1.1.1.1', '8.8.8.8']);
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(process.env.URI, opts).then((m) => m);
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }

  return cached.conn;
};

export default connectDB;

