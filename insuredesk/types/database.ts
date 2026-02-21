/**
 * InsureDesk - Database Types
 * Generated from Supabase schema (insurtech_schema.sql)
 * Multi-tenant insurance management system
 */

// ============================================
// Core Database Types
// ============================================

export interface Profile {
    id: string // UUID, references auth.users
    full_name: string | null
    company_name: string | null
    phone: string | null
    created_at: string
}

export interface Client {
    id: string // UUID
    agent_id: string // UUID, references profiles
    full_name: string
    email: string | null
    phone: string | null
    address: string | null
    date_of_birth: string | null // ISO date string (YYYY-MM-DD)
    created_at: string
    deleted_at: string | null
}

export interface Policy {
    id: string // UUID
    agent_id: string // UUID, references profiles
    client_id: string // UUID, references clients
    policy_number: string
    policy_type: string | null
    provider: string | null
    premium: number | null
    commission: number | null
    start_date: string | null // ISO date string
    end_date: string | null // ISO date string
    status: 'active' | 'expired' | 'cancelled'
    created_at: string
    deleted_at: string | null
}

export interface Document {
    id: string // UUID
    agent_id: string // UUID, references profiles
    client_id: string | null // UUID, references clients
    policy_id: string | null // UUID, references policies
    file_name: string | null
    file_url: string | null
    file_size: number | null
    uploaded_at: string
}

export interface Reminder {
    id: string // UUID
    agent_id: string // UUID, references profiles
    client_id: string | null // UUID, references clients
    policy_id: string | null // UUID, references policies
    reminder_type: string | null
    remind_on: string | null // ISO date string
    status: string
    created_at: string
}

export interface Analytics {
    id: string // UUID
    agent_id: string // UUID, references profiles
    metric: string | null
    value: number | null
    recorded_at: string
}

// ============================================
// Extended Types with Relations
// ============================================

export interface ClientWithPolicies extends Client {
    policies?: Policy[]
}

export interface PolicyWithClient extends Policy {
    client?: Client
}

export interface PolicyWithDocuments extends Policy {
    documents?: Document[]
}

export interface PolicyWithClientAndDocuments extends Policy {
    client?: Client
    documents?: Document[]
}

export interface ReminderWithPolicy extends Reminder {
    policy?: Policy
    client?: Client
}

// ============================================
// Dashboard KPI Types (from dashboard_kpis VIEW)
// ============================================

export interface DashboardKPIs {
    agent_id: string
    total_clients: number
    active_policies: number
    expiring_soon: number
    expired_policies: number
    total_active_premium: number
    total_commission: number
}

// ============================================
// Filter & Query Types
// ============================================

export interface ClientFilters {
    search?: string
    created_after?: string
    created_before?: string
}

export interface PolicyFilters {
    search?: string
    client_id?: string
    status?: Policy['status']
    provider?: string
    expiring_within_days?: number
    start_date_from?: string
    start_date_to?: string
    end_date_from?: string
    end_date_to?: string
}

export interface ReminderFilters {
    status?: string
    reminder_type?: string
    date_from?: string
    date_to?: string
    policy_id?: string
    client_id?: string
}

// ============================================
// Form Data Types (for creating/updating)
// ============================================

export type ClientFormData = Omit<Client, 'id' | 'agent_id' | 'created_at' | 'deleted_at'>

export type PolicyFormData = Omit<Policy, 'id' | 'agent_id' | 'created_at' | 'deleted_at'>

export type ReminderFormData = Omit<Reminder, 'id' | 'agent_id' | 'created_at'>

export type DocumentFormData = Omit<Document, 'id' | 'agent_id' | 'uploaded_at'>

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
    data: T | null
    error: string | null
    count?: number
}

export interface PaginatedResponse<T> {
    data: T[]
    count: number
    page: number
    page_size: number
    total_pages: number
}

// ============================================
// Chart Data Types
// ============================================

export interface ChartDataPoint {
    label: string
    value: number
    color?: string
}

export interface TimeSeriesData {
    date: string
    value: number
    label?: string
}

export interface PremiumByCompany {
    insurance_company: string
    total_premium: number
    policy_count: number
    percentage: number
}

export interface PoliciesByCategory {
    category: string
    count: number
    percentage: number
}

export interface MonthlyRevenue {
    month: string
    premium: number
    commission: number
}

// ============================================
// Notification Types
// ============================================

export interface Notification {
    id: string
    type: 'info' | 'success' | 'warning' | 'error'
    title: string
    message: string
    timestamp: string
    read: boolean
    action_url?: string
}

// ============================================
// Export Types
// ============================================

export interface ExportOptions {
    format: 'csv' | 'excel' | 'pdf'
    columns: string[]
    filters?: ClientFilters | PolicyFilters
    date_range?: {
        from: string
        to: string
    }
}

// ============================================
// Storage Types
// ============================================

export interface StorageFile {
    name: string
    path: string
    size: number
    mime_type: string
    url: string
    created_at: string
}

export interface UploadProgress {
    file_name: string
    progress: number
    status: 'pending' | 'uploading' | 'completed' | 'error'
    error?: string
}

// ============================================
// Utility Types
// ============================================

export type SortOrder = 'asc' | 'desc'

export interface SortConfig {
    field: string
    order: SortOrder
}

export interface PaginationConfig {
    page: number
    page_size: number
}

// ============================================
// Constants
// ============================================

export const POLICY_CATEGORIES = [
    'Motor Insurance',
    'Health Insurance',
    'Life Insurance',
    'Home Insurance',
    'Travel Insurance',
    'Business Insurance',
    'Other'
] as const

export const INSURANCE_COMPANIES = [
    'HDFC ERGO',
    'ICICI Lombard',
    'Bajaj Allianz',
    'Reliance General',
    'TATA AIG',
    'New India Assurance',
    'Oriental Insurance',
    'United India Insurance',
    'National Insurance',
    'SBI General Insurance',
    'Other'
] as const

export const DOCUMENT_TYPES = [
    'policy_copy',
    'id_proof',
    'address_proof',
    'vehicle_rc',
    'invoice',
    'other'
] as const

export const STATES = [
    'Andhra Pradesh',
    'Arunachal Pradesh',
    'Assam',
    'Bihar',
    'Chhattisgarh',
    'Goa',
    'Gujarat',
    'Haryana',
    'Himachal Pradesh',
    'Jharkhand',
    'Karnataka',
    'Kerala',
    'Madhya Pradesh',
    'Maharashtra',
    'Manipur',
    'Meghalaya',
    'Mizoram',
    'Nagaland',
    'Odisha',
    'Punjab',
    'Rajasthan',
    'Sikkim',
    'Tamil Nadu',
    'Telangana',
    'Tripura',
    'Uttar Pradesh',
    'Uttarakhand',
    'West Bengal'
] as const

export type PolicyCategory = typeof POLICY_CATEGORIES[number]
export type InsuranceCompany = typeof INSURANCE_COMPANIES[number]
export type DocumentType = typeof DOCUMENT_TYPES[number]
export type State = typeof STATES[number]
