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
                href="/api/docs"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
              >
                View API Docs
                <span>→</span>
              </a>
            </div>
          </div>

          {/* MCP Integration */}
          <div className="group relative md:col-span-2">
            <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg opacity-0 group-hover:opacity-10 blur transition"></div>
            <div className="relative bg-slate-800 border border-slate-700 hover:border-green-500 rounded-lg p-8 transition">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">MCP Integration</h2>
                  <p className="text-slate-400">
                    Connect this service as a Model Context Protocol (MCP) server in your favorite tools.
                  </p>
                </div>
                <div className="text-4xl">🔗</div>
              </div>

              {/* Integration Instructions */}
              <div className="space-y-4">
                <div className="bg-slate-900/50 border border-slate-700 rounded p-4">
                  <h3 className="text-sm font-semibold text-white mb-2">Server Configuration</h3>
                  <p className="text-sm text-slate-300 mb-2">Add this MCP configuration to your tool:</p>
                  <code className="block bg-slate-950 p-2 rounded text-xs text-slate-300 overflow-auto">
                    {JSON.stringify({
                      "lbd-style-guide": {
                        "command": "curl",
                        "args": [
                          "-X", "POST",
                          "http://localhost:3010/api/twin/mcp",
                          "-H", "Content-Type: application/json"
                        ]
                      }
                    }, null, 2)}
                  </code>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div className="bg-slate-900/50 border border-slate-700 rounded p-3">
                    <p className="font-semibold text-green-400 mb-1">Claude Desktop</p>
                    <p className="text-slate-400">Add to <code className="text-slate-300 bg-slate-950 px-1 rounded">claude_desktop_config.json</code></p>
                  </div>
                  <div className="bg-slate-900/50 border border-slate-700 rounded p-3">
                    <p className="font-semibold text-green-400 mb-1">Claude Code</p>
                    <p className="text-slate-400">Configure MCP servers in your workspace settings</p>
                  </div>
                  <div className="bg-slate-900/50 border border-slate-700 rounded p-3">
                    <p className="font-semibold text-green-400 mb-1">Cursor</p>
                    <p className="text-slate-400">Use Cursor Settings → Features → MCP to add this server</p>
                  </div>
                  <div className="bg-slate-900/50 border border-slate-700 rounded p-3">
                    <p className="font-semibold text-green-400 mb-1">Notion AI</p>
                    <p className="text-slate-400">Configure custom AI tools in Notion workspace settings</p>
                  </div>
                </div>

                <a
                  href="/mcp-setup"
                  className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition"
                >
                  View Full Setup Guide
                  <span>→</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-16 pt-8 border-t border-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Learn More</h3>
              <ul className="space-y-2 text-slate-400">
                <li><a href="/README.md" className="hover:text-slate-200 transition">Documentation</a></li>
                <li><a href="https://github.com/lucasdickey/lbd-style-guide-service" className="hover:text-slate-200 transition">GitHub</a></li>
                <li><a href="/PLAN.md" className="hover:text-slate-200 transition">Architecture</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Built With</h3>
              <ul className="space-y-2 text-slate-400">
                <li>Next.js 16</li>
                <li>PostgreSQL + pgvector</li>
                <li>AWS (S3, RDS)</li>
                <li>OpenAI Embeddings</li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Capabilities</h3>
              <ul className="space-y-2 text-slate-400">
                <li>Semantic Search</li>
                <li>Multimodal Samples</li>
                <li>Style Analysis</li>
                <li>MCP Protocol</li>
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
