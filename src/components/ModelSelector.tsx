"use client";

export default function ModelSelector() {
  return (
    <section style={{ padding: "100px 24px", borderTop: "1px solid rgba(255,255,255,0.06)", backgroundColor: "rgba(255,255,255,0.01)" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <p style={{ color: "#f59e0b", fontSize: 13, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>
            Model Agnostic
          </p>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 700, letterSpacing: "-0.02em", color: "#fff", marginBottom: 16 }}>
            Your model. Your rules.
          </h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.5)", maxWidth: 520, margin: "0 auto" }}>
            Switch between Claude, MiniMax, GLM, or any custom model with a single command. Tribunal adapts.
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
              tribunal — model selection
            </span>
          </div>

          {/* Terminal content */}
          <div style={{ padding: "24px 28px", fontFamily: "monospace", fontSize: 14, lineHeight: 1.8 }}>
            <div>
              <span style={{ color: "#f59e0b" }}>$</span>
              <span style={{ color: "rgba(255,255,255,0.9)", marginLeft: 8 }}>tribunal model list</span>
            </div>
            <br />
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, marginBottom: 4 }}>Built-in Models</div>
            <div style={{ color: "rgba(255,255,255,0.2)", marginBottom: 12 }}>─────────────────────────────</div>
            <div style={{ display: "flex", justifyContent: "space-between", maxWidth: 420 }}>
              <span style={{ color: "#e2e8f0" }}>claude-opus-4-6</span>
              <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>Most capable</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", maxWidth: 420 }}>
              <span style={{ color: "#e2e8f0" }}>
                claude-sonnet-4-6
                <span style={{ marginLeft: 8, fontSize: 11, color: "#f59e0b", backgroundColor: "rgba(245,158,11,0.1)", padding: "1px 6px", borderRadius: 3 }}>← current</span>
              </span>
              <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>Balanced</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", maxWidth: 420 }}>
              <span style={{ color: "#e2e8f0" }}>claude-haiku-4-5</span>
              <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>Fastest</span>
            </div>
            <br />
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, marginBottom: 4 }}>Custom Models</div>
            <div style={{ color: "rgba(255,255,255,0.2)", marginBottom: 12 }}>─────────────────────────────</div>
            <div style={{ color: "#e2e8f0" }}>minimax/MiniMax-Text-01</div>
            <div style={{ color: "#e2e8f0" }}>THUDM/glm-4-9b-chat</div>
            <br />
            <div>
              <span style={{ color: "#f59e0b" }}>$</span>
              <span style={{ color: "rgba(255,255,255,0.9)", marginLeft: 8 }}>tribunal model set claude-opus-4-6</span>
            </div>
            <div style={{ color: "#27c93f", marginTop: 4 }}>✓ Default model set to claude-opus-4-6</div>
          </div>
        </div>
      </div>
    </section>
  );
}
