import { Router, Request, Response } from 'express';
import { handleXenditOrderWebhook } from '../services/payment-order.service';

const router = Router();

/**
 * Webhook Xendit untuk Order Produk
 */
router.post('/xendit-webhook', async (req: Request, res: Response) => {
  try {
    // Mendapatkan raw body untuk verifikasi signature
    const rawBody = JSON.stringify(req.body);
    
    // Mendapatkan signature dari header
    const signature = req.headers['x-callback-token'] as string;
    
    if (!signature) {
      return res.status(400).json({ message: 'Missing X-CALLBACK-TOKEN header' });
    }

    const result = await handleXenditOrderWebhook(req.body, rawBody, signature);
    return res.json(result);
  } catch (error: any) {
    console.error('Error handling Xendit order webhook:', error);
    return res.status(500).json({ message: error.message || 'Internal server error' });
  }
});

export default router;
