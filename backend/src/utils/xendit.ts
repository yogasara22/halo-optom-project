import crypto from 'crypto';
import { xenditConfig } from '../config/xendit';

/**
 * Verifikasi signature Xendit webhook
 * @param rawBody Raw body dari webhook request
 * @param signature X-CALLBACK-TOKEN header dari Xendit
 * @returns boolean
 */
export function verifyXenditSignature(
  rawBody: string,
  signature: string
): boolean {
  const { webhookToken } = xenditConfig;
  
  if (!webhookToken) {
    console.warn('XENDIT_WEBHOOK_TOKEN tidak diatur');
    return false;
  }

  const expectedSignature = crypto
    .createHmac('sha256', webhookToken)
    .update(rawBody)
    .digest('hex');

  return expectedSignature === signature;
}

/**
 * Generate external ID untuk Xendit
 * @param type Type pembayaran ('appointment' | 'order')
 * @param id ID dari appointment atau order
 * @returns string
 */
export function generateXenditExternalId(
  type: 'appointment' | 'order',
  id: string
): string {
  const timestamp = Date.now();
  return `${type}-${id}-${timestamp}`;
}

/**
 * Parse external ID dari Xendit untuk mendapatkan original ID
 * @param externalId External ID dari Xendit
 * @returns object dengan type dan id
 */
export function parseXenditExternalId(externalId: string): {
  type: 'appointment' | 'order' | null;
  id: string | null;
} {
  const parts = externalId.split('-');
  
  if (parts.length < 3) {
    return { type: null, id: null };
  }

  const type = parts[0] as 'appointment' | 'order';
  const id = parts[1];

  if (!['appointment', 'order'].includes(type)) {
    return { type: null, id: null };
  }

  return { type, id };
}

/**
 * Map status Xendit ke status internal aplikasi
 * @param xenditStatus Status dari Xendit
 * @returns status internal
 */
export function mapXenditStatusToInternal(
  xenditStatus: string
): 'paid' | 'unpaid' {
  switch (xenditStatus.toLowerCase()) {
    case 'paid':
    case 'settled':
      return 'paid';
    case 'expired':
    case 'failed':
    case 'cancelled':
    default:
      return 'unpaid';
  }
}