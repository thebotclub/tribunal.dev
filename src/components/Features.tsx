"use client";

const features = [
  {
    icon: "🧪",
    title: "TDD Enforced",
    body: "Blocks production code without a failing test first. Supports Python and TypeScript out of the box.",
  },
  {
    icon: "🛡️",
    title: "Quality Gates",
    body: "Every file write runs secret detection, type checking, and linting. Custom shell commands as gates.",
  },
  {
    icon: "📋",
    title: "Review Agents",
    body: "4 parallel review agents — TDD, security, quality, spec — analyze every change before it ships.",
  },
  {
    icon: "💰",
    title: "Cost Governance",
    body: "Per-session and daily budgets, cost analytics with trend detection, anomaly alerts, and model routing.",
  },
  {
    icon: "🧠",
    title: "Memory & MCP",
    body: "Inject rules into Claude's memory system. MCP server exposes 6 tools for multi-agent workflows.",
  },
  {
    icon: "🏢",
    title: "Enterprise Ready",
    body: "Managed fleet policies, air-gapped bundles, audit dashboards, rule marketplace, and team sync.",
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
          Enterprise-grade discipline for Claude Code
        </h2>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
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
              borderRight: (i + 1) % 3 !== 0 ? "1px solid rgba(255,255,255,0.07)" : "none",
              borderBottom: i < 3 ? "1px solid rgba(255,255,255,0.07)" : "none",
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
