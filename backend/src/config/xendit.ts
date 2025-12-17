import dotenv from 'dotenv';
import { Xendit } from 'xendit-node';

dotenv.config();

const {
  XENDIT_SECRET_KEY,
  XENDIT_PUBLIC_KEY,
  XENDIT_WEBHOOK_TOKEN,
  XENDIT_IS_PRODUCTION,
} = process.env;

if (!XENDIT_SECRET_KEY) {
  throw new Error('XENDIT_SECRET_KEY wajib diatur di .env');
}

const isProduction = XENDIT_IS_PRODUCTION === 'true';

// Initialize Xendit client
export const xenditClient = new Xendit({
  secretKey: XENDIT_SECRET_KEY,
});

export const xenditConfig = {
  secretKey: XENDIT_SECRET_KEY,
  publicKey: XENDIT_PUBLIC_KEY,
  webhookToken: XENDIT_WEBHOOK_TOKEN,
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