'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery'
import { TableSkeleton, LoadingButton } from '@/components/SkeletonLoader'

export default function DocumentsPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [isNavigating, setIsNavigating] = useState(false)

  // Optimized document fetching with Redis caching
  const { data: documentsData, loading, supabase } = useSupabaseQuery(
    'documents-list',
    async () => {
      const { data, error } = await supabase
        .from('documents')
        .select(`
          id,
          file_name,
          file_url,
          file_size,
          uploaded_at,
          client_id,
          policy_id,
          clients (
            full_name
          ),
          policies (
            policy_number,
            providers (name)
          )
        `)
        .eq('agent_id', (await supabase.auth.getUser()).data.user?.id)
        .order('uploaded_at', { ascending: false })
        .limit(100) // Limit for performance

      if (error) throw error
      return data || []
    },
    {
      staleTime: 60000, // Cache for 1 minute
      useRedis: true,
      redisTTL: 120 // Redis cache for 2 minutes
    }
  )

  const documents = documentsData || []

  const getFileIcon = (fileName) => {
    if (fileName?.toLowerCase().endsWith('.pdf')) {
      return (
        <svg className="w-12 h-12 text-red-600" fill="currentColor" viewBox="0 0 56 64">
          <path d="M5.112 0C2.289 0 0 2.289 0 5.112v53.76C0 61.71 2.289 64 5.112 64h45.76C53.71 64 56 61.71 56 58.88V16.84L39.17 0H5.112z" />
          <path fill="#FFFEFE" d="M39.17 0v16.84H56L39.17 0z" />
          <text x="50%" y="45" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#FFFEFE">PDF</text>
        </svg>
      )
    }
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']
    if (imageExtensions.some(ext => fileName?.toLowerCase().endsWith(ext))) {
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

  const fixBucketUrl = (url) => {
    if (!url) return url

    // Log original URL for debugging
    console.log('Original URL:', url)

    // Fix URLs that point to old 'documents' bucket
    let fixedUrl = url
    if (url.includes('/storage/v1/object/public/documents/')) {
      fixedUrl = url.replace('/storage/v1/object/public/documents/', '/storage/v1/object/public/policy-documents/')
      console.log('Fixed URL:', fixedUrl)
    }

    return fixedUrl
  }

  const downloadDocument = async (fileUrl, fileName) => {
    try {
      // Fix bucket name if needed
      const correctedUrl = fixBucketUrl(fileUrl)

      console.log('Attempting download from:', correctedUrl)

      const response = await fetch(correctedUrl)
      console.log('Response status:', response.status, response.statusText)

      if (!response.ok) {
        // Get more error details
        const errorText = await response.text()
        console.error('Download error details:', errorText)
        throw new Error(`Download failed: ${response.status} ${response.statusText}`)
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      setError('') // Clear any previous errors
    } catch (err) {
      console.error('Error downloading document:', err)
      setError(`Failed to download document: ${err.message}`)
    }
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A'
    const kb = bytes / 1024
    const mb = kb / 1024
    if (mb >= 1) return `${mb.toFixed(2)} MB`
    return `${kb.toFixed(2)} KB`
  }

  const handleUpload = () => {
    setIsNavigating(true)
    router.push('/documents/add')
  }

  const handleViewPolicies = () => {
    setIsNavigating(true)
    router.push('/policies')
  }

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="h-8 bg-gray-300 rounded w-40 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-56 animate-pulse"></div>
          </div>
          <div className="flex gap-3">
            <div className="h-10 bg-gray-300 rounded w-40 animate-pulse"></div>
            <div className="h-10 bg-gray-300 rounded w-36 animate-pulse"></div>
          </div>
        </div>
        <TableSkeleton rows={8} columns={5} />
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
        <div className="flex gap-3">
          <LoadingButton
            onClick={handleUpload}
            loading={isNavigating}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors flex items-center gap-2 disabled:opacity-75"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Upload Document
          </LoadingButton>
          <LoadingButton
            onClick={handleViewPolicies}
            loading={isNavigating}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium transition-colors flex items-center gap-2 disabled:opacity-75"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            View Policies
          </LoadingButton>
        </div>
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
                  {getFileIcon(doc.file_name)}
                </div>

                <h3 className="font-semibold text-gray-900 mb-3 truncate" title={doc.file_name}>
                  {doc.file_name}
                </h3>

                <div className="space-y-2 mb-4 pb-4 border-b border-gray-100">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Policy:</span> {doc.policies?.policy_number || 'N/A'}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Client:</span> {doc.clients?.full_name || 'N/A'}
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
                      onClick={() => window.open(fixBucketUrl(doc.file_url), '_blank')}
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
