'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabaseQuery, useSupabaseMutation } from '@/hooks/useSupabaseQuery'
import { createClient } from '@/utils/supabase/client'

export default function AddDocumentPage() {
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    client_id: '',
    policy_id: '',
    file: null
  })

  const [clientSearch, setClientSearch] = useState('')
  const [policySearch, setPolicySearch] = useState('')
  const [showClientDropdown, setShowClientDropdown] = useState(false)
  const [showPolicyDropdown, setShowPolicyDropdown] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)

  // Fetch clients and policies
  const { data: formOptions, loading: optionsLoading } = useSupabaseQuery(
    'document-form-options',
    async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const [clientsRes, policiesRes] = await Promise.all([
        supabase
          .from('clients')
          .select('id, full_name, email')
          .eq('agent_id', user.id)
          .is('deleted_at', null)
          .order('full_name'),
        supabase
          .from('policies')
          .select(`
            id, 
            policy_number,
            clients!inner (
              full_name
            )
          `)
          .eq('agent_id', user.id)
          .is('deleted_at', null)
          .order('policy_number')
      ])

      if (clientsRes.error) throw clientsRes.error
      if (policiesRes.error) throw policiesRes.error

      return {
        clients: clientsRes.data || [],
        policies: policiesRes.data || []
      }
    },
    { staleTime: 120000 }
  )

  const clients = formOptions?.clients || []
  const policies = formOptions?.policies || []

  // Get selected client and policy
  const selectedClient = clients.find(c => c.id === formData.client_id)
  const selectedPolicy = policies.find(p => p.id === formData.policy_id)

  // Filtered clients based on search
  const filteredClients = useMemo(() => {
    if (!clientSearch) return clients
    const query = clientSearch.toLowerCase()
    return clients.filter(client =>
      client.full_name?.toLowerCase().includes(query) ||
      client.email?.toLowerCase().includes(query)
    )
  }, [clients, clientSearch])

  // Filtered policies based on search (filter by client if selected)
  const filteredPolicies = useMemo(() => {
    let filtered = formData.client_id
      ? policies.filter(p => p.clients?.full_name === selectedClient?.full_name)
      : policies

    if (policySearch) {
      const query = policySearch.toLowerCase()
      filtered = filtered.filter(policy =>
        policy.policy_number?.toLowerCase().includes(query) ||
        policy.clients?.full_name?.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [policies, policySearch, formData.client_id, selectedClient])

  // Mutation for uploading document
  const uploadDocumentMutation = useSupabaseMutation(
    async (docData) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Upload file to Supabase Storage
      const file = docData.file
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      setUploadProgress(10)

      // Upload to storage bucket named 'policy-documents'
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('policy-documents')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        throw new Error(`File upload failed: ${uploadError.message}`)
      }

      setUploadProgress(50)

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('policy-documents')
        .getPublicUrl(filePath)

      setUploadProgress(70)

      // Insert document record
      const { data, error } = await supabase
        .from('documents')
        .insert([
          {
            agent_id: user.id,
            client_id: docData.client_id,
            policy_id: docData.policy_id,
            file_name: file.name,
            file_url: urlData.publicUrl,
            file_size: file.size
          }
        ])
        .select()

      if (error) throw error

      setUploadProgress(100)
      return data
    },
    {
      onSuccess: () => {
        setSuccess('Document uploaded successfully!')
        setTimeout(() => {
          router.push('/documents')
        }, 1500)
      },
      invalidateKeys: ['documents-list', 'dashboard-kpis']
    }
  )

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB')
        return
      }
      setFormData(prev => ({ ...prev, file }))
      setError('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setUploadProgress(0)

    // Validate
    if (!formData.client_id || !formData.policy_id || !formData.file) {
      setError('Please select a client, policy, and file')
      return
    }

    try {
      await uploadDocumentMutation.mutate(formData)
    } catch (err) {
      console.error('Error uploading document:', err)
      setError(err.message || 'Failed to upload document')
      setUploadProgress(0)
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Upload Document</h1>
        <p className="text-gray-600">Upload a document for a client's policy</p>
      </div>

      {/* Form */}
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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Client Selection with Autocomplete */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Client <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={selectedClient ? `${selectedClient.full_name} - ${selectedClient.email}` : clientSearch}
                onChange={(e) => {
                  setClientSearch(e.target.value)
                  setShowClientDropdown(true)
                  if (selectedClient) {
                    setFormData(prev => ({ ...prev, client_id: '', policy_id: '' }))
                  }
                }}
                onFocus={() => setShowClientDropdown(true)}
                placeholder="Search client by name or email..."
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              />
              {showClientDropdown && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {optionsLoading ? (
                    <div className="px-4 py-3 text-sm text-gray-500">Loading clients...</div>
                  ) : filteredClients.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-gray-500">
                      {clientSearch ? 'No clients found' : 'No clients available'}
                    </div>
                  ) : (
                    filteredClients.map(client => (
                      <button
                        key={client.id}
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, client_id: client.id, policy_id: '' }))
                          setClientSearch('')
                          setShowClientDropdown(false)
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-indigo-50 transition-colors"
                      >
                        <div className="font-medium text-gray-900">{client.full_name}</div>
                        <div className="text-sm text-gray-500">{client.email}</div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Policy Selection with Autocomplete */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Policy <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={selectedPolicy ? `${selectedPolicy.policy_number} - ${selectedPolicy.clients?.full_name}` : policySearch}
                onChange={(e) => {
                  setPolicySearch(e.target.value)
                  setShowPolicyDropdown(true)
                  if (selectedPolicy) {
                    setFormData(prev => ({ ...prev, policy_id: '' }))
                  }
                }}
                onFocus={() => setShowPolicyDropdown(true)}
                placeholder="Search policy by policy number..."
                required
                disabled={!formData.client_id}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              {showPolicyDropdown && formData.client_id && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {optionsLoading ? (
                    <div className="px-4 py-3 text-sm text-gray-500">Loading policies...</div>
                  ) : filteredPolicies.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-gray-500">
                      {policySearch ? 'No policies found' : 'No policies for this client'}
                    </div>
                  ) : (
                    filteredPolicies.map(policy => (
                      <button
                        key={policy.id}
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({ ...prev, policy_id: policy.id }))
                          setPolicySearch('')
                          setShowPolicyDropdown(false)
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-indigo-50 transition-colors"
                      >
                        <div className="font-medium text-gray-900">{policy.policy_number}</div>
                        <div className="text-sm text-gray-500">{policy.clients?.full_name}</div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
            {!formData.client_id && (
              <p className="mt-1 text-sm text-gray-500">Please select a client first</p>
            )}
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Document File <span className="text-red-500">*</span>
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-indigo-400 transition-colors">
              <div className="space-y-1 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                  >
                    <span>Upload a file</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      onChange={handleFileChange}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                      required
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PDF, DOC, DOCX, JPG, PNG up to 10MB</p>
                {formData.file && (
                  <p className="text-sm text-green-600 font-medium mt-2">
                    Selected: {formData.file.name} ({(formData.file.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Upload Progress */}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.push('/documents')}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploadDocumentMutation.loading || uploadProgress > 0}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploadDocumentMutation.loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Upload Document
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
