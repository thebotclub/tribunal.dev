"use client";

const features = [
  {
    icon: "🔐",
    title: "Secret Scanning",
    body: "14 regex patterns detect AWS keys, GitHub tokens, private keys, database URLs, JWTs, and more. Supports .secretsignore for project-specific exclusions.",
  },
  {
    icon: "🧪",
    title: "TDD Enforcement",
    body: "Checks that every source file has a corresponding test file. Supports Python, TypeScript, and Go with dependency graph analysis.",
  },
  {
    icon: "🐍",
    title: "Python Linting",
    body: "Integrates ruff, basedpyright, and mypy. Reports lint errors and type issues as structured findings with line numbers.",
  },
  {
    icon: "📘",
    title: "TypeScript Checks",
    body: "Runs eslint and tsc for TypeScript and JavaScript files. Finds project-local tools in node_modules automatically.",
  },
  {
    icon: "🔷",
    title: "Go Analysis",
    body: "Runs go vet and golangci-lint. Catches issues before they reach production with structured error reporting.",
  },
  {
    icon: "📊",
    title: "SARIF Output",
    body: "Full SARIF 2.1.0 support — upload results to GitHub Code Scanning, VS Code SARIF Viewer, or any compatible tool.",
  },
  {
    icon: "⚡",
    title: "GitHub Action",
    body: "Drop-in composite action with automatic SARIF upload. One YAML file to add quality gates to any pull request.",
  },
  {
    icon: "🪝",
    title: "pre-commit Hook",
    body: "Native pre-commit support with two hooks: full quality scan and secrets-only mode. Catches issues before they enter git.",
  },
  {
    icon: "📋",
    title: "Audit Trail",
    body: "JSONL audit logging with automatic rotation. Every tool call, every verdict — full traceability for compliance.",
  },
  {
    icon: "📦",
    title: "Rule Packs",
    body: "Pre-built packs: SOC 2, Startup, Enterprise, Security. Install with one command, merge with existing project rules.",
  },
  {
    icon: "🛡️",
    title: "Fail-Closed Gate",
    body: "Blocks on errors by default — never fails silently. Atomic I/O with file locking prevents concurrent session corruption.",
  },
  {
    icon: "🤖",
    title: "Agent Agnostic",
    body: "Works with any AI coding agent — Claude Code, Copilot, Cursor, Aider, or custom tools. Not locked to any provider.",
  },
];

export default function Features() {
  return (
    <section id="features" style={{ padding: "100px 24px", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 64 }}>
        <p style={{ color: "#f59e0b", fontSize: 13, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>
          Why Tribunal
        </p>
        <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 700, letterSpacing: "-0.02em", color: "#fff" }}>
          Everything you need to ship safe AI code
        </h2>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: 1,
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 12,
        overflow: "hidden",
      }}>
        {features.map((f, i) => (
          <div
            key={i}
            style={{
              padding: "32px",
              backgroundColor: "rgba(255,255,255,0.02)",
              borderRight: (i + 1) % 4 !== 0 ? "1px solid rgba(255,255,255,0.07)" : "none",
              borderBottom: i < 4 ? "1px solid rgba(255,255,255,0.07)" : "none",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.04)")}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.02)")}
          >
            <div style={{ fontSize: 28, marginBottom: 16 }}>{f.icon}</div>
            <h3 style={{ fontSize: 18, fontWeight: 600, color: "#fff", marginBottom: 8 }}>{f.title}</h3>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>{f.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
