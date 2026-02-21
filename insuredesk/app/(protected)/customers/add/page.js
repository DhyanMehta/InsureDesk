'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AddCustomerPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    CUSTOMER_NAME: '',
    INSURANCE_COMPANY: '',
    SUB_CATEGORY: '',
    REGISTRATION_NO: '',
    VEHICLE_NAME: '',
    POLICY_NUMBER: '',
    START_DATE: '',
    END_DATE: '',
    PREMIUM: '',
    AGENCY: '',
    MOBILE_NO: '',
    MAIL_ID: '',
    REF_BY: '',
  })

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const requiredFields = [
    'CUSTOMER_NAME',
    'INSURANCE_COMPANY',
    'SUB_CATEGORY',
    'POLICY_NUMBER',
    'START_DATE',
    'END_DATE',
    'AGENCY',
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validate required fields
    const missingFields = requiredFields.filter((field) => !formData[field])
    if (missingFields.length > 0) {
      setError('Please fill in all required fields')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to add customer')
      }

      setSuccess('Customer added successfully!')
      
      // Reset form
      setFormData({
        CUSTOMER_NAME: '',
        INSURANCE_COMPANY: '',
        SUB_CATEGORY: '',
        REGISTRATION_NO: '',
        VEHICLE_NAME: '',
        POLICY_NUMBER: '',
        START_DATE: '',
        END_DATE: '',
        PREMIUM: '',
        AGENCY: '',
        MOBILE_NO: '',
        MAIL_ID: '',
        REF_BY: '',
      })

      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/customers')
      }, 2000)
    } catch (err) {
      setError(err.message || 'Failed to add customer')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Add New Client</h1>
        <p className="text-gray-600">Register a new client in the system</p>
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
            {/* Customer Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="CUSTOMER_NAME"
                value={formData.CUSTOMER_NAME}
                onChange={handleChange}
                placeholder="Enter customer name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            {/* Insurance Company */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Insurance Company <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="INSURANCE_COMPANY"
                value={formData.INSURANCE_COMPANY}
                onChange={handleChange}
                placeholder="Enter insurance company"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            {/* Sub Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sub Category <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="SUB_CATEGORY"
                value={formData.SUB_CATEGORY}
                onChange={handleChange}
                placeholder="e.g., Motor, Health, Life"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            {/* Registration Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Registration Number
              </label>
              <input
                type="text"
                name="REGISTRATION_NO"
                value={formData.REGISTRATION_NO}
                onChange={handleChange}
                placeholder="Vehicle registration number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            {/* Vehicle Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vehicle Name
              </label>
              <input
                type="text"
                name="VEHICLE_NAME"
                value={formData.VEHICLE_NAME}
                onChange={handleChange}
                placeholder="Vehicle make/model"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            {/* Policy Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Policy Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="POLICY_NUMBER"
                value={formData.POLICY_NUMBER}
                onChange={handleChange}
                placeholder="Enter policy number"
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
                name="START_DATE"
                value={formData.START_DATE}
                onChange={handleChange}
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
                name="END_DATE"
                value={formData.END_DATE}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            {/* Premium Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Premium Amount
              </label>
              <input
                type="number"
                name="PREMIUM"
                value={formData.PREMIUM}
                onChange={handleChange}
                placeholder="Enter premium amount"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            {/* Agency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Agency <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="AGENCY"
                value={formData.AGENCY}
                onChange={handleChange}
                placeholder="Enter agency name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Number
              </label>
              <input
                type="text"
                name="MOBILE_NO"
                value={formData.MOBILE_NO}
                onChange={handleChange}
                placeholder="Enter mobile number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="MAIL_ID"
                value={formData.MAIL_ID}
                onChange={handleChange}
                placeholder="Enter email address"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>

            {/* Referred By */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Referred By
              </label>
              <input
                type="text"
                name="REF_BY"
                value={formData.REF_BY}
                onChange={handleChange}
                placeholder="Reference name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.push('/customers')}
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
                  Add Client
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
