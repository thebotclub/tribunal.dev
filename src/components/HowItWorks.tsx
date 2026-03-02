"use client";

const steps = [
  {
    number: "01",
    title: "Install",
    desc: "Drop tribunal into your project in seconds.",
    code: "pip install tribunal && tribunal",
  },
  {
    number: "02",
    title: "Code",
    desc: "Claude Code runs with TDD enforcement and quality hooks active on every session.",
    code: "# Claude Code now has tribunal gates\n# Write tests first, ship quality code",
  },
  {
    number: "03",
    title: "Ship",
    desc: "Nothing leaves without passing the spec review. Every change is audited and approved.",
    code: "✓ Tests pass\n✓ Quality gates clear\n✓ Spec review approved\n→ Ready to ship",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" style={{ padding: "100px 24px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <p style={{ color: "#f59e0b", fontSize: 13, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>
            How It Works
          </p>
          <h2 style={{ fontSize: "clamp(28px, 4vw, 44px)", fontWeight: 700, letterSpacing: "-0.02em", color: "#fff" }}>
            Three steps to disciplined code
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 32 }}>
          {steps.map((step, i) => (
            <div key={i} style={{ position: "relative" }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 20,
              }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#f59e0b", fontFamily: "monospace", letterSpacing: "0.05em" }}>
                  {step.number}
                </span>
                <div style={{ flex: 1, height: 1, backgroundColor: "rgba(255,255,255,0.07)" }} />
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 600, color: "#fff", marginBottom: 12 }}>{step.title}</h3>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, marginBottom: 20 }}>{step.desc}</p>
              <div style={{
                padding: "16px",
                backgroundColor: "#111",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 8,
                fontFamily: "monospace",
                fontSize: 13,
                color: "rgba(255,255,255,0.7)",
                whiteSpace: "pre",
                lineHeight: 1.6,
              }}>
                {step.code}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
