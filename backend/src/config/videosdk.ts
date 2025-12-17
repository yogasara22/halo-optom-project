// src/config/videosdk.ts
import { config } from 'dotenv';

config(); // load dari .env

export const VIDEOSDK_API_KEY = process.env.VIDEOSDK_API_KEY as string;
export const VIDEOSDK_SECRET_KEY = process.env.VIDEOSDK_SECRET_KEY as string;
export const VIDEOSDK_BASE_URL = 'https://api.videosdk.live/v2';

if (!VIDEOSDK_API_KEY || !VIDEOSDK_SECRET_KEY) {
  throw new Error('VIDEOSDK_API_KEY dan VIDEOSDK_SECRET_KEY harus diset di .env');
}
