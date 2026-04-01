"use client";
import { useState, useEffect } from "react";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={copy}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "12px 20px",
        backgroundColor: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 8,
        cursor: "pointer",
        transition: "all 0.2s",
        color: "#fff",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.08)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
      }}
    >
      <span style={{ fontFamily: "monospace", fontSize: 14, color: "rgba(255,255,255,0.9)" }}>{text}</span>
      <span style={{ fontSize: 12, color: copied ? "#f59e0b" : "rgba(255,255,255,0.4)" }}>
        {copied ? "✓ copied" : "copy"}
      </span>
    </button>
  );
}

function GridBackground() {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
      <div style={{
        position: "absolute",
        top: "20%",
        left: "10%",
        width: 400,
        height: 400,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(245,158,11,0.04) 0%, transparent 70%)",
        filter: "blur(60px)",
      }} />
      <div style={{
        position: "absolute",
        bottom: "20%",
        right: "10%",
        width: 300,
        height: 300,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(245,158,11,0.03) 0%, transparent 70%)",
        filter: "blur(60px)",
      }} />
    </div>
  );
}

export default function Hero() {
  const [stars, setStars] = useState<string | null>(null);

  useEffect(() => {
    fetch("https://api.github.com/repos/thebotclub/tribunal")
      .then(r => r.json())
      .then(d => {
        if (d.stargazers_count !== undefined) {
          setStars(d.stargazers_count >= 1000
            ? `${(d.stargazers_count / 1000).toFixed(1)}k`
            : String(d.stargazers_count));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "120px 24px 80px" }}>
      <GridBackground />
      <div style={{ position: "relative", maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
        <a
          href="https://github.com/thebotclub/tribunal"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 14px",
            marginBottom: 32,
            backgroundColor: "rgba(245,158,11,0.1)",
            border: "1px solid rgba(245,158,11,0.2)",
            borderRadius: 20,
            color: "#f59e0b",
            fontSize: 13,
            fontWeight: 500,
            textDecoration: "none",
            transition: "all 0.2s",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.backgroundColor = "rgba(245,158,11,0.15)";
            e.currentTarget.style.borderColor = "rgba(245,158,11,0.35)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.backgroundColor = "rgba(245,158,11,0.1)";
            e.currentTarget.style.borderColor = "rgba(245,158,11,0.2)";
          }}
        >
          <span>★</span>
          <span>{stars !== null ? `${stars} stars on GitHub` : "Star on GitHub"}</span>
          <span style={{ opacity: 0.6 }}>→</span>
        </a>

        <h1 style={{
          fontSize: "clamp(40px, 7vw, 72px)",
          fontWeight: 700,
          letterSpacing: "-0.03em",
          lineHeight: 1.1,
          marginBottom: 24,
          color: "#fff",
        }}>
          Code that passes<br />
          <span style={{ color: "#f59e0b" }}>the tribunal.</span>
        </h1>

        <p style={{
          fontSize: "clamp(16px, 2vw, 20px)",
          lineHeight: 1.6,
          color: "rgba(255,255,255,0.55)",
          maxWidth: 580,
          margin: "0 auto 48px",
        }}>
          Tribunal enforces TDD, quality gates, and your team&apos;s standards on every Claude Code session.
          Nothing ships without passing the gate.
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
          <CopyButton text="pip install tribunal" />
          <CopyButton text="npm install tribunal" />
        </div>

        <p style={{ marginTop: 24, fontSize: 13, color: "rgba(255,255,255,0.25)" }}>
          Python CLI + Claude Code plugin · Open source · MIT License
        </p>
      </div>
    </section>
  );
}
