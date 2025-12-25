import { ENDPOINTS } from "./core/endpoints";
import { apiClient } from "./core/client";
import { ApiResponse } from "./core/types";

// ============================================================================
// Types
// ============================================================================

/**
 * Organization profile information
 */
export interface OrganizationProfile {
    orgId: string;
    name: string;
    status: "active" | "inactive" | "suspended";
    userRole?: "admin" | "member";
}

/**
 * Organization member information
 */
export interface OrganizationMember {
    id: string;
    email: string;
    fullName: string;
    role: "admin" | "member";
    status?: "active" | "inactive" | string;
    avatarUrl?: string;
    joinedAt: string;
}

/**
 * Organization members response
 */
export interface OrganizationMembersResponse {
    members: OrganizationMember[];
    totalCount: number;
}

/**
 * Organization invite information
 */
export interface OrgInvite {
    id: string;
    email: string;
    role: "admin" | "member";
    status: "pending" | "accepted" | "rejected";
    organizationId: string;
    organizationName: string;
    invitedAt?: string;
}

/**
 * New API response format type
 */
export interface NewMemberFormat {
    memberId: string;
    createdAt: string;
    updatedAt: string;
    role: string;
    isActive: boolean;
    user: {
        id: string;
        email: string;
    };
}

// ============================================================================
// Utilities
// ============================================================================

/**
 * Utility function to transform new member format to the standard format
 */
const transformMemberData = (
    data: NewMemberFormat[] | OrganizationMembersResponse,
): {
    members: OrganizationMember[];
    totalCount: number;
    activeCount: number;
} => {
    if (Array.isArray(data)) {
        // New format
        const transformedMembers = data.map((member: NewMemberFormat) => ({
            id: member.memberId,
            email: member.user?.email || "",
            fullName: member.user?.email?.split("@")[0] || "", // Use email prefix as fullName if not available
            role: member.role as "admin" | "member",
            status: member.isActive ? "active" : "inactive",
            joinedAt: member.createdAt,
        }));

        return {
            members: transformedMembers,
            totalCount: transformedMembers.length,
            activeCount: data.filter((member: NewMemberFormat) => member.isActive)
                .length,
        };
    }

    // Original format
    return {
        members: data.members || [],
        totalCount: data.totalCount || (data.members ? data.members.length : 0),
        activeCount: data.members
            ? data.members.filter(
                (m: OrganizationMember) =>
                    m.status === "active" || m.status === undefined,
            ).length
            : 0,
    };
};

// ============================================================================
// Service
// ============================================================================

export const organizationService = {
    /**
     * Get organization profile
     */
    async getOrganizationProfile(): Promise<ApiResponse<OrganizationProfile>> {
        const response = await apiClient.get<ApiResponse<OrganizationProfile>>(
            ENDPOINTS.organization.profile,
        );
        return response as unknown as ApiResponse<OrganizationProfile>;
    },

    /**
     * Get all organization members
     */
    async getAllMembers(): Promise<
        ApiResponse<OrganizationMembersResponse | NewMemberFormat[]>
    > {
        const response = await apiClient.get<
            ApiResponse<OrganizationMembersResponse | NewMemberFormat[]>
        >(ENDPOINTS.organization.members.all);
        return response as unknown as ApiResponse<
            OrganizationMembersResponse | NewMemberFormat[]
        >;
    },

    /**
     * Add member to organization
     */
    async addMember(
        email: string,
        role: string,
    ): Promise<ApiResponse<OrganizationMember>> {
        const response = await apiClient.post<ApiResponse<OrganizationMember>>(
            ENDPOINTS.organization.members.add,
            {
                email,
                role,
            },
        );
        return response as unknown as ApiResponse<OrganizationMember>;
    },

    /**
     * Update member role
     */
    async updateMemberRole(
        memberId: string,
        role: string,
    ): Promise<ApiResponse<OrganizationMember>> {
        const response = await apiClient.patch<ApiResponse<OrganizationMember>>(
            ENDPOINTS.organization.members.update(memberId),
            {
                role,
            },
        );
        return response as unknown as ApiResponse<OrganizationMember>;
    },

    /**
     * Update member status
     */
    async updateMemberStatus(
        memberId: string,
        status: "active" | "inactive",
    ): Promise<ApiResponse<OrganizationMember>> {
        const response = await apiClient.patch<ApiResponse<OrganizationMember>>(
            ENDPOINTS.organization.members.updateStatus(memberId),
            { status: status === "active" ? "active" : "inactive" },
            { headers: { "Content-Type": "application/json" } },
        );
        return response as unknown as ApiResponse<OrganizationMember>;
    },

    /**
     * Remove member from organization
     */
    async removeMember(memberId: string): Promise<ApiResponse<void>> {
        const response = await apiClient.delete<ApiResponse<void>>(
            ENDPOINTS.organization.members.remove(memberId),
        );
        return response as unknown as ApiResponse<void>;
    },

    /**
     * Get all organization invites
     */
    async getAllInvites(): Promise<ApiResponse<OrgInvite[]>> {
        const response = await apiClient.get<ApiResponse<OrgInvite[]>>(
            ENDPOINTS.organization.invites.all,
        );
        return response as unknown as ApiResponse<OrgInvite[]>;
    },

    /**
     * Remove organization invite
     */
    async removeInvite(inviteId: string): Promise<ApiResponse<void>> {
        const response = await apiClient.delete<ApiResponse<void>>(
            ENDPOINTS.organization.invites.remove(inviteId),
        );
        return response as unknown as ApiResponse<void>;
    },

    /**
     * Get members by organization ID
     */
    async getMembersByOrganizationId(
        orgId: string,
    ): Promise<ApiResponse<OrganizationMember[]>> {
        const response = await apiClient.get<ApiResponse<OrganizationMember[]>>(
            ENDPOINTS.organization.members.byOrgId(orgId),
        );
        return response as unknown as ApiResponse<OrganizationMember[]>;
    },

    async getInvitesByOrganizationId(
        orgId: string,
    ): Promise<ApiResponse<OrgInvite[]>> {
        const response = await apiClient.get<ApiResponse<OrgInvite[]>>(
            ENDPOINTS.organization.invites.byOrgId(orgId),
        );
        return response as unknown as ApiResponse<OrgInvite[]>;
    },

    /**
     * Create invite by organization ID
     */
    async createInviteByOrganizationId(
        orgId: string,
        email: string,
        role: "admin" | "member",
    ): Promise<ApiResponse<OrgInvite>> {
        const response = await apiClient.post<ApiResponse<OrgInvite>>(
            ENDPOINTS.organization.invites.createByOrgId(orgId),
            { email, role },
        );
        return response as unknown as ApiResponse<OrgInvite>;
    },

    /**
     * Delete invite by organization ID
     */
    async deleteInviteByOrganizationId(
        orgId: string,
        inviteId: string,
    ): Promise<ApiResponse<void>> {
        const response = await apiClient.delete<ApiResponse<void>>(
            ENDPOINTS.organization.invites.removeByOrgId(orgId, inviteId),
        );
        return response as unknown as ApiResponse<void>;
    },

    // Utility function exposed as part of the service
    transformMemberData,
};
