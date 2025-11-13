'use client'

import { useState } from 'react'

export default function Dashboard() {
  const [file, setFile] = useState<File | null>(null)
  const [sampleType, setSampleType] = useState<'text' | 'audio' | 'video' | 'image'>('text')
  const [content, setContent] = useState('')
  const [context, setContext] = useState('')
  const [tags, setTags] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setError('')

    try {
      const formData = new FormData()
      formData.append('type', sampleType)
      formData.append('context', context)
      formData.append('tags', JSON.stringify(tags.split(',').map(t => t.trim()).filter(t => t)))

      if (sampleType === 'text') {
        formData.append('content', content)
      } else if (file) {
        formData.append('file', file)
      }

      const response = await fetch('/api/twin/upload', {
        method: 'POST',
        headers: {
          'x-api-key': process.env.NEXT_PUBLIC_API_KEY || '',
        },
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Upload failed')
        return
      }

      setMessage(`Sample uploaded successfully! ID: ${data.id}`)
      setContent('')
      setContext('')
      setTags('')
      setFile(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Upload Sample</h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8">
          {/* Sample Type */}
          <div className="mb-6">
            <label className="block text-lg font-semibold mb-2">Sample Type</label>
            <select
              value={sampleType}
              onChange={(e) => setSampleType(e.target.value as any)}
              className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="text">Text</option>
              <option value="audio">Audio</option>
              <option value="video">Video</option>
              <option value="image">Image</option>
            </select>
          </div>

          {/* Text Content */}
          {sampleType === 'text' && (
            <div className="mb-6">
              <label className="block text-lg font-semibold mb-2">Content</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste your text content here..."
                className="w-full border rounded-lg p-2 h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          )}

          {/* File Upload */}
          {sampleType !== 'text' && (
            <div className="mb-6">
              <label className="block text-lg font-semibold mb-2">Upload File</label>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          )}

          {/* Context */}
          <div className="mb-6">
            <label className="block text-lg font-semibold mb-2">Context (Optional)</label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Describe the origin or context of this sample..."
              className="w-full border rounded-lg p-2 h-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Tags */}
          <div className="mb-6">
            <label className="block text-lg font-semibold mb-2">Tags (comma-separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g., technology, ai, analysis"
              className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Success Message */}
          {message && (
            <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
              {message}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
          >
            {loading ? 'Uploading...' : 'Upload Sample'}
          </button>
        </form>

        {/* Back Link */}
        <div className="mt-8">
          <a href="/" className="text-blue-600 hover:underline">
            ← Back to Home
          </a>
        </div>
      </div>
    </main>
  )
}
