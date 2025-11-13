'use client'

import { useState } from 'react'
import { UploadIcon, DocumentationIcon, LinkIcon, CopyIcon, CheckIcon, ArrowIcon } from '@/components/Icons'

export default function Home() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 2000)
    })
  }

  const claudeDesktopConfig = JSON.stringify({
    "lbd-style-guide": {
      "command": "curl",
      "args": ["-X", "POST", "http://localhost:3010/api/twin/mcp", "-H", "Content-Type: application/json"]
    }
  }, null, 2)

  const claudeCodeConfig = JSON.stringify({
    "lbd-style-guide": {
      "command": "curl",
      "args": ["-X", "POST", "http://localhost:3010/api/twin/mcp", "-H", "Content-Type: application/json"]
    }
  }, null, 2)

  const cursorConfig = JSON.stringify({
    "lbd-style-guide": {
      "command": "curl",
      "args": ["-X", "POST", "http://localhost:3010/api/twin/mcp", "-H", "Content-Type: application/json"]
    }
  }, null, 2)

  const notionConfig = "MCP Server: lbd-style-guide\nEndpoint: http://localhost:3010/api/twin/mcp\nMethod: POST\nHeaders: Content-Type: application/json"

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-800/50 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span className="text-purple-400 text-sm font-semibold uppercase tracking-wider">Digital Twin</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">LBD Style Guide Service</h1>
          <p className="text-lg text-slate-300 max-w-2xl">
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
                  <h2 className="text-xl font-bold text-white mb-2">Upload Samples</h2>
                  <p className="text-slate-400">
                    Add text, audio, video, and image samples to build your style guide.
                  </p>
                </div>
                <UploadIcon className="w-8 h-8 text-slate-400" />
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
                  <h2 className="text-xl font-bold text-white mb-2">API Documentation</h2>
                  <p className="text-slate-400">
                    Query the style guide via REST API endpoints.
                  </p>
                </div>
                <DocumentationIcon className="w-8 h-8 text-slate-400" />
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
                  <h2 className="text-xl font-bold text-white mb-2">MCP Integration</h2>
                  <p className="text-slate-400">
                    Connect this service as a Model Context Protocol (MCP) server in your favorite tools.
                  </p>
                </div>
                <LinkIcon className="w-8 h-8 text-slate-400" />
              </div>

              {/* Integration Instructions */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  {/* Claude Desktop */}
                  <button
                    onClick={() => copyToClipboard(claudeDesktopConfig, 0)}
                    className="bg-slate-900/50 border border-slate-700 hover:border-green-500 rounded p-4 text-left transition group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-semibold text-green-400">Claude Desktop</p>
                      {copiedIndex === 0 ? (
                        <CheckIcon className="w-5 h-5 text-green-400 group-hover:scale-110 transition" />
                      ) : (
                        <CopyIcon className="w-5 h-5 text-slate-400 group-hover:scale-110 group-hover:text-slate-300 transition" />
                      )}
                    </div>
                    <p className="text-slate-400 text-xs mb-2">Copy config for <code className="text-slate-300 bg-slate-950 px-1 rounded">claude_desktop_config.json</code></p>
                    <code className="block bg-slate-950 p-2 rounded text-xs text-slate-300 overflow-auto max-h-24">
                      {claudeDesktopConfig}
                    </code>
                  </button>

                  {/* Claude Code */}
                  <button
                    onClick={() => copyToClipboard(claudeCodeConfig, 1)}
                    className="bg-slate-900/50 border border-slate-700 hover:border-green-500 rounded p-4 text-left transition group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-semibold text-green-400">Claude Code</p>
                      {copiedIndex === 1 ? (
                        <CheckIcon className="w-5 h-5 text-green-400 group-hover:scale-110 transition" />
                      ) : (
                        <CopyIcon className="w-5 h-5 text-slate-400 group-hover:scale-110 group-hover:text-slate-300 transition" />
                      )}
                    </div>
                    <p className="text-slate-400 text-xs mb-2">Copy config for workspace settings</p>
                    <code className="block bg-slate-950 p-2 rounded text-xs text-slate-300 overflow-auto max-h-24">
                      {claudeCodeConfig}
                    </code>
                  </button>

                  {/* Cursor */}
                  <button
                    onClick={() => copyToClipboard(cursorConfig, 2)}
                    className="bg-slate-900/50 border border-slate-700 hover:border-green-500 rounded p-4 text-left transition group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-semibold text-green-400">Cursor</p>
                      {copiedIndex === 2 ? (
                        <CheckIcon className="w-5 h-5 text-green-400 group-hover:scale-110 transition" />
                      ) : (
                        <CopyIcon className="w-5 h-5 text-slate-400 group-hover:scale-110 group-hover:text-slate-300 transition" />
                      )}
                    </div>
                    <p className="text-slate-400 text-xs mb-2">Copy config for Settings → Features → MCP</p>
                    <code className="block bg-slate-950 p-2 rounded text-xs text-slate-300 overflow-auto max-h-24">
                      {cursorConfig}
                    </code>
                  </button>

                  {/* Notion AI */}
                  <button
                    onClick={() => copyToClipboard(notionConfig, 3)}
                    className="bg-slate-900/50 border border-slate-700 hover:border-green-500 rounded p-4 text-left transition group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-semibold text-green-400">Notion AI</p>
                      {copiedIndex === 3 ? (
                        <CheckIcon className="w-5 h-5 text-green-400 group-hover:scale-110 transition" />
                      ) : (
                        <CopyIcon className="w-5 h-5 text-slate-400 group-hover:scale-110 group-hover:text-slate-300 transition" />
                      )}
                    </div>
                    <p className="text-slate-400 text-xs mb-2">Copy config for custom AI tools</p>
                    <code className="block bg-slate-950 p-2 rounded text-xs text-slate-300 overflow-auto max-h-24">
                      {notionConfig}
                    </code>
                  </button>
                </div>

                <a
                  href="/README.md"
                  className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition"
                >
                  View Full Setup Guide
                  <span>→</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Status */}
        <div className="mt-16 pt-8 border-t border-slate-700 flex items-center justify-between">
          <p className="text-slate-500 text-sm">
            LBD Style Guide Service v1.0
          </p>
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            Service Status: Operational
          </div>
        </div>
      </div>
    </main>
  )
}
