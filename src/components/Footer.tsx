"use client";
import Link from "next/link";

export default function Footer() {
  return (
    <footer style={{
      borderTop: "1px solid rgba(255,255,255,0.06)",
      padding: "48px 24px",
    }}>
      <div style={{
        maxWidth: 1200,
        margin: "0 auto",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 24,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: "#f59e0b", fontSize: 18 }}>⚖</span>
          <span style={{ color: "#fff", fontSize: 15, fontWeight: 600 }}>tribunal</span>
          <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 13, marginLeft: 8 }}>tribunal.dev</span>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 24, alignItems: "center" }}>
          {[
            { label: "GitHub", href: "https://github.com/thebotclub/tribunal.dev" },
            { label: "npm", href: "https://www.npmjs.com/package/tribunal" },
            { label: "PyPI", href: "https://pypi.org/project/tribunal/" },
            { label: "Docs", href: "https://github.com/thebotclub/tribunal.dev/blob/main/tribunal/README.md" },
            { label: "Privacy", href: "https://github.com/thebotclub/tribunal.dev/blob/main/PRIVACY.md" },
          ].map(link => (
            <Link
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.8)")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.4)")}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.25)" }}>
          Built by{" "}
          <a
            href="https://github.com/thebotclub"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }}
          >
            thebotclub
          </a>
        </p>
      </div>
    </footer>
  );
}
