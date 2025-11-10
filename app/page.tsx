export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-800/50 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span className="text-purple-400 text-sm font-semibold uppercase tracking-wider">Digital Twin</span>
          </div>
          <h1 className="text-5xl font-bold text-white mb-3">LBD Style Guide Service</h1>
          <p className="text-xl text-slate-300 max-w-2xl">
            A digital twin server endpoint for accessing stylistic patterns and tone descriptors via REST API and MCP.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-16">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-purple-400 mb-1">5</div>
            <div className="text-slate-400 text-sm">API Endpoints</div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-blue-400 mb-1">4</div>
            <div className="text-slate-400 text-sm">Sample Types</div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-green-400 mb-1">∞</div>
            <div className="text-slate-400 text-sm">Scalability</div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-pink-400 mb-1">MCP</div>
            <div className="text-slate-400 text-sm">Integrated</div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Upload Samples */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg opacity-0 group-hover:opacity-10 blur transition"></div>
            <div className="relative bg-slate-800 border border-slate-700 hover:border-purple-500 rounded-lg p-8 transition">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Upload Samples</h2>
                  <p className="text-slate-400">
                    Add text, audio, video, and image samples to build your style guide.
                  </p>
                </div>
                <div className="text-4xl">📤</div>
              </div>
              <a
                href="/dashboard"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition"
              >
                Go to Dashboard
                <span>→</span>
              </a>
            </div>
          </div>

          {/* API Documentation */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg opacity-0 group-hover:opacity-10 blur transition"></div>
            <div className="relative bg-slate-800 border border-slate-700 hover:border-blue-500 rounded-lg p-8 transition">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">API Documentation</h2>
                  <p className="text-slate-400">
                    Query the style guide via REST API endpoints.
                  </p>
                </div>
                <div className="text-4xl">📚</div>
              </div>
              <a
                href="/api/health"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
              >
                View API Docs
                <span>→</span>
              </a>
            </div>
          </div>

          {/* MCP Integration */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg opacity-0 group-hover:opacity-10 blur transition"></div>
            <div className="relative bg-slate-800 border border-slate-700 hover:border-green-500 rounded-lg p-8 transition">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">MCP Integration</h2>
                  <p className="text-slate-400">
                    Access style guide via Model Context Protocol for Claude and other LLMs.
                  </p>
                </div>
                <div className="text-4xl">🔗</div>
              </div>
              <a
                href="/.well-known/ai-plugin.json"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition"
              >
                View MCP Manifest
                <span>→</span>
              </a>
            </div>
          </div>

          {/* Health Check */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg opacity-0 group-hover:opacity-10 blur transition"></div>
            <div className="relative bg-slate-800 border border-slate-700 hover:border-orange-500 rounded-lg p-8 transition">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Health Check</h2>
                  <p className="text-slate-400">
                    Verify API connectivity and status.
                  </p>
                </div>
                <div className="text-4xl">✓</div>
              </div>
              <a
                href="/api/health"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold transition"
              >
                Check Status
                <span>→</span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-16 pt-8 border-t border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Technology</h3>
              <ul className="space-y-2 text-slate-400">
                <li>Next.js 16</li>
                <li>PostgreSQL + pgvector</li>
                <li>AWS S3 & RDS</li>
                <li>OpenAI Embeddings</li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Features</h3>
              <ul className="space-y-2 text-slate-400">
                <li>Semantic Search</li>
                <li>Multimodal Samples</li>
                <li>Style Analysis</li>
                <li>MCP Support</li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Learn More</h3>
              <ul className="space-y-2 text-slate-400">
                <li><a href="/README.md" className="hover:text-slate-200 transition">Documentation</a></li>
                <li><a href="https://github.com/lucasdickey/lbd-style-guide-service" className="hover:text-slate-200 transition">GitHub</a></li>
                <li><a href="/PLAN.md" className="hover:text-slate-200 transition">Architecture</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-slate-700 flex items-center justify-between">
            <p className="text-slate-500 text-sm">
              LBD Style Guide Service v1.0
            </p>
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Service Status: Operational
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
