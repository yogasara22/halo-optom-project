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
  const { webhookVerificationToken, isProduction } = xenditConfig;

  // Jika di development dan token tidak diset, skip verification
  if (!isProduction && !webhookVerificationToken) {
    console.warn('⚠️ Webhook verification disabled in development mode');
    return true;
  }

  if (!webhookVerificationToken) {
    console.error('❌ XENDIT_WEBHOOK_VERIFICATION_TOKEN tidak diatur');
    return false;
  }

  const expectedSignature = crypto
    .createHmac('sha256', webhookVerificationToken)
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
 * @param externalId External ID dari Xendit (format: appointment-{uuid} atau order-{uuid})
 * @returns object dengan type dan id
 */
export function parseXenditExternalId(externalId: string): {
  type: 'appointment' | 'order' | null;
  id: string | null;
} {
  // Format: appointment-{uuid} atau order-{uuid}
  // UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
  const match = externalId.match(/^(appointment|order)-(.+)$/);

  if (!match) {
    return { type: null, id: null };
  }

  const type = match[1] as 'appointment' | 'order';
  const id = match[2];

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