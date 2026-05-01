"use client";

export default function ModelSelector() {
  return (
    <section style={{ padding: "100px 24px", borderTop: "1px solid rgba(255,255,255,0.06)", backgroundColor: "rgba(255,255,255,0.01)" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <p style={{ color: "#f59e0b", fontSize: 13, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>
            Multiple Outputs
          </p>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 700, letterSpacing: "-0.02em", color: "#fff", marginBottom: 16 }}>
            Your pipeline. Your format.
          </h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", maxWidth: 520, margin: "0 auto" }}>
            Output results as text, JSON, or SARIF — compatible with GitHub Code Scanning, VS Code, and any CI system.
          </p>
        </div>

        <div style={{
          backgroundColor: "#0d0d0d",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 32px 64px rgba(0,0,0,0.4)",
        }}>
          {/* Terminal title bar */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "12px 16px",
            backgroundColor: "#161616",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
          }}>
            <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#ff5f56" }} />
            <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#ffbd2e" }} />
            <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#27c93f" }} />
            <span style={{ marginLeft: 12, fontSize: 12, color: "rgba(255,255,255,0.3)", fontFamily: "monospace" }}>
              tribunal — output formats
            </span>
          </div>

          {/* Terminal content */}
          <div style={{ padding: "24px 28px", fontFamily: "monospace", fontSize: 14, lineHeight: 1.8 }}>
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, marginBottom: 4 }}>Text output (default)</div>
            <div>
              <span style={{ color: "#f59e0b" }}>$</span>
              <span style={{ color: "rgba(255,255,255,0.9)", marginLeft: 8 }}>tribunal ci src/</span>
            </div>
            <br />
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, marginBottom: 4 }}>SARIF for GitHub Code Scanning</div>
            <div>
              <span style={{ color: "#f59e0b" }}>$</span>
              <span style={{ color: "rgba(255,255,255,0.9)", marginLeft: 8 }}>tribunal ci src/ --format sarif -o results.sarif</span>
            </div>
            <br />
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, marginBottom: 4 }}>JSON for custom integrations</div>
            <div>
              <span style={{ color: "#f59e0b" }}>$</span>
              <span style={{ color: "rgba(255,255,255,0.9)", marginLeft: 8 }}>tribunal ci src/ --format json</span>
            </div>
            <br />
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, marginBottom: 4 }}>Run specific checkers only</div>
            <div>
              <span style={{ color: "#f59e0b" }}>$</span>
              <span style={{ color: "rgba(255,255,255,0.9)", marginLeft: 8 }}>tribunal ci --checkers secrets,tdd</span>
            </div>
            <br />
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, marginBottom: 4 }}>pre-commit hook</div>
            <div style={{ color: "rgba(255,255,255,0.2)", marginBottom: 12 }}>─────────────────────────────</div>
            <div style={{ color: "#e2e8f0" }}>repos:</div>
            <div style={{ color: "#e2e8f0" }}>{"  "}- repo: https://github.com/thebotclub/tribunal.dev</div>
            <div style={{ color: "#e2e8f0" }}>{"    "}rev: v2.0.1</div>
            <div style={{ color: "#e2e8f0" }}>{"    "}hooks:</div>
            <div style={{ color: "#e2e8f0" }}>{"    "}- id: tribunal-ci</div>
            <br />
            <div style={{ color: "#27c93f" }}>✓ Works with any CI system, any AI coding agent</div>
          </div>
        </div>
      </div>
    </section>
  );
}
