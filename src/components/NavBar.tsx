"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.08)" : "1px solid transparent",
        backgroundColor: scrolled ? "rgba(10,10,10,0.9)" : "transparent",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        transition: "all 0.3s ease",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <span style={{ color: "#f59e0b", fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em" }}>⚖</span>
          <span style={{ color: "#fff", fontSize: 16, fontWeight: 600, letterSpacing: "-0.02em" }}>tribunal</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <Link href="https://github.com/thebotclub/tribunal" target="_blank" rel="noopener noreferrer"
            style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, textDecoration: "none", transition: "color 0.2s" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
          >
            GitHub
          </Link>
          <Link href="https://pypi.org/project/tribunal/" target="_blank" rel="noopener noreferrer"
            style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, textDecoration: "none", transition: "color 0.2s" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
          >
            PyPI
          </Link>
          <Link href="https://www.npmjs.com/package/tribunal" target="_blank" rel="noopener noreferrer"
            style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, textDecoration: "none", transition: "color 0.2s" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
          >
            npm
          </Link>
          <Link href="https://github.com/thebotclub/tribunal/blob/main/README.md" target="_blank" rel="noopener noreferrer"
            style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, textDecoration: "none", transition: "color 0.2s" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
            onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
          >
            Docs
          </Link>
        </div>
      </div>
    </nav>
  );
}
