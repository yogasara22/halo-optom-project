import dotenv from 'dotenv';
import { Xendit } from 'xendit-node';

dotenv.config();

const {
  XENDIT_API_KEY,
  XENDIT_PUBLIC_KEY,
  XENDIT_CALLBACK_URL,
  XENDIT_WEBHOOK_VERIFICATION_TOKEN,
  XENDIT_IS_PRODUCTION,
} = process.env;

if (!XENDIT_API_KEY) {
  throw new Error('XENDIT_API_KEY wajib diatur di .env');
}

const isProduction = XENDIT_IS_PRODUCTION === 'true';

// Initialize Xendit client
export const xenditClient = new Xendit({
  secretKey: XENDIT_API_KEY,
});

export const xenditConfig = {
  secretKey: XENDIT_API_KEY,
  publicKey: XENDIT_PUBLIC_KEY,
  callbackUrl: XENDIT_CALLBACK_URL,
  webhookVerificationToken: XENDIT_WEBHOOK_VERIFICATION_TOKEN, // Token dari Xendit Dashboard untuk verifikasi webhook
  isProduction,
};

// Xendit Invoice API
export const { Invoice } = xenditClient;

// Xendit Payment Method API
export const { PaymentMethod } = xenditClient;

// Xendit Payment Request API
export const { PaymentRequest } = xenditClient;

export default {
  xenditClient,
  xenditConfig,
  Invoice,
  PaymentMethod,
  PaymentRequest,
};