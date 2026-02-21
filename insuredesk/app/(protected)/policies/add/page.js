'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function AddPolicyPage() {
  const router = useRouter()
  const supabase = createClient()
  
  const [clients, setClients] = useState([])
  const [insuranceCompanies, setInsuranceCompanies] = useState([])
  const [providers, setProviders] = useState([])
  const [subCategories, setSubCategories] = useState([])
  const [selectedSubCategory, setSelectedSubCategory] = useState(null)
  
  const [formData, setFormData] = useState({
    client_id: '',
    policy_number: '',
    insurance_company_id: '',
    provider_id: '',
    subcategory_id: '',
    registration_no: '',
    vehicle_name: '',
    premium: '',
    commission: '',
    start_date: '',
    end_date: '',
    status: 'ok'
  })
  
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch all data in parallel
      const [clientsRes, companiesRes, providersRes, categoriesRes] = await Promise.all([
        supabase
          .from('clients')
          .select('id, full_name, email')
          .eq('agent_id', user.id)
          .is('deleted_at', null)
          .order('full_name'),
        supabase
          .from('insurance_companies')
          .select('*')
          .order('name'),
        supabase
          .from('providers')
          .select('*')
          .order('name'),
        supabase
          .from('policy_subcategories')
          .select('*')
          .order('name')
      ])

      if (clientsRes.error) throw clientsRes.error
      if (companiesRes.error) throw companiesRes.error
      if (providersRes.error) throw providersRes.error
      if (categoriesRes.error) throw categoriesRes.error

      setClients(clientsRes.data || [])
      setInsuranceCompanies(companiesRes.data || [])
      setProviders(providersRes.data || [])
      setSubCategories(categoriesRes.data || [])
    } catch (err) {
      console.error('Error fetching data:', err)
      setError('Failed to load form data: ' + err.message)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Handle subcategory_id change to show/hide vehicle fields
    if (name === 'subcategory_id') {
      const selected = subCategories.find(cat => cat.id === value)
      setSelectedSubCategory(selected)
      
      // Determine if vehicle fields are required (2/4 Wheeler)
      const requiresVehicle = selected && (selected.name.includes('Wheeler') || selected.name.includes('wheeler'))
      
      // Clear vehicle fields if not required
      if (!requiresVehicle) {
        setFormData(prev => ({
          ...prev,
          registration_no: '',
          vehicle_name: ''
        }))
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('User not authenticated')
      }

      // Validate required fields
      if (!formData.client_id || !formData.policy_number || !formData.insurance_company_id || 
          !formData.provider_id || !formData.subcategory_id || !formData.premium || 
          !formData.start_date || !formData.end_date) {
        throw new Error('Please fill in all required fields')
      }

      // Check if vehicle fields are required
      const requiresVehicle = selectedSubCategory && 
        (selectedSubCategory.name.includes('Wheeler') || selectedSubCategory.name.includes('wheeler'))
      
      if (requiresVehicle && (!formData.registration_no || !formData.vehicle_name)) {
        throw new Error('Vehicle details are required for this sub-category')
      }

      const policyData = {
        agent_id: user.id,
        client_id: formData.client_id,
        policy_number: formData.policy_number,
        insurance_company_id: formData.insurance_company_id,
        provider_id: formData.provider_id,
        subcategory_id: formData.subcategory_id,
        premium: parseFloat(formData.premium),
        commission: formData.commission ? parseFloat(formData.commission) : null,
        start_date: formData.start_date,
        end_date: formData.end_date,
        status: formData.status
      }

      // Add vehicle fields only if required
      if (requiresVehicle) {
        policyData.registration_no = formData.registration_no
        policyData.vehicle_name = formData.vehicle_name
      }

      const { data, error } = await supabase
        .from('policies')
        .insert([policyData])

      if (error) throw error

      setSuccess('Policy added successfully!')
      setTimeout(() => {
        router.push('/policies')
      }, 1500)
    } catch (err) {
      console.error('Error adding policy:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Add New Policy</h1>
        <p className="text-gray-600">Create a new insurance policy</p>
      </div>

      {/* Form Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Client Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client <span className="text-red-500">*</span>
              </label>
              <select
                name="client_id"
                value={formData.client_id}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              >
                <option value="">Select a client</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.full_name} - {client.email}
                  </option>
                ))}
              </select>
            </div>

            {/* Policy Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Policy Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="policy_number"
                value={formData.policy_number}
                onChange={handleChange}
                placeholder="Enter policy number"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            {/* Insurance Company */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Insurance Company <span className="text-red-500">*</span>
              </label>
              <select
                name="insurance_company_id"
                value={formData.insurance_company_id}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              >
                <option value="">Select insurance company</option>
                {insuranceCompanies.map(company => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sub Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sub Category <span className="text-red-500">*</span>
              </label>
              <select
                name="subcategory_id"
                value={formData.subcategory_id}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              >
                <option value="">Select sub category</option>
                {subCategories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                    {(category.name.includes('Wheeler') || category.name.includes('wheeler')) && ' (Vehicle Required)'}
                  </option>
                ))}
              </select>
            </div>

            {/* Conditional Vehicle Fields */}
            {selectedSubCategory && (selectedSubCategory.name.includes('Wheeler') || selectedSubCategory.name.includes('wheeler')) && (
              <>
                {/* Vehicle Registration Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vehicle Registration No. <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="registration_no"
                    value={formData.registration_no}
                    onChange={handleChange}
                    placeholder="e.g., MH12AB1234"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>

                {/* Vehicle Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vehicle Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="vehicle_name"
                    value={formData.vehicle_name}
                    onChange={handleChange}
                    placeholder="e.g., Honda City VX"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
              </>
            )}

            {/* Provider */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Provider <span className="text-red-500">*</span>
              </label>
              <select
                name="provider_id"
                value={formData.provider_id}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              >
                <option value="">Select provider</option>
                {providers.map(provider => (
                  <option key={provider.id} value={provider.id}>
                    {provider.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              >
                <option value="ok">OK</option>
                <option value="due">Due</option>
                <option value="pending">Pending</option>
                <option value="expired">Expired</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Premium */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Premium Amount <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="premium"
                value={formData.premium}
                onChange={handleChange}
                placeholder="Enter premium amount"
                step="0.01"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            {/* Commission */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Commission Amount
              </label>
              <input
                type="number"
                name="commission"
                value={formData.commission}
                onChange={handleChange}
                placeholder="Enter commission amount"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.push('/policies')}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adding...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Policy
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
