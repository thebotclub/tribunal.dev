"use client";

const essentialTraffic = [
  { dest: "api.anthropic.com", purpose: "Claude API (prompts & responses)", removable: false },
  { dest: "api.anthropic.com", purpose: "OAuth authentication", removable: false },
];

const optionalTraffic = [
  { dest: "api.anthropic.com/event_logging", purpose: "Anonymized usage events", removable: true },
  { dest: "datadoghq.com", purpose: "Operational metrics (no code/prompts)", removable: true },
  { dest: "GrowthBook SDK", purpose: "Feature flags & experiments", removable: true },
  { dest: "Various", purpose: "Auto-updates, settings sync, model metadata", removable: true },
];

export default function PrivacySection() {
  return (
    <section id="privacy" style={{ padding: "100px 24px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <p style={{ color: "#f59e0b", fontSize: 13, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>
            Privacy & Transparency
          </p>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 700, letterSpacing: "-0.02em", color: "#fff", marginBottom: 16 }}>
            No hidden phone-homes.
          </h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", maxWidth: 600, margin: "0 auto" }}>
            Tribunal itself sends <strong style={{ color: "rgba(255,255,255,0.8)" }}>zero telemetry</strong>. 
            All network traffic comes from Anthropic&apos;s Claude Code CLI — and you can disable the optional parts with one variable.
          </p>
        </div>

        {/* Disable banner */}
        <div style={{
          backgroundColor: "rgba(245,158,11,0.06)",
          border: "1px solid rgba(245,158,11,0.15)",
          borderRadius: 12,
          padding: "24px 28px",
          marginBottom: 40,
        }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
            <span style={{ fontSize: 24, flexShrink: 0 }}>🔒</span>
            <div>
              <p style={{ fontSize: 15, fontWeight: 600, color: "#fff", marginBottom: 8 }}>
                Disable all non-essential traffic
              </p>
              <code style={{
                display: "inline-block",
                padding: "8px 16px",
                backgroundColor: "#0d0d0d",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 6,
                fontFamily: "monospace",
                fontSize: 13,
                color: "#f59e0b",
              }}>
                export CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1
              </code>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 8 }}>
                Add to your shell profile. Only essential API calls to Claude remain.
              </p>
            </div>
          </div>
        </div>

        {/* Traffic tables */}
        <div style={{ display: "grid", gap: 32 }}>
          {/* Essential */}
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: "#fff", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#27c93f", display: "inline-block" }} />
              Essential (required for Claude to work)
            </h3>
            <div style={{
              backgroundColor: "#0d0d0d",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 8,
              overflow: "hidden",
            }}>
              {essentialTraffic.map((item, i) => (
                <div key={i} style={{
                  padding: "14px 20px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom: i < essentialTraffic.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                }}>
                  <div>
                    <span style={{ fontFamily: "monospace", fontSize: 13, color: "rgba(255,255,255,0.7)" }}>{item.dest}</span>
                    <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, marginLeft: 12 }}>— {item.purpose}</span>
                  </div>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", whiteSpace: "nowrap" }}>cannot disable</span>
                </div>
              ))}
            </div>
          </div>

          {/* Optional */}
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: "#fff", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#f59e0b", display: "inline-block" }} />
              Optional (disabled with env var above)
            </h3>
            <div style={{
              backgroundColor: "#0d0d0d",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 8,
              overflow: "hidden",
            }}>
              {optionalTraffic.map((item, i) => (
                <div key={i} style={{
                  padding: "14px 20px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom: i < optionalTraffic.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                }}>
                  <div>
                    <span style={{ fontFamily: "monospace", fontSize: 13, color: "rgba(255,255,255,0.7)" }}>{item.dest}</span>
                    <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, marginLeft: 12 }}>— {item.purpose}</span>
                  </div>
                  <span style={{
                    fontSize: 11,
                    padding: "2px 8px",
                    borderRadius: 4,
                    backgroundColor: "rgba(245,158,11,0.1)",
                    color: "#f59e0b",
                    whiteSpace: "nowrap",
                  }}>disableable</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tribunal itself */}
          <div style={{
            padding: "20px 24px",
            backgroundColor: "rgba(39,201,63,0.04)",
            border: "1px solid rgba(39,201,63,0.12)",
            borderRadius: 8,
          }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: "#fff", marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: "#27c93f", display: "inline-block" }} />
              Tribunal&apos;s own network usage: none
            </h3>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>
              Tribunal operates entirely locally. No phone-home, no telemetry, no analytics, no update checks. 
              Everything flagged by security scanners originates from Anthropic&apos;s upstream Claude Code CLI — 
              the same code that runs when you install <code style={{ color: "rgba(255,255,255,0.6)" }}>@anthropic-ai/claude-code</code> from npm.
            </p>
          </div>
        </div>

        <p style={{ textAlign: "center", marginTop: 40, fontSize: 13, color: "rgba(255,255,255,0.3)" }}>
          Full details in{" "}
          <a
            href="https://github.com/thebotclub/tribunal/blob/main/PRIVACY.md"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#f59e0b", textDecoration: "none" }}
          >
            PRIVACY.md
          </a>
        </p>
      </div>
    </section>
  );
}
