'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function PoliciesPage() {
  const router = useRouter()
  const supabase = createClient()

  const [policies, setPolicies] = useState([])
  const [filteredPolicies, setFilteredPolicies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Column search filters
  const [filters, setFilters] = useState({
    clientName: '',
    policyNumber: '',
    insuranceCompany: '',
    subCategory: '',
    vehicleRegistration: '',
    provider: '',
    status: ''
  })

  useEffect(() => {
    fetchPolicies()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [filters, policies])

  const fetchPolicies = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('policies')
        .select(`
          *,
          clients (
            id,
            full_name,
            email,
            phone,
            address
          ),
          insurance_companies (
            id,
            name
          ),
          providers (
            id,
            name
          ),
          policy_subcategories (
            id,
            name
          )
        `)
        .eq('agent_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })

      if (error) throw error
      setPolicies(data || [])
      setFilteredPolicies(data || [])
    } catch (err) {
      console.error('Error fetching policies:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...policies]

    if (filters.clientName) {
      filtered = filtered.filter(p =>
        p.clients?.full_name?.toLowerCase().includes(filters.clientName.toLowerCase())
      )
    }

    if (filters.policyNumber) {
      filtered = filtered.filter(p =>
        p.policy_number?.toLowerCase().includes(filters.policyNumber.toLowerCase())
      )
    }

    if (filters.insuranceCompany) {
      filtered = filtered.filter(p =>
        p.insurance_companies?.name?.toLowerCase().includes(filters.insuranceCompany.toLowerCase())
      )
    }

    if (filters.subCategory) {
      filtered = filtered.filter(p =>
        p.policy_subcategories?.name?.toLowerCase().includes(filters.subCategory.toLowerCase())
      )
    }

    if (filters.vehicleRegistration) {
      filtered = filtered.filter(p =>
        p.registration_no?.toLowerCase().includes(filters.vehicleRegistration.toLowerCase())
      )
    }

    if (filters.provider) {
      filtered = filtered.filter(p =>
        p.providers?.name?.toLowerCase().includes(filters.provider.toLowerCase())
      )
    }

    if (filters.status) {
      filtered = filtered.filter(p =>
        p.status?.toLowerCase().includes(filters.status.toLowerCase())
      )
    }

    setFilteredPolicies(filtered)
  }

  const handleFilterChange = (column, value) => {
    setFilters(prev => ({ ...prev, [column]: value }))
  }

  const clearAllFilters = () => {
    setFilters({
      clientName: '',
      policyNumber: '',
      insuranceCompany: '',
      subCategory: '',
      vehicleRegistration: '',
      provider: '',
      status: ''
    })
  }

  const exportToExcel = () => {
    try {
      // Prepare data for export
      const exportData = filteredPolicies.map(policy => ({
        'CLIENT NAME': policy.clients?.full_name || '',
        'EMAIL': policy.clients?.email || '',
        'PHONE': policy.clients?.phone || '',
        'ADDRESS': policy.clients?.address || '',
        'INSURANCE COMPANY': policy.insurance_companies?.name || '',
        'SUB CATEGORY': policy.policy_subcategories?.name || '',
        'REGISTRATION NO': policy.registration_no || '',
        'VEHICLE NAME': policy.vehicle_name || '',
        'POLICY NUMBER': policy.policy_number || '',
        'PROVIDER': policy.providers?.name || '',
        'START DATE': policy.start_date ? new Date(policy.start_date).toLocaleDateString() : '',
        'END DATE': policy.end_date ? new Date(policy.end_date).toLocaleDateString() : '',
        'STATUS': policy.status || '',
        'PREMIUM': policy.premium || '',
        'COMMISSION': policy.commission || ''
      }))

      // Convert to CSV
      const headers = Object.keys(exportData[0])
      const csvContent = [
        headers.join(','),
        ...exportData.map(row =>
          headers.map(header => {
            const value = row[header]
            // Escape commas and quotes in values
            return `"${String(value).replace(/"/g, '""')}"`
          }).join(',')
        )
      ].join('\n')

      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `policies_export_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      console.error('Error exporting to Excel:', err)
      setError('Failed to export data')
    }
  }

  const getStatusBadge = (status) => {
    const colors = {
      ok: 'bg-green-100 text-green-800',
      due: 'bg-orange-100 text-orange-800',
      pending: 'bg-yellow-100 text-yellow-800',
      expired: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading policies...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-full mx-auto">
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Policies</h1>
          <p className="text-gray-600">Manage all insurance policies ({filteredPolicies.length} total)</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportToExcel}
            disabled={filteredPolicies.length === 0}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export to Excel
          </button>
          <button
            onClick={() => router.push('/policies/add')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Policy
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}

      {/* Filter Actions */}
      {Object.values(filters).some(f => f !== '') && (
        <div className="mb-4 flex items-center justify-between bg-indigo-50 border border-indigo-200 rounded-lg p-3">
          <p className="text-sm text-indigo-900">
            <span className="font-medium">{filteredPolicies.length}</span> policies match your filters
          </p>
          <button
            onClick={clearAllFilters}
            className="px-3 py-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Policies Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-yellow-100 border-b border-gray-300">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Client Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Policy Number
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Insurance Company
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Sub Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Registration No
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Vehicle Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Provider
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Start Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                  End Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">
                  Premium
                </th>
              </tr>
            </thead>
            {/* Filter Row */}
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-2">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={filters.clientName}
                    onChange={(e) => handleFilterChange('clientName', e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                </th>
                <th className="px-4 py-2">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={filters.policyNumber}
                    onChange={(e) => handleFilterChange('policyNumber', e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                </th>
                <th className="px-4 py-2">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={filters.insuranceCompany}
                    onChange={(e) => handleFilterChange('insuranceCompany', e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                </th>
                <th className="px-4 py-2">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={filters.subCategory}
                    onChange={(e) => handleFilterChange('subCategory', e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                </th>
                <th className="px-4 py-2">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={filters.vehicleRegistration}
                    onChange={(e) => handleFilterChange('vehicleRegistration', e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                </th>
                <th className="px-4 py-2"></th>
                <th className="px-4 py-2">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={filters.provider}
                    onChange={(e) => handleFilterChange('provider', e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                </th>
                <th className="px-4 py-2"></th>
                <th className="px-4 py-2"></th>
                <th className="px-4 py-2">
                  <input
                    type="text"
                    placeholder="Search..."
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  />
                </th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPolicies.length === 0 ? (
                <tr>
                  <td colSpan="11" className="px-6 py-12 text-center text-gray-500">
                    {policies.length === 0 ? 'No policies found' : 'No policies match your filters'}
                  </td>
                </tr>
              ) : (
                filteredPolicies.map((policy) => (
                  <tr key={policy.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {policy.clients?.full_name || 'N/A'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-indigo-600 font-medium">
                      {policy.policy_number}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {policy.insurance_companies?.name || 'N/A'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {policy.policy_subcategories?.name || 'N/A'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {policy.registration_no || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {policy.vehicle_name || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {policy.providers?.name || 'N/A'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {policy.start_date ? new Date(policy.start_date).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {policy.end_date ? new Date(policy.end_date).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(policy.status)}`}>
                        {policy.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">
                      ₹{policy.premium?.toLocaleString() || '0'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
