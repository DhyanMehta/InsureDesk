'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function DocumentsPage() {
  const router = useRouter()
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const supabase = createClient()

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('documents')
        .select(`
          *,
          policies (
            policy_number,
            provider,
            clients (
              name
            )
          )
        `)
        .eq('agent_id', user.id)
        .order('uploaded_at', { ascending: false })

      if (error) throw error
      setDocuments(data || [])
    } catch (err) {
      console.error('Error fetching documents:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getFileIcon = (fileType) => {
    if (fileType?.includes('pdf')) {
      return (
        <svg className="w-12 h-12 text-red-600" fill="currentColor" viewBox="0 0 56 64">
          <path d="M5.112 0C2.289 0 0 2.289 0 5.112v53.76C0 61.71 2.289 64 5.112 64h45.76C53.71 64 56 61.71 56 58.88V16.84L39.17 0H5.112z" />
          <path fill="#FFFEFE" d="M39.17 0v16.84H56L39.17 0z" />
          <text x="50%" y="45" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#FFFEFE">PDF</text>
        </svg>
      )
    }
    if (fileType?.includes('image')) {
      return (
        <svg className="w-12 h-12 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M21 19V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2zM8.5 13.5l2.5 3 3.5-4.5 4.5 6H5l3.5-4.5z" />
        </svg>
      )
    }
    return (
      <svg className="w-12 h-12 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" />
        <path d="M14 2v6h6" />
      </svg>
    )
  }

  const downloadDocument = async (fileUrl, fileName) => {
    try {
      const response = await fetch(fileUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Error downloading document:', err)
      setError('Failed to download document')
    }
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A'
    const kb = bytes / 1024
    const mb = kb / 1024
    if (mb >= 1) return `${mb.toFixed(2)} MB`
    return `${kb.toFixed(2)} KB`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading documents...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Documents</h1>
          <p className="text-gray-600">Manage your policy documents</p>
        </div>
        <button
          onClick={() => router.push('/policies')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
          </svg>
          Back to Policies
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}

      {/* Documents Grid */}
      {documents.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No documents yet</h3>
          <p className="text-gray-600">Documents will appear here once uploaded</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <div key={doc.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  {getFileIcon(doc.file_type)}
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    doc.is_verified 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {doc.is_verified ? 'Verified' : 'Pending'}
                  </span>
                </div>
                
                <h3 className="font-semibold text-gray-900 mb-3 truncate" title={doc.file_name}>
                  {doc.file_name}
                </h3>
                
                <div className="space-y-2 mb-4 pb-4 border-b border-gray-100">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Policy:</span> {doc.policies?.policy_number || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Client:</span> {doc.policies?.clients?.name || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Size:</span> {formatFileSize(doc.file_size)}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Uploaded:</span> {new Date(doc.uploaded_at).toLocaleDateString()}
                  </p>
                </div>

                {doc.file_url && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => window.open(doc.file_url, '_blank')}
                      className="flex-1 px-3 py-2 bg-indigo-600 text-white text-sm text-center rounded-lg hover:bg-indigo-700 font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View
                    </button>
                    <button
                      onClick={() => downloadDocument(doc.file_url, doc.file_name)}
                      className="flex-1 px-3 py-2 bg-green-600 text-white text-sm text-center rounded-lg hover:bg-green-700 font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
