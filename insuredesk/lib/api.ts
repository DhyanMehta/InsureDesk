/**
 * InsureDesk - API Service Layer
 * Supabase data access functions for all modules
 */

import { createClient } from '@/utils/supabase/client'
import type {
    Profile,
    Client,
    Policy,
    Document,
    Reminder,
    DashboardKPIs,
    ClientFilters,
    PolicyFilters,
    ReminderFilters,
    ClientFormData,
    PolicyFormData,
    ReminderFormData,
    ApiResponse,
    PaginatedResponse
} from '@/types/database'

const supabase = createClient()

// ============================================
// Profile / Agent APIs
// ============================================

export const profileApi = {
    /**
     * Get current user's profile
     */
    async getCurrent(): Promise<ApiResponse<Profile>> {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .single()

        return { data, error: error?.message || null }
    },

    /**
     * Update current user's profile
     */
    async update(updates: Partial<Profile>): Promise<ApiResponse<Profile>> {
        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', (await supabase.auth.getUser()).data.user?.id)
            .select()
            .single()

        return { data, error: error?.message || null }
    }
}

// ============================================
// Client APIs
// ============================================

export const clientApi = {
    /**
     * Get all clients for current agent
     */
    async getAll(filters?: ClientFilters): Promise<ApiResponse<Client[]>> {
        let query = supabase
            .from('clients')
            .select('*')
            .order('created_at', { ascending: false })

        // Apply filters
        if (filters?.search) {
            query = query.or(`full_name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%,email.ilike.%${filters.search}%`)
        }
        if (filters?.created_after) {
            query = query.gte('created_at', filters.created_after)
        }
        if (filters?.created_before) {
            query = query.lte('created_at', filters.created_before)
        }

        const { data, error, count } = await query

        return { data: data || [], error: error?.message || null, count: count || 0 }
    },

    /**
     * Get single client by ID
     */
    async getById(id: string): Promise<ApiResponse<Client>> {
        const { data, error } = await supabase
            .from('clients')
            .select('*')
            .eq('id', id)
            .single()

        return { data, error: error?.message || null }
    },

    /**
     * Get client with their policies
     */
    async getWithPolicies(id: string): Promise<ApiResponse<Client & { policies: Policy[] }>> {
        const { data, error } = await supabase
            .from('clients')
            .select('*, policies(*)')
            .eq('id', id)
            .single()

        return { data, error: error?.message || null }
    },

    /**
     * Create new client
     */
    async create(clientData: ClientFormData): Promise<ApiResponse<Client>> {
        const user = await supabase.auth.getUser()

        const { data, error } = await supabase
            .from('clients')
            .insert({
                ...clientData,
                agent_id: user.data.user?.id
            })
            .select()
            .single()

        return { data, error: error?.message || null }
    },

    /**
     * Update client
     */
    async update(id: string, updates: Partial<ClientFormData>): Promise<ApiResponse<Client>> {
        const { data, error } = await supabase
            .from('clients')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        return { data, error: error?.message || null }
    },

    /**
     * Delete client (will cascade delete policies)
     */
    async delete(id: string): Promise<ApiResponse<null>> {
        const { error } = await supabase
            .from('clients')
            .delete()
            .eq('id', id)

        return { data: null, error: error?.message || null }
    },

    /**
     * Get client count
     */
    async getCount(): Promise<number> {
        const { count } = await supabase
            .from('clients')
            .select('*', { count: 'exact', head: true })

        return count || 0
    }
}

// ============================================
// Policy APIs
// ============================================

export const policyApi = {
    /**
     * Get all policies for current agent
     */
    async getAll(filters?: PolicyFilters): Promise<ApiResponse<Policy[]>> {
        let query = supabase
            .from('policies')
            .select('*')
            .order('created_at', { ascending: false })

        // Apply filters
        if (filters?.search) {
            query = query.or(`policy_number.ilike.%${filters.search}%,provider.ilike.%${filters.search}%`)
        }
        if (filters?.client_id) {
            query = query.eq('client_id', filters.client_id)
        }
        if (filters?.status) {
            query = query.eq('status', filters.status)
        }
        if (filters?.provider) {
            query = query.eq('provider', filters.provider)
        }
        if (filters?.start_date_from) {
            query = query.gte('start_date', filters.start_date_from)
        }
        if (filters?.start_date_to) {
            query = query.lte('start_date', filters.start_date_to)
        }
        if (filters?.end_date_from) {
            query = query.gte('end_date', filters.end_date_from)
        }
        if (filters?.end_date_to) {
            query = query.lte('end_date', filters.end_date_to)
        }
        if (filters?.expiring_within_days) {
            const futureDate = new Date()
            futureDate.setDate(futureDate.getDate() + filters.expiring_within_days)
            query = query
                .eq('status', 'active')
                .gte('end_date', new Date().toISOString())
                .lte('end_date', futureDate.toISOString())
        }

        const { data, error, count } = await query

        return { data: data || [], error: error?.message || null, count: count || 0 }
    },

    /**
     * Get policies by client ID
     */
    async getByClientId(clientId: string): Promise<ApiResponse<Policy[]>> {
        const { data, error } = await supabase
            .from('policies')
            .select('*')
            .eq('client_id', clientId)
            .order('created_at', { ascending: false })

        return { data: data || [], error: error?.message || null }
    },

    /**
     * Get single policy by ID
     */
    async getById(id: string): Promise<ApiResponse<Policy>> {
        const { data, error } = await supabase
            .from('policies')
            .select('*')
            .eq('id', id)
            .single()

        return { data, error: error?.message || null }
    },

    /**
     * Get policy with client and documents
     */
    async getWithDetails(id: string): Promise<ApiResponse<Policy & { client: Client, documents: Document[] }>> {
        const { data, error } = await supabase
            .from('policies')
            .select('*, client:clients(*), documents:documents(*)')
            .eq('id', id)
            .single()

        return { data, error: error?.message || null }
    },

    /**
     * Create new policy
     */
    async create(policyData: PolicyFormData): Promise<ApiResponse<Policy>> {
        const user = await supabase.auth.getUser()

        const { data, error } = await supabase
            .from('policies')
            .insert({
                ...policyData,
                agent_id: user.data.user?.id
            })
            .select()
            .single()

        return { data, error: error?.message || null }
    },

    /**
     * Update policy
     */
    async update(id: string, updates: Partial<PolicyFormData>): Promise<ApiResponse<Policy>> {
        const { data, error } = await supabase
            .from('policies')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        return { data, error: error?.message || null }
    },

    /**
     * Delete policy
     */
    async delete(id: string): Promise<ApiResponse<null>> {
        const { error } = await supabase
            .from('policies')
            .delete()
            .eq('id', id)

        return { data: null, error: error?.message || null }
    },

    /**
     * Get expiring policies (within specified days)
     */
    async getExpiring(days: number = 30): Promise<ApiResponse<Policy[]>> {
        const futureDate = new Date()
        futureDate.setDate(futureDate.getDate() + days)

        const { data, error } = await supabase
            .from('policies')
            .select('*, client:clients(*)')
            .eq('status', 'active')
            .gte('end_date', new Date().toISOString().split('T')[0])
            .lte('end_date', futureDate.toISOString().split('T')[0])
            .order('end_date', { ascending: true })

        return { data: data || [], error: error?.message || null }
    }
}

// ============================================
// Document APIs
// ============================================

export const documentApi = {
    /**
     * Get all documents for a policy
     */
    async getByPolicyId(policyId: string): Promise<ApiResponse<Document[]>> {
        const { data, error } = await supabase
            .from('documents')
            .select('*')
            .eq('policy_id', policyId)
            .order('uploaded_at', { ascending: false })

        return { data: data || [], error: error?.message || null }
    },

    /**
     * Upload document to storage and create record
     */
    async upload(
        file: File,
        policyId: string,
        clientId: string
    ): Promise<ApiResponse<Document>> {
        try {
            const user = await supabase.auth.getUser()

            if (!user.data.user) {
                return { data: null, error: 'User not authenticated' }
            }

            // Create storage path: agent_id/client_id/policy_id/filename
            const fileName = `${Date.now()}_${file.name}`
            const filePath = `${user.data.user.id}/${clientId}/${policyId}/${fileName}`

            // Upload to storage
            const { error: uploadError } = await supabase.storage
                .from('policy-documents')
                .upload(filePath, file)

            if (uploadError) {
                return { data: null, error: uploadError.message }
            }

            // Get public URL
            const { data: urlData } = supabase.storage
                .from('policy-documents')
                .getPublicUrl(filePath)

            // Create document record
            const { data, error } = await supabase
                .from('documents')
                .insert({
                    agent_id: user.data.user.id,
                    client_id: clientId,
                    policy_id: policyId,
                    file_name: file.name,
                    file_url: urlData.publicUrl,
                    file_size: file.size
                })
                .select()
                .single()

            return { data, error: error?.message || null }
        } catch (err) {
            return { data: null, error: (err as Error).message }
        }
    },

    /**
     * Delete document
     */
    async delete(id: string): Promise<ApiResponse<null>> {
        // Get document to find file URL
        const { data: doc } = await supabase
            .from('documents')
            .select('file_url')
            .eq('id', id)
            .single()

        // Delete record
        const { error } = await supabase
            .from('documents')
            .delete()
            .eq('id', id)

        return { data: null, error: error?.message || null }
    },

    /**
     * Get document download URL
     */
    async getDownloadUrl(fileUrl: string): Promise<string> {
        return fileUrl
    }
}

// ============================================
// Reminder APIs
// ============================================

export const reminderApi = {
    /**
     * Get all reminders for current agent
     */
    async getAll(filters?: ReminderFilters): Promise<ApiResponse<Reminder[]>> {
        let query = supabase
            .from('reminders')
            .select('*, policy:policies(*), client:clients(*)')
            .order('remind_on', { ascending: true })

        // Apply filters
        if (filters?.status) {
            query = query.eq('status', filters.status)
        }
        if (filters?.reminder_type) {
            query = query.eq('reminder_type', filters.reminder_type)
        }
        if (filters?.date_from) {
            query = query.gte('remind_on', filters.date_from)
        }
        if (filters?.date_to) {
            query = query.lte('remind_on', filters.date_to)
        }
        if (filters?.policy_id) {
            query = query.eq('policy_id', filters.policy_id)
        }
        if (filters?.client_id) {
            query = query.eq('client_id', filters.client_id)
        }

        const { data, error } = await query

        return { data: data || [], error: error?.message || null }
    },

    /**
     * Get pending reminders
     */
    async getPending(): Promise<ApiResponse<Reminder[]>> {
        const { data, error } = await supabase
            .from('reminders')
            .select('*, policy:policies(*), client:clients(*)')
            .eq('status', 'pending')
            .lte('remind_on', new Date().toISOString().split('T')[0])
            .order('remind_on', { ascending: true })

        return { data: data || [], error: error?.message || null }
    },

    /**
     * Create reminder
     */
    async create(reminderData: ReminderFormData): Promise<ApiResponse<Reminder>> {
        const user = await supabase.auth.getUser()

        const { data, error } = await supabase
            .from('reminders')
            .insert({
                ...reminderData,
                agent_id: user.data.user?.id
            })
            .select()
            .single()

        return { data, error: error?.message || null }
    },

    /**
     * Mark reminder as sent
     */
    async markAsSent(id: string): Promise<ApiResponse<Reminder>> {
        const { data, error } = await supabase
            .from('reminders')
            .update({ status: 'sent' })
            .eq('id', id)
            .select()
            .single()

        return { data, error: error?.message || null }
    },

    /**
     * Delete reminder
     */
    async delete(id: string): Promise<ApiResponse<null>> {
        const { error } = await supabase
            .from('reminders')
            .delete()
            .eq('id', id)

        return { data: null, error: error?.message || null }
    }
}

// ============================================
// Dashboard Analytics APIs
// ============================================

export const dashboardApi = {
    /**
     * Get dashboard KPIs
     */
    async getKPIs(): Promise<ApiResponse<DashboardKPIs>> {
        const { data, error } = await supabase
            .from('dashboard_kpis')
            .select('*')
            .single()

        return { data, error: error?.message || null }
    },

    /**
     * Get premium by provider
     */
    async getPremiumByProvider(): Promise<ApiResponse<any[]>> {
        const { data, error } = await supabase
            .from('policies')
            .select('provider, premium')
            .eq('status', 'active')

        if (error || !data) {
            return { data: [], error: error?.message || null }
        }

        // Aggregate by provider
        const aggregated = data.reduce((acc: any, policy) => {
            const provider = policy.provider || 'Unknown'
            if (!acc[provider]) {
                acc[provider] = { provider, total_premium: 0, count: 0 }
            }
            acc[provider].total_premium += Number(policy.premium || 0)
            acc[provider].count += 1
            return acc
        }, {})

        return { data: Object.values(aggregated), error: null }
    },

    /**
     * Get policies by type
     */
    async getPoliciesByType(): Promise<ApiResponse<any[]>> {
        const { data, error } = await supabase
            .from('policies')
            .select('policy_type')
            .eq('status', 'active')

        if (error || !data) {
            return { data: [], error: error?.message || null }
        }

        // Count by type
        const counts = data.reduce((acc: any, policy) => {
            const type = policy.policy_type || 'Unknown'
            acc[type] = (acc[type] || 0) + 1
            return acc
        }, {})

        return {
            data: Object.entries(counts).map(([policy_type, count]) => ({ policy_type, count })),
            error: null
        }
    },

    /**
     * Get recent activities
     */
    async getRecentActivities(limit: number = 10): Promise<ApiResponse<any[]>> {
        const { data: policies, error: policyError } = await supabase
            .from('policies')
            .select('*, client:clients(full_name)')
            .order('created_at', { ascending: false })
            .limit(limit)

        if (policyError) {
            return { data: [], error: policyError.message }
        }

        return { data: policies || [], error: null }
    }
}

// ============================================
// Search API
// ============================================

export const searchApi = {
    /**
     * Global search across clients and policies
     */
    async globalSearch(query: string): Promise<ApiResponse<{
        clients: Client[]
        policies: Policy[]
    }>> {
        try {
            const [clientsResult, policiesResult] = await Promise.all([
                supabase
                    .from('clients')
                    .select('*')
                    .or(`full_name.ilike.%${query}%,phone.ilike.%${query}%,email.ilike.%${query}%`)
                    .limit(10),
                supabase
                    .from('policies')
                    .select('*, client:clients(full_name)')
                    .or(`policy_number.ilike.%${query}%,provider.ilike.%${query}%`)
                    .limit(10)
            ])

            return {
                data: {
                    clients: clientsResult.data || [],
                    policies: policiesResult.data || []
                },
                error: null
            }
        } catch (err) {
            return {
                data: { clients: [], policies: [] },
                error: (err as Error).message
            }
        }
    }
}
