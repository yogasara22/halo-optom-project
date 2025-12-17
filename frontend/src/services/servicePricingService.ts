'use client';

import api from '@/lib/api';
import { ServicePricing } from '@/types';

export interface CreateServicePricingPayload {
  type: 'online' | 'homecare';
  method: 'chat' | 'video';
  base_price: number;
  is_active?: boolean;
}

export interface UpdateServicePricingPayload {
  base_price?: number;
  is_active?: boolean;
}

class ServicePricingService {
  async listPricing(): Promise<ServicePricing[]> {
    const res = await api.get('/services/pricing');
    return res.data.data as ServicePricing[];
  }

  async lookup(type: 'online' | 'homecare', method: 'chat' | 'video'): Promise<ServicePricing | null> {
    try {
      const res = await api.get('/services/pricing/lookup', {
        params: { type, method },
      });
      return res.data.data as ServicePricing;
    } catch (e: any) {
      return null;
    }
  }

  async createPricing(payload: CreateServicePricingPayload): Promise<ServicePricing> {
    const res = await api.post('/services/pricing', payload);
    return res.data.data as ServicePricing;
  }

  async updatePricing(id: string, payload: UpdateServicePricingPayload): Promise<ServicePricing> {
    const res = await api.put(`/services/pricing/${id}`, payload);
    return res.data.data as ServicePricing;
  }

  async deletePricing(id: string): Promise<void> {
    await api.delete(`/services/pricing/${id}`);
  }
}

const servicePricingService = new ServicePricingService();
export default servicePricingService;
