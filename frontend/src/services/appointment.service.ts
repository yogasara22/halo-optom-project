import api from '@/lib/api';

export const updateAppointmentCommission = async (id: string, commission_percentage: number) => {
  const response = await api.patch(`/appointments/${id}/commission`, { commission_percentage });
  return response.data;
};

