// src/services/videosdk.service.ts
import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import fetch from 'node-fetch';
import { 
  VIDEOSDK_API_KEY, 
  VIDEOSDK_SECRET_KEY, 
  VIDEOSDK_BASE_URL 
} from '../config/videosdk';

/**
 * Generate generic VideoSDK token
 */
export function generateVideoSdkToken(options?: {
  roomId?: string;
  participantId?: string;
  permissions?: ('allow_join' | 'ask_join' | 'allow_mod')[];
  roles?: ('rtc' | 'crawler')[];
  expiresIn?: SignOptions['expiresIn'];
}): string {
  const payload: Record<string, any> = {
    apikey: VIDEOSDK_API_KEY,
    permissions: options?.permissions ?? ['allow_join'],
  };

  if (options?.roomId) payload.roomId = options.roomId;
  if (options?.participantId) payload.participantId = options.participantId;
  if (options?.roles) payload.roles = options.roles;

  const signOptions: SignOptions = {
    algorithm: 'HS256',
    expiresIn: options?.expiresIn ?? '2h',
    jwtid: uuidv4(),
  };

  return jwt.sign(payload, VIDEOSDK_SECRET_KEY as Secret, signOptions);
}

/**
 * Generate token khusus join room
 */
export function generateJoinRoomToken(roomId: string, participantId?: string): string {
  return generateVideoSdkToken({
    roomId,
    participantId,
    permissions: ['allow_join'],
    roles: ['rtc'],
    expiresIn: '2h',
  });
}

/**
 * Create room menggunakan API VideoSDK
 */
export async function createVideoSdkRoom(): Promise<any> {
  const token = generateVideoSdkToken({ permissions: ['allow_join', 'allow_mod'] });

  const res = await fetch(`${VIDEOSDK_BASE_URL}/rooms`, {
    method: 'POST',
    headers: {
      Authorization: token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      region: 'sg001', // server Singapore, bisa diganti
      autoCloseConfig: { emptyRoomTimeout: 5 * 60 * 1000 }, // auto close setelah 5 menit kosong
    }),
  });

  if (!res.ok) {
    throw new Error(`Gagal membuat room: ${res.status} ${res.statusText}`);
  }

  return await res.json();
}
