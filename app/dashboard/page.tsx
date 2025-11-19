'use client'

import { useState, useEffect } from 'react'

interface Sample {
  id: string
  type: string
  url: string
  tags: string[]
  modes: string[]
  context?: string
  created_at: string
}

interface Profile {
  id: string
  name: string
  persona_tags: string[]
  default_tone: string
  default_length: number
  created_at: string
  updated_at: string
}

const CONTENT_MODES = [
  'Personal Blog',
  'Work Blog',
  'LinkedIn',
  'Twitter',
  'Email',
  'Public Speaking',
  'Interview',
  'Code Comments',
]

export default function Dashboard() {
  const [file, setFile] = useState<File | null>(null)
  const [sampleType, setSampleType] = useState<'text' | 'audio' | 'video' | 'image'>('text')
  const [content, setContent] = useState('')
  const [context, setContext] = useState('')
  const [tags, setTags] = useState('')
  const [modes, setModes] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [samples, setSamples] = useState<Sample[]>([])
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loadingSamples, setLoadingSamples] = useState(false)
  const [activeTab, setActiveTab] = useState<'upload' | 'samples' | 'profile'>('upload')

  // Edit state
  const [editingSampleId, setEditingSampleId] = useState<string | null>(null)
  const [editingContext, setEditingContext] = useState('')
  const [editingTags, setEditingTags] = useState('')
  const [editingModes, setEditingModes] = useState<string[]>([])
  const [editingProfile, setEditingProfile] = useState(false)
  const [editingProfileData, setEditingProfileData] = useState<Partial<Profile> | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  // Fetch profile and samples on mount
  useEffect(() => {
    fetchProfile()
    fetchSamples()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/twin/profile', {
        headers: {
          'x-api-key': process.env.NEXT_PUBLIC_API_KEY || '',
        },
      })
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err)
    }
  }

  const fetchSamples = async () => {
    setLoadingSamples(true)
    try {
      const response = await fetch('/api/twin/samples?limit=50', {
        headers: {
          'x-api-key': process.env.NEXT_PUBLIC_API_KEY || '',
        },
      })
      if (response.ok) {
        const data = await response.json()
        setSamples(data.samples || [])
      }
    } catch (err) {
      console.error('Failed to fetch samples:', err)
    } finally {
      setLoadingSamples(false)
    }
  }

  const handleModeToggle = (mode: string) => {
    setModes(prev =>
      prev.includes(mode)
        ? prev.filter(m => m !== mode)
        : [...prev, mode]
    )
  }

  const startEditingSample = (sample: Sample) => {
    setEditingSampleId(sample.id)
    setEditingContext(sample.context || '')
    setEditingTags(sample.tags.join(', '))
    setEditingModes([...sample.modes])
  }

  const saveEditingSample = async () => {
    if (!editingSampleId) return
    try {
      const response = await fetch(`/api/twin/samples/${editingSampleId}`, {
        method: 'PATCH',
        headers: {
          'x-api-key': process.env.NEXT_PUBLIC_API_KEY || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          context: editingContext,
          tags: editingTags.split(',').map(t => t.trim()).filter(t => t),
          modes: editingModes,
        }),
      })

      if (response.ok) {
        fetchSamples()
        setEditingSampleId(null)
      } else {
        const data = await response.json()
        alert('Error updating sample: ' + (data.error || 'Unknown error'))
      }
    } catch (err) {
      alert('Error updating sample: ' + (err instanceof Error ? err.message : 'Unknown error'))
    }
  }

  const deleteSample = async (id: string) => {
    if (!confirm('Are you sure you want to delete this sample?')) return

    setDeleting(id)
    try {
      const response = await fetch(`/api/twin/samples/${id}`, {
        method: 'DELETE',
        headers: {
          'x-api-key': process.env.NEXT_PUBLIC_API_KEY || '',
        },
      })

      if (response.ok) {
        fetchSamples()
      } else {
        const data = await response.json()
        alert('Error deleting sample: ' + (data.error || 'Unknown error'))
      }
    } catch (err) {
      alert('Error deleting sample: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setDeleting(null)
    }
  }

  const startEditingProfile = () => {
    if (profile) {
      setEditingProfileData({ ...profile })
      setEditingProfile(true)
    }
  }

  const saveEditingProfile = async () => {
    if (!editingProfileData) return
    try {
      const response = await fetch('/api/twin/profile', {
        method: 'PATCH',
        headers: {
          'x-api-key': process.env.NEXT_PUBLIC_API_KEY || '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          persona_tags: editingProfileData.persona_tags,
          default_tone: editingProfileData.default_tone,
          default_length: editingProfileData.default_length,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data)
        setEditingProfile(false)
        setEditingProfileData(null)
      } else {
        const data = await response.json()
        alert('Error updating profile: ' + (data.error || 'Unknown error'))
      }
    } catch (err) {
      alert('Error updating profile: ' + (err instanceof Error ? err.message : 'Unknown error'))
    }
  }

  const handleEditingModeToggle = (mode: string) => {
    setEditingModes(prev =>
      prev.includes(mode)
        ? prev.filter(m => m !== mode)
        : [...prev, mode]
    )
  }

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
      formData.append('modes', JSON.stringify(modes))

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
      setModes([])
      setFile(null)

      // Refresh samples list
      fetchSamples()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Style Guide Dashboard</h1>
          <p className="text-gray-600">Manage your style guide samples and profile</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2 font-semibold transition ${
              activeTab === 'upload'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Upload Sample
          </button>
          <button
            onClick={() => setActiveTab('samples')}
            className={`px-4 py-2 font-semibold transition ${
              activeTab === 'samples'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Samples ({samples.length})
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 font-semibold transition ${
              activeTab === 'profile'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Profile
          </button>
        </div>

        {/* Upload Tab */}
        {activeTab === 'upload' && (
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
                {file && <p className="text-sm text-gray-600 mt-2">Selected: {file.name}</p>}
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

            {/* Content Modes */}
            <div className="mb-6">
              <label className="block text-lg font-semibold mb-3">Content Modes</label>
              <div className="grid grid-cols-2 gap-2">
                {CONTENT_MODES.map(mode => (
                  <label key={mode} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={modes.includes(mode)}
                      onChange={() => handleModeToggle(mode)}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <span className="text-sm">{mode}</span>
                  </label>
                ))}
              </div>
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
        )}

        {/* Samples Tab */}
        {activeTab === 'samples' && (
          <div className="bg-white rounded-lg shadow-md p-8">
            {loadingSamples ? (
              <div className="text-center py-8 text-gray-500">Loading samples...</div>
            ) : samples.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No samples uploaded yet</div>
            ) : (
              <div className="space-y-4">
                {samples.map(sample => (
                  editingSampleId === sample.id ? (
                    // Edit mode
                    <div key={sample.id} className="border-2 border-blue-300 rounded-lg p-4 bg-blue-50">
                      <h3 className="font-semibold mb-4">Editing {sample.type.toUpperCase()} Sample</h3>
                      <div className="mb-4">
                        <label className="block text-sm font-semibold mb-2">Context</label>
                        <textarea
                          value={editingContext}
                          onChange={(e) => setEditingContext(e.target.value)}
                          className="w-full border rounded p-2 text-sm h-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-semibold mb-2">Tags (comma-separated)</label>
                        <input
                          type="text"
                          value={editingTags}
                          onChange={(e) => setEditingTags(e.target.value)}
                          className="w-full border rounded p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-semibold mb-2">Modes</label>
                        <div className="grid grid-cols-2 gap-2">
                          {CONTENT_MODES.map(mode => (
                            <label key={mode} className="flex items-center gap-2 cursor-pointer text-sm">
                              <input
                                type="checkbox"
                                checked={editingModes.includes(mode)}
                                onChange={() => handleEditingModeToggle(mode)}
                                className="w-4 h-4 rounded border-gray-300"
                              />
                              <span>{mode}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={saveEditingSample}
                          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingSampleId(null)}
                          className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500 text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    // View mode
                    <div key={sample.id} className="border rounded-lg p-4 hover:bg-gray-50 transition">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-gray-800">
                            {sample.type.toUpperCase()} · {new Date(sample.created_at).toLocaleDateString()}
                          </p>
                          {sample.context && (
                            <p className="text-sm text-gray-600 mt-1">{sample.context}</p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEditingSample(sample)}
                            className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteSample(sample.id)}
                            disabled={deleting === sample.id}
                            className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-400"
                          >
                            {deleting === sample.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </div>
                      {sample.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {sample.tags.map(tag => (
                            <span
                              key={tag}
                              className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      {sample.modes.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {sample.modes.map(mode => (
                            <span
                              key={mode}
                              className="inline-block px-2 py-1 text-xs bg-green-100 text-green-700 rounded"
                            >
                              {mode}
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-gray-400 mt-2">{sample.id}</p>
                    </div>
                  )
                ))}
              </div>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white rounded-lg shadow-md p-8">
            {editingProfile && editingProfileData ? (
              // Edit mode
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Edit Profile</h2>

                <div>
                  <label className="block text-lg font-semibold mb-2">Default Tone</label>
                  <input
                    type="text"
                    value={editingProfileData.default_tone || ''}
                    onChange={(e) => setEditingProfileData({ ...editingProfileData, default_tone: e.target.value })}
                    className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., professional-casual, analytical"
                  />
                </div>

                <div>
                  <label className="block text-lg font-semibold mb-2">Default Length (words)</label>
                  <input
                    type="number"
                    value={editingProfileData.default_length || 0}
                    onChange={(e) => setEditingProfileData({ ...editingProfileData, default_length: parseInt(e.target.value) })}
                    className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-lg font-semibold mb-3">Persona Tags</label>
                  <input
                    type="text"
                    value={editingProfileData.persona_tags?.join(', ') || ''}
                    onChange={(e) => setEditingProfileData({ ...editingProfileData, persona_tags: e.target.value.split(',').map(t => t.trim()).filter(t => t) })}
                    className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., analytical, concise, technical"
                  />
                  <p className="text-sm text-gray-600 mt-2">Enter comma-separated tags</p>
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    onClick={saveEditingProfile}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => {
                      setEditingProfile(false)
                      setEditingProfileData(null)
                    }}
                    className="px-6 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : profile ? (
              // View mode
              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-4">{profile.name}</h2>
                    <div className="grid grid-cols-2 gap-6 mb-6">
                      <div>
                        <p className="text-sm text-gray-600 font-semibold">Default Tone</p>
                        <p className="text-lg text-gray-800">{profile.default_tone}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 font-semibold">Default Length</p>
                        <p className="text-lg text-gray-800">{profile.default_length} words</p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={startEditingProfile}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Edit Profile
                  </button>
                </div>

                {profile.persona_tags.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-600 font-semibold mb-2">Persona Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {profile.persona_tags.map(tag => (
                        <span
                          key={tag}
                          className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Statistics */}
                <div className="pt-6 border-t">
                  <h3 className="text-lg font-semibold mb-4">Sample Statistics</h3>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600">Total Samples</p>
                      <p className="text-2xl font-bold text-blue-700">{samples.length}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600">Text Samples</p>
                      <p className="text-2xl font-bold text-green-700">{samples.filter(s => s.type === 'text').length}</p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600">Audio Samples</p>
                      <p className="text-2xl font-bold text-orange-700">{samples.filter(s => s.type === 'audio').length}</p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600">Media Samples</p>
                      <p className="text-2xl font-bold text-purple-700">{samples.filter(s => s.type === 'video' || s.type === 'image').length}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t text-sm text-gray-500">
                  <p>Created: {new Date(profile.created_at).toLocaleDateString()}</p>
                  <p>Last Updated: {new Date(profile.updated_at).toLocaleDateString()}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">Loading profile...</div>
            )}
          </div>
        )}

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
