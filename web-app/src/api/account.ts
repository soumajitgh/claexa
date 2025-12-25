import { ENDPOINTS } from "./core/endpoints";
import { apiClient } from "./core/client";
import { ApiResponse } from "./core/types";

// ============================================================================
// Types
// ============================================================================

/**
 * Organization membership information for a user
 */
export interface OrganizationMembership {
    id: string;
    name: string;
    role: 'admin' | 'member';
}

/**
 * User profile information
 */
export interface UserProfile {
    fullName: string;
    avatarUrl?: string;
}

/**
 * Complete user response from API
 */
export interface UserResponse {
    id: string;
    createdAt?: string;
    updatedAt?: string;
    email: string;
    isVerified?: boolean;
    phoneNumber?: string | null;
    accountType?: 'user' | 'admin' | 'god';
    organizations: OrganizationMembership[];
    activeOrganization?: OrganizationMembership;
    credit?: number;
    credits?: number;
    profile: UserProfile;
}

/**
 * Account usage information
 */
export interface AccountUsage {
    credit: {
        maximum: number;
        amount: number;
        refreshedAt: string;
    };
}

/**
 * Credit transaction item
 */
export interface CreditTransactionItem {
    id: string;
    type: "DEBIT" | "CREDIT";
    amount: number;
    message: string | null;
    transactionDate: string; // ISO date string
}

/**
 * Credit transactions pagination metadata
 */
export interface CreditTransactionsPaginationMeta {
    total: number;
    offset: number;
    limit: number;
    nextPage: number | null;
}

/**
 * Credit transactions API response
 */
export interface CreditTransactionsApiResponse {
    success: boolean;
    data: CreditTransactionItem[];
    meta: {
        pagination: CreditTransactionsPaginationMeta;
    };
    message?: string;
}

/**
 * Credit usage graph data point
 */
export interface CreditUsageDataPoint {
    date: string;
    amount: number;
}

/**
 * Credit usage graph response
 */
export interface CreditUsageGraphResponse {
    data: CreditUsageDataPoint[];
}

/**
 * Organization invite information
 */
export interface UserOrganizationInvite {
    id: string;
    role: "admin" | "member";
    organization: {
        id: string;
        name: string;
    };
}

/**
 * Invite action request
 */
export interface InviteActionRequest {
    action: "accept" | "reject";
}

// ============================================================================
// Service
// ============================================================================

export const accountService = {
    /**
     * Get current user profile
     */
    async getMe(): Promise<ApiResponse<UserResponse>> {
        const response = await apiClient.get<ApiResponse<UserResponse>>(
            ENDPOINTS.account.profile,
        );
        return response as unknown as ApiResponse<UserResponse>;
    },

    /**
     * Get account information (alias for getMe)
     */
    async getAccount(): Promise<ApiResponse<UserResponse>> {
        return this.getMe();
    },

    /**
     * Update user profile
     */
    async updateProfile(data: {
        fullName: string;
    }): Promise<ApiResponse<UserResponse>> {
        const response = await apiClient.patch<ApiResponse<UserResponse>>(
            ENDPOINTS.account.profile,
            data,
        );
        return response as unknown as ApiResponse<UserResponse>;
    },

    /**
     * Get account usage statistics
     */
    async getUsage(): Promise<ApiResponse<AccountUsage>> {
        const response = await apiClient.get<ApiResponse<AccountUsage>>(
            ENDPOINTS.account.usage,
        );
        return response as unknown as ApiResponse<AccountUsage>;
    },

    /**
     * Get credit usage graph data
     */
    async getCreditUsageGraph(
        days = 7,
    ): Promise<ApiResponse<CreditUsageGraphResponse["data"]>> {
        const response = await apiClient.get<
            ApiResponse<CreditUsageGraphResponse["data"]>
        >(ENDPOINTS.account.creditUsageGraph(days));
        return response as unknown as ApiResponse<CreditUsageGraphResponse["data"]>;
    },

    /**
     * Get credit transactions with pagination
     */
    async getCreditTransactions({
        pageParam = 0,
        limit = 10,
    }: {
        pageParam?: number;
        limit?: number;
    } = {}): Promise<CreditTransactionsApiResponse> {
        const params = new URLSearchParams({
            offset: pageParam.toString(),
            limit: limit.toString(),
        });
        const response = await apiClient.get<CreditTransactionsApiResponse>(
            `${ENDPOINTS.account.creditTransactions}?${params.toString()}`,
        );
        return response as unknown as CreditTransactionsApiResponse;
    },

    /**
     * Get organization invites for current user
     */
    async getInvites(): Promise<ApiResponse<UserOrganizationInvite[]>> {
        const response = await apiClient.get<ApiResponse<UserOrganizationInvite[]>>(
            ENDPOINTS.account.invites,
        );
        return response as unknown as ApiResponse<UserOrganizationInvite[]>;
    },

    /**
     * Handle invite action (accept/reject)
     */
    async handleInviteAction(
        inviteId: string,
        action: InviteActionRequest,
    ): Promise<ApiResponse<{ message: string }>> {
        const response = await apiClient.post<ApiResponse<{ message: string }>>(
            ENDPOINTS.account.inviteAction(inviteId),
            action,
        );
        return response as unknown as ApiResponse<{ message: string }>;
    },
};
