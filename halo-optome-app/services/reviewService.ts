import api from '../lib/api';

export interface Review {
    id: string;
    rating: number;
    comment: string;
    created_at: string;
    user?: {
        name: string;
        avatar_url?: string;
    };
}

class ReviewService {
    async createReview(data: { optometrist_id: string; rating: number; comment: string }) {
        try {
            const response = await api.post('/reviews', data);
            return response.data.data;
        } catch (error) {
            console.error('Create review error:', error);
            throw error;
        }
    }

    async getReviewsForOptometrist(optometristId: string): Promise<Review[]> {
        try {
            const response = await api.get(`/reviews/optometrist/${optometristId}`);
            return response.data.data;
        } catch (error) {
            console.error('Get reviews error:', error);
            return [];
        }
    }

    async getMyReviews(): Promise<Review[]> {
        try {
            const response = await api.get('/reviews/me');
            return response.data.data;
        } catch (error) {
            console.error('Get my reviews error:', error);
            return [];
        }
    }
}

export const reviewService = new ReviewService();
export default reviewService;
