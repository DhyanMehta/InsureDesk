'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function ClientDetailPage() {
  const router = useRouter()
  const params = useParams()
  const clientId = params.id
  const supabase = createClient()

  const [client, setClient] = useState(null)
  const [policies, setPolicies] = useState([])
  const [documents, setDocuments] = useState([])
  const [reminders, setReminders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (clientId) {
      fetchClientData()
    }
  }, [clientId])

  const fetchClientData = async () => {
    setLoading(true)
    setError('')

    try {
      // Fetch client details
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single()

      if (clientError) throw clientError
      setClient(clientData)

      // Fetch client policies
      const { data: policiesData, error: policiesError } = await supabase
        .from('policies')
        .select(`
          *,
          insurance_companies (id, name),
          providers (id, name),
          policy_subcategories (id, name)
        `)
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })

      if (policiesError) throw policiesError
      setPolicies(policiesData || [])

      // Fetch client documents
      const { data: documentsData, error: documentsError } = await supabase
        .from('documents')
        .select('*')
        .eq('client_id', clientId)
        .order('uploaded_at', { ascending: false })

      if (documentsError) throw documentsError
      setDocuments(documentsData || [])

      // Fetch client reminders
      const { data: remindersData, error: remindersError } = await supabase
        .from('reminders')
        .select('*, policies(policy_number)')
        .eq('client_id', clientId)
        .order('remind_on', { ascending: true })

      if (remindersError) throw remindersError
      setReminders(remindersData || [])

    } catch (err) {
      console.error('Error fetching client data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading client details...</p>
        </div>
      </div>
    )
  }

  if (error || !client) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold text-red-900 mb-2">Error Loading Client</h2>
          <p className="text-red-700 mb-4">{error || 'Client not found'}</p>
          <button
            onClick={() => router.push('/clients')}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Return to Clients
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push('/clients')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Clients
        </button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{client.name}</h1>
            <div className="flex flex-wrap gap-4 text-gray-600">
              {client.email && (
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {client.email}
                </div>
              )}
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {client.phone}
              </div>
              {client.age && (
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Age: {client.age}
                </div>
              )}
            </div>
            {client.address && (
              <p className="text-gray-600 mt-2 flex items-start gap-2">
                <svg className="w-5 h-5 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {client.address}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-8">
          {['overview', 'policies', 'documents', 'reminders'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Policies</h3>
            <p className="text-3xl font-bold text-gray-900">{policies.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Documents</h3>
            <p className="text-3xl font-bold text-gray-900">{documents.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Active Reminders</h3>
            <p className="text-3xl font-bold text-gray-900">
              {reminders.filter(r => r.status === 'pending').length}
            </p>
          </div>
        </div>
      )}

      {activeTab === 'policies' && (
        <div className="space-y-4">
          {policies.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <p className="text-gray-500">No policies found for this client</p>
            </div>
          ) : (
            policies.map((policy) => (
              <div key={policy.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">{policy.policy_number}</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><span className="font-medium">Insurance Company:</span> {policy.insurance_companies?.name || 'N/A'}</p>
                      <p><span className="font-medium">Provider:</span> {policy.providers?.name || 'N/A'}</p>
                      <p><span className="font-medium">Sub-Category:</span> {policy.policy_subcategories?.name || 'N/A'}</p>
                      <p><span className="font-medium">Premium:</span> ₹{policy.premium?.toLocaleString() || '0'}</p>
                      <p><span className="font-medium">Period:</span> {new Date(policy.start_date).toLocaleDateString()} - {new Date(policy.end_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    policy.status === 'ok' ? 'bg-green-100 text-green-800' :
                    policy.status === 'due' ? 'bg-orange-100 text-orange-800' :
                    policy.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    policy.status === 'expired' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {policy.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.length === 0 ? (
            <div className="col-span-full bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <p className="text-gray-500">No documents found for this client</p>
            </div>
          ) : (
            documents.map((doc) => (
              <div key={doc.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h4 className="font-semibold text-gray-900 mb-2">{doc.file_name}</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()}
                </p>
                <a
                  href={doc.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                >
                  View Document →
                </a>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'reminders' && (
        <div className="space-y-4">
          {reminders.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <p className="text-gray-500">No reminders found for this client</p>
            </div>
          ) : (
            reminders.map((reminder) => (
              <div key={reminder.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">{reminder.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{reminder.description}</p>
                    <p className="text-sm text-gray-500">
                      Date: {new Date(reminder.remind_on).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    reminder.status === 'completed' ? 'bg-green-100 text-green-800' :
                    reminder.status === 'dismissed' ? 'bg-gray-100 text-gray-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {reminder.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
