export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">LBD Style Guide Service</h1>
        <p className="text-lg text-gray-700 mb-8">
          A digital twin server endpoint for accessing stylistic patterns and tone descriptors.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-2">Upload Samples</h2>
            <p className="text-gray-600 mb-4">
              Add text, audio, video, and image samples to build your style guide.
            </p>
            <a href="/dashboard" className="text-blue-600 hover:underline">
              Go to Dashboard →
            </a>
          </div>

          <div className="border rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-2">API Documentation</h2>
            <p className="text-gray-600 mb-4">
              Query the style guide via REST API endpoints.
            </p>
            <a href="/api" className="text-blue-600 hover:underline">
              View API Docs →
            </a>
          </div>

          <div className="border rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-2">MCP Integration</h2>
            <p className="text-gray-600 mb-4">
              Access style guide via Model Context Protocol for Claude and other LLMs.
            </p>
            <a href="/.well-known/ai-plugin.json" className="text-blue-600 hover:underline">
              View MCP Manifest →
            </a>
          </div>

          <div className="border rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-2">Health Check</h2>
            <p className="text-gray-600 mb-4">
              Verify API connectivity and status.
            </p>
            <a href="/api/health" className="text-blue-600 hover:underline">
              Check Status →
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}
