const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// Helper function to get auth token
const getAuthToken = (): string | null => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('admin_token');
    }
    return null;
};

// Helper function to create headers
const createHeaders = (): HeadersInit => {
    const token = getAuthToken();
    return {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
    };
};

// Helper function to handle API responses
const handleResponse = async <T>(response: Response): Promise<T> => {
    if (!response.ok) {
        if (response.status === 401) {
            // Clear invalid token
            if (typeof window !== 'undefined') {
                localStorage.removeItem('admin_token');
            }
            throw new Error('Missing or invalid token format');
        }
        const errorData = await response.json().catch(() => ({ message: 'Network error' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
};

export type WithdrawStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID';

export interface WithdrawRequest {
    id: string;
    optometrist: {
        id: string;
        name: string;
        email: string;
        phone?: string;
        str_number?: string;
        avatar_url?: string;
    };
    amount: number;
    bank_name: string;
    bank_account_number: string;
    bank_account_name: string;
    status: WithdrawStatus;
    requested_at: string;
    reviewed_by_admin_id?: string;
    reviewed_by_admin?: {
        id: string;
        name: string;
        email: string;
    };
    reviewed_at?: string;
    note?: string;
    updated_at: string;
}

export interface GetWithdrawRequestsParams {
    status?: WithdrawStatus;
}

class WithdrawService {
    // Get all withdrawal requests (admin)
    async getWithdrawRequests(params: GetWithdrawRequestsParams = {}): Promise<{ data: WithdrawRequest[] }> {
        const queryParams = new URLSearchParams();
        if (params.status) queryParams.append('status', params.status);

        const url = `${API_BASE_URL}/withdraw-requests${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

        const response = await fetch(url, {
            method: 'GET',
            headers: createHeaders(),
        });

        return handleResponse<{ data: WithdrawRequest[] }>(response);
    }

    // Get withdrawal request by ID
    async getWithdrawRequestById(id: string): Promise<WithdrawRequest> {
        const response = await fetch(`${API_BASE_URL}/withdraw-requests/${id}`, {
            method: 'GET',
            headers: createHeaders(),
        });

        return handleResponse<WithdrawRequest>(response);
    }

    // Approve withdrawal request
    async approveWithdrawRequest(id: string): Promise<{ message: string; data: WithdrawRequest }> {
        const response = await fetch(`${API_BASE_URL}/withdraw-requests/${id}/approve`, {
            method: 'PATCH',
            headers: createHeaders(),
        });

        return handleResponse<{ message: string; data: WithdrawRequest }>(response);
    }

    // Reject withdrawal request
    async rejectWithdrawRequest(id: string, reason: string): Promise<{ message: string; data: WithdrawRequest }> {
        const response = await fetch(`${API_BASE_URL}/withdraw-requests/${id}/reject`, {
            method: 'PATCH',
            headers: createHeaders(),
            body: JSON.stringify({ reason }),
        });

        return handleResponse<{ message: string; data: WithdrawRequest }>(response);
    }

    // Mark withdrawal as paid
    async markAsPaid(id: string): Promise<{ message: string; data: WithdrawRequest }> {
        const response = await fetch(`${API_BASE_URL}/withdraw-requests/${id}/mark-paid`, {
            method: 'PATCH',
            headers: createHeaders(),
        });

        return handleResponse<{ message: string; data: WithdrawRequest }>(response);
    }
}

export const withdrawService = new WithdrawService();
export default withdrawService;
