import { User } from './user';

export interface Review {
  id: string;
  patient?: User;
  patientName?: string;
  patientEmail?: string;
  optometrist?: User;
  optometristName?: string;
  rating: number;
  comment?: string;
  status?: 'pending' | 'approved' | 'rejected';
  serviceType?: 'consultation' | 'homecare' | 'product';
  createdAt?: string;
  created_at?: Date;
  reportCount?: number;
  isReported?: boolean;
}

export interface ReviewStats {
  totalReviews: number;
  pendingReviews: number;
  approvedReviews: number;
  rejectedReviews: number;
  averageRating: number;
  reportedReviews: number;
}

export interface ReviewFilter {
  status?: string;
  serviceType?: string;
  rating?: string;
  search?: string;
}