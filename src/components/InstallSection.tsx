"use client";
import { useState } from "react";

const tabs = [
  {
    id: "pip",
    label: "pip",
    code: "pip install tribunal",
  },
  {
    id: "npm",
    label: "npm",
    code: "npm install tribunal",
  },
  {
    id: "manual",
    label: "manual",
    code: "git clone https://github.com/thebotclub/tribunal\ncd tribunal && uv install",
  },
];

export default function InstallSection() {
  const [active, setActive] = useState("pip");
  const [copied, setCopied] = useState(false);

  const current = tabs.find(t => t.id === active)!;

  const copy = async () => {
    await navigator.clipboard.writeText(current.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="install" style={{ padding: "100px 24px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ maxWidth: 700, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <p style={{ color: "#f59e0b", fontSize: 13, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>
            Get Started
          </p>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 700, letterSpacing: "-0.02em", color: "#fff", marginBottom: 12 }}>
            Install in seconds
          </h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.5)" }}>
            Choose your preferred installation method
          </p>
        </div>

        <div style={{
          backgroundColor: "#0d0d0d",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 12,
          overflow: "hidden",
        }}>
          {/* Tabs */}
          <div style={{
            display: "flex",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            backgroundColor: "#111",
          }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActive(tab.id)}
                style={{
                  padding: "12px 20px",
                  fontSize: 13,
                  fontWeight: 500,
                  fontFamily: "monospace",
                  cursor: "pointer",
                  border: "none",
                  backgroundColor: "transparent",
                  color: active === tab.id ? "#f59e0b" : "rgba(255,255,255,0.4)",
                  borderBottom: active === tab.id ? "2px solid #f59e0b" : "2px solid transparent",
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => { if (active !== tab.id) e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
                onMouseLeave={e => { if (active !== tab.id) e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Code block */}
          <div style={{ position: "relative", padding: "24px 28px" }}>
            <pre style={{
              fontFamily: "monospace",
              fontSize: 15,
              color: "rgba(255,255,255,0.9)",
              margin: 0,
              whiteSpace: "pre",
              lineHeight: 1.6,
            }}>
              <span style={{ color: "rgba(255,255,255,0.3)", userSelect: "none" }}>$ </span>
              {current.code}
            </pre>
            <button
              onClick={copy}
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                padding: "6px 12px",
                fontSize: 12,
                backgroundColor: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 6,
                color: copied ? "#f59e0b" : "rgba(255,255,255,0.5)",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.12)"; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.07)"; }}
            >
              {copied ? "✓ copied" : "copy"}
            </button>
          </div>
        </div>

        <p style={{ textAlign: "center", marginTop: 24, fontSize: 13, color: "rgba(255,255,255,0.25)" }}>
          Requires Python 3.10+ or Node.js 18+
        </p>
      </div>
    </section>
  );
}
