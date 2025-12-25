export const ENDPOINTS = {
    questionPapers: {
        base: '/question-papers',
        create: '/question-papers',
        all: '/question-papers',
        byId: (id: string) => `/question-papers/${id}`,
        generate: '/question-paper/generate',
        generateWithAI: '/question-papers/generate-with-ai',
        exportDocx: (id: string) => `/question-papers/${id}/export/docx`,
        exportPdf: (id: string) => `/question-papers/${id}/export/pdf`,
        exportGoogleForm: (id: string) => `/question-paper/${id}/export/google-form`,
    },
    media: {
        uploadUrl: '/media/upload-url',
        completeUpload: (id: string) => `/media/${id}/complete-upload`,
        downloadUrl: (id: string) => `/media/${id}/download-url`,
    },
    account: {
        profile: '/account',
        usage: '/account/usage',
        creditUsageGraph: (days: number) => `/account/usage/credit/graph/${days}`,
        creditTransactions: '/account/usage/credit/transactions',
        invites: '/invites',
        inviteAction: (inviteId: string) => `/invites/${inviteId}/action`,
    },
    payment: {
        createOrder: '/payment/order',
        getCreditMultiplier: '/payment/credit-multiplier',
        history: '/payment/history',
        getOrderById: (orderId: string) => `/payment/order/${orderId}`,
    },
    organization: {
        create: '/organization',
        getAll: '/organization',
        getById: (id: string) => `/organization/${id}`,
        update: (id: string) => `/organization/${id}`,
        delete: (id: string) => `/organization/${id}`,
        profile: '/organization',
        members: {
            all: '/organization/member/all',
            byOrgId: (orgId: string) => `/organization/${orgId}/members`,
            add: '/organization/invite',
            update: (memberId: string) => `/organization/member/${memberId}`,
            updateStatus: (memberId: string) => `/organization/member/${memberId}`,
            remove: (memberId: string) => `/organization/member/${memberId}`,
        },
        invites: {
            all: '/organization/invite',
            byOrgId: (orgId: string) => `/organization/${orgId}/invites`,
            createByOrgId: (orgId: string) => `/organization/${orgId}/invites`,
            remove: (inviteId: string) => `/organization/invite/${inviteId}`,
            removeByOrgId: (orgId: string, inviteId: string) => `/organization/${orgId}/invites/${inviteId}`,
        },
    },
    questionSolver: {
        solve: '/question-solver/solve',
    },
    datamuse: {
        words: '/datamuse/words',
    },
} as const;

export type EndpointValue = string | ((...args: any[]) => string);

