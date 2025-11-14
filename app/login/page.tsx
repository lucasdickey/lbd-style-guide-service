'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Cookies from 'js-cookie'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Encode credentials in base64 for Basic Auth
      const credentials = btoa(`${username}:${password}`)

      // Make a request to /dashboard with the Authorization header to trigger middleware validation
      const response = await fetch('/dashboard', {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${credentials}`,
        },
        redirect: 'manual', // Don't follow redirects automatically
      })

      console.log('Login response status:', response.status, 'ok:', response.ok)

      // If we get a 307 or 308, the middleware passed and redirected us
      if (response.status === 307 || response.status === 308 || response.ok) {
        console.log('Login successful, storing credentials and navigating to dashboard')
        // Store credentials in cookie for subsequent requests
        Cookies.set('auth', credentials, {
          path: '/',
          secure: true,
          sameSite: 'strict'
        })
        setLoading(false)
        router.push('/dashboard')
      } else {
        console.log('Login failed with status:', response.status)
        setError('Invalid username or password')
        setLoading(false)
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Dashboard Login</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder:text-gray-500"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder:text-gray-500"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Back Link */}
        <div className="mt-6 text-center">
          <a href="/" className="text-blue-600 hover:underline text-sm">
            ← Back to Home
          </a>
        </div>
      </div>
    </main>
  )
}
