import { useState, useEffect, useRef, useMemo, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════════════════════
   CONTROL ROOM — CASE STUDY
   Editorial / Industrial. Outfit + Space Mono. Dark.
   ═══════════════════════════════════════════════════════════════════════════ */

const T = {
  bg: "#0A0A0B",
  bgAlt: "#101012",
  surface: "#141417",
  surfaceAlt: "#1A1A1D",
  surfaceHover: "#1F1F23",
  border: "#27272A",
  borderStrong: "#3F3F46",
  borderSubtle: "#1C1C20",
  text: "#FAFAFA",
  textSec: "#D4D4D8",
  textTer: "#A1A1AA",
  textMute: "#71717A",
  textFaint: "#52525B",
  accent: "#818CF8",
  accentBright: "#A5B4FC",
  accentSoft: "rgba(129,140,248,.12)",
  accentBorder: "rgba(129,140,248,.3)",
  red: "#EF4444",
  redSoft: "rgba(239,68,68,.1)",
  redBorder: "rgba(239,68,68,.25)",
  amber: "#F59E0B",
  amberSoft: "rgba(245,158,11,.1)",
  amberBorder: "rgba(245,158,11,.25)",
  green: "#10B981",
  greenSoft: "rgba(16,185,129,.1)",
  greenBorder: "rgba(16,185,129,.25)",
};

// ═══════════════════════════════════════════════════════════════════════════
// HOOKS
// ═══════════════════════════════════════════════════════════════════════════
function useInView(threshold = 0.15) {
  const ref = useRef();
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, inView];
}

function useScrollProgress() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const total = h.scrollHeight - h.clientHeight;
      setPct(total > 0 ? (h.scrollTop / total) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return pct;
}

function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const onScroll = () => {
      const offset = 200;
      let current = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top - offset <= 0) current = id;
      }
      setActive(current);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [ids]);
  return active;
}

function useCountUp(target, inView, duration = 1500) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start;
    let raf;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setVal(target * ease);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, inView, duration]);
  return val;
}

// ═══════════════════════════════════════════════════════════════════════════
// PROGRESS BAR
// ═══════════════════════════════════════════════════════════════════════════
function ProgressBar() {
  const pct = useScrollProgress();
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, height: 2,
      background: "transparent", zIndex: 100, pointerEvents: "none"
    }}>
      <div style={{
        height: "100%", width: `${pct}%`,
        background: `linear-gradient(90deg, ${T.accent}, ${T.accentBright})`,
        transition: "width .1s linear", boxShadow: `0 0 10px ${T.accent}`
      }} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TOP NAV
// ═══════════════════════════════════════════════════════════════════════════
function TopNav() {
  return (
    <nav style={{
      position: "fixed", top: 14, left: 0, right: 0, zIndex: 90,
      display: "flex", justifyContent: "center", pointerEvents: "none",
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 14,
        padding: "8px 16px",
        background: "rgba(10,10,11,.7)", backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        border: `1px solid ${T.border}`, borderRadius: 999,
        pointerEvents: "auto",
      }}>
        <div style={{
          width: 22, height: 22, borderRadius: 5,
          background: `linear-gradient(135deg, ${T.accent}, #A78BFA)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 11, fontWeight: 700, color: T.bg, fontFamily: "var(--mono)",
        }}>A</div>
        <span style={{ fontSize: 12.5, color: T.text, fontWeight: 600, letterSpacing: "-.1px" }}>
          Abter <span style={{ color: T.textMute, fontWeight: 400 }}>· Product Designer</span>
        </span>
        <div style={{ width: 1, height: 14, background: T.border, margin: "0 4px" }} />
        <a href="#contact" style={{ fontSize: 12, color: T.textTer, textDecoration: "none", fontFamily: "var(--mono)", letterSpacing: ".3px" }}>CONTACT</a>
      </div>
    </nav>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SECTION TAG (eyebrow label)
// ═══════════════════════════════════════════════════════════════════════════
function Eyebrow({ num, children }) {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 12, marginBottom: 24,
      fontSize: 11, fontFamily: "var(--mono)", color: T.textMute,
      letterSpacing: "2.5px", textTransform: "uppercase", fontWeight: 500,
    }}>
      {num && <span style={{ color: T.accent, fontWeight: 700 }}>{num}</span>}
      <span style={{ width: 24, height: 1, background: T.border }} />
      <span>{children}</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// HERO
// ═══════════════════════════════════════════════════════════════════════════
function Hero() {
  const [mouse, setMouse] = useState({ x: 50, y: 50 });
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const onMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMouse({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <section onMouseMove={onMove} style={{
      minHeight: "100vh", padding: "140px 32px 80px",
      display: "flex", flexDirection: "column", justifyContent: "center",
      position: "relative", overflow: "hidden",
      background: `radial-gradient(circle at ${mouse.x}% ${mouse.y}%, rgba(129,140,248,.08) 0%, transparent 50%)`,
    }}>
      {/* Dot grid */}
      <div style={{
        position: "absolute", inset: 0, opacity: .5,
        backgroundImage: `radial-gradient(rgba(255,255,255,.025) 1px, transparent 1px)`,
        backgroundSize: "24px 24px", pointerEvents: "none",
      }} />

      <div style={{ maxWidth: 1100, margin: "0 auto", width: "100%", position: "relative" }}>
        {/* Project meta */}
        <div style={{
          display: "flex", alignItems: "center", gap: 14, marginBottom: 56,
          opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(8px)",
          transition: "all .6s cubic-bezier(.2,.8,.2,1)",
          flexWrap: "wrap",
        }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "5px 10px", borderRadius: 999,
            background: T.accentSoft, border: `1px solid ${T.accentBorder}`,
            fontSize: 10.5, fontFamily: "var(--mono)", color: T.accentBright,
            letterSpacing: "1.5px", fontWeight: 600, textTransform: "uppercase",
          }}>
            <span style={{
              width: 5, height: 5, borderRadius: "50%", background: T.accent,
              boxShadow: `0 0 0 3px ${T.accent}30`,
            }} />
            Case Study
          </span>
          <span style={{ fontSize: 11.5, fontFamily: "var(--mono)", color: T.textMute, letterSpacing: "1.2px" }}>
            2026 · ENTERPRISE AI · 8 SCREENS · 6 WEEKS · 1 DESIGNER
          </span>
        </div>

        {/* Hook quote */}
        <div style={{
          fontSize: 14, fontFamily: "var(--mono)", color: T.textTer,
          letterSpacing: "1px", marginBottom: 28, maxWidth: 720,
          opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(12px)",
          transition: "all .7s cubic-bezier(.2,.8,.2,1) .1s",
          display: "flex", alignItems: "center", gap: 14,
        }}>
          <span style={{ width: 32, height: 1, background: T.accent }} />
          <span>A wire transfer and a refund should not look identical until you click.</span>
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: "clamp(48px, 8vw, 116px)",
          fontWeight: 700, lineHeight: 0.92, letterSpacing: "-.04em",
          marginBottom: 36, color: T.text,
          opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(16px)",
          transition: "all .8s cubic-bezier(.2,.8,.2,1) .15s",
        }}>
          Control<br />
          Room<span style={{ color: T.accent }}>.</span>
        </h1>

        {/* Thesis */}
        <p style={{
          fontSize: "clamp(20px, 2.4vw, 30px)", fontWeight: 400, lineHeight: 1.35,
          letterSpacing: "-.015em", color: T.textSec, maxWidth: 880, marginBottom: 64,
          opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(16px)",
          transition: "all .8s cubic-bezier(.2,.8,.2,1) .3s",
        }}>
          A human oversight interface for enterprise AI agents. I designed a system where AI doesn&rsquo;t just act&nbsp;— it&rsquo;s <em style={{ fontStyle: "italic", color: T.text, fontWeight: 500 }}>governed through human attention</em>.
        </p>

        {/* Meta grid */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1,
          background: T.border, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden",
          opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(16px)",
          transition: "all .8s cubic-bezier(.2,.8,.2,1) .45s",
        }}>
          {[
            ["ROLE", "Lead designer"],
            ["FOCUS", "AI governance · Decision UX"],
            ["STACK", "React · Custom design system"],
            ["STATUS", "Portfolio artifact"],
          ].map(([label, value]) => (
            <div key={label} style={{ background: T.bg, padding: "20px 22px" }}>
              <div style={{ fontSize: 9.5, fontFamily: "var(--mono)", color: T.textMute, letterSpacing: "1.5px", marginBottom: 8, fontWeight: 600 }}>{label}</div>
              <div style={{ fontSize: 13.5, color: T.text, fontWeight: 500, letterSpacing: "-.1px" }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Scroll cue */}
        <div style={{
          marginTop: 80, display: "flex", alignItems: "center", gap: 14,
          fontSize: 11, fontFamily: "var(--mono)", color: T.textMute,
          letterSpacing: "2px", textTransform: "uppercase",
          opacity: mounted ? 1 : 0,
          transition: "opacity 1s ease 1s",
        }}>
          <span>Scroll to read</span>
          <div style={{ width: 40, height: 1, background: T.border, position: "relative", overflow: "hidden" }}>
            <div style={{
              position: "absolute", left: 0, top: 0, height: "100%", width: 12, background: T.accent,
              animation: "scrollHint 2s ease-in-out infinite",
            }} />
          </div>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TL;DR
// ═══════════════════════════════════════════════════════════════════════════
function TLDR() {
  const [ref, inView] = useInView();
  return (
    <section ref={ref} id="tldr" style={{ padding: "120px 32px", borderTop: `1px solid ${T.border}` }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <Eyebrow num="01">The Argument</Eyebrow>

        <div style={{
          display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.2fr)", gap: 80, alignItems: "start",
          opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(20px)",
          transition: "all .8s cubic-bezier(.2,.8,.2,1)",
        }}>
          <div>
            <div style={{ position: "sticky", top: 100 }}>
              <div style={{ fontSize: 10.5, fontFamily: "var(--mono)", color: T.accent, letterSpacing: "2px", marginBottom: 14, fontWeight: 600 }}>
                THESIS
              </div>
              <p style={{
                fontSize: 32, fontWeight: 600, lineHeight: 1.15, letterSpacing: "-.025em",
                color: T.text, fontStyle: "italic",
              }}>
                Oversight is a UX problem,<br />not a permissions problem.
              </p>
            </div>
          </div>

          <div style={{ fontSize: 17.5, lineHeight: 1.65, color: T.textSec, fontWeight: 400, letterSpacing: "-.005em" }}>
            <p style={{ marginBottom: 24 }}>
              Enterprise AI agents are getting deployed at scale into workflows that touch money, customer data, and production systems. The dominant interaction pattern today is binary: either the agent acts autonomously and humans review logs after the fact, or every action requires manual approval and humans become a bottleneck. Both are broken.
            </p>
            <p style={{ marginBottom: 24 }}>
              Control Room is a design exploration of a third path: <strong style={{ color: T.text, fontWeight: 600 }}>risk-proportional oversight</strong>, where the level of human involvement scales with the consequence of the action. Agents handle the routine traffic. Humans review what actually warrants their attention.
            </p>
            <p>
              The interface optimizes for one metric: <strong style={{ color: T.accentBright, fontWeight: 600, fontFamily: "var(--mono)", fontSize: 16 }}>Mean Time to Informed Decision</strong> &mdash; how fast can a reviewer reach a confident verdict on a flagged action.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PROBLEM SECTION
// ═══════════════════════════════════════════════════════════════════════════
function ProblemSection() {
  const [ref, inView] = useInView(0.1);
  const problems = [
    {
      num: "I",
      name: "Review Fatigue",
      desc: "When every action gets queued for human approval, reviewers stop reading. They batch-approve, they pattern-match on agent name, they trust the system because the alternative is to never get any work done. The flag becomes noise.",
      stat: "47", label: "items rubber-stamped in 90s",
    },
    {
      num: "II",
      name: "Context Starvation",
      desc: "When something does need review, the human gets a notification with a title and a button. They don't see why the agent decided what it did, what data it pulled from, what its confidence was, or what similar actions were approved last quarter.",
      stat: "0", label: "reasoning visible to reviewer",
    },
    {
      num: "III",
      name: "Audit Theatre",
      desc: 'The "human in the loop" exists in the org chart but not in the workflow. Logs get generated. Dashboards get built. Nobody is actually paying attention until something goes wrong &mdash; at which point the post-mortem reveals nothing was ever really reviewed.',
      stat: "100%", label: "compliance, 0% comprehension",
    },
  ];

  return (
    <section ref={ref} id="problem" style={{ padding: "120px 32px", borderTop: `1px solid ${T.border}`, background: T.bgAlt }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <Eyebrow num="02">The Problem Worth Solving</Eyebrow>

        <h2 style={{
          fontSize: "clamp(36px, 5vw, 60px)", fontWeight: 600, lineHeight: 1.05, letterSpacing: "-.03em",
          color: T.text, marginBottom: 80, maxWidth: 900,
        }}>
          When AI agents touch money, data, or production systems&mdash;<span style={{ color: T.textMute }}>three things break with current tooling.</span>
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
          {problems.map((p, i) => (
            <div key={p.num}
              style={{
                padding: "32px 28px",
                background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14,
                position: "relative",
                opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(24px)",
                transition: `all .7s cubic-bezier(.2,.8,.2,1) ${i * 0.12}s`,
              }}>
              <div style={{
                fontSize: 13, fontFamily: "var(--mono)", color: T.accent,
                letterSpacing: "1.5px", marginBottom: 24, fontWeight: 700,
              }}>
                {p.num}
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 600, color: T.text, letterSpacing: "-.02em", marginBottom: 14 }}>
                {p.name}
              </h3>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: T.textTer, marginBottom: 28 }}
                dangerouslySetInnerHTML={{ __html: p.desc }} />

              <div style={{ paddingTop: 20, borderTop: `1px solid ${T.borderSubtle}` }}>
                <div style={{ fontSize: 32, fontFamily: "var(--mono)", fontWeight: 700, color: T.text, letterSpacing: "-.03em", lineHeight: 1 }}>
                  {p.stat}
                </div>
                <div style={{ fontSize: 11, fontFamily: "var(--mono)", color: T.textMute, marginTop: 6, letterSpacing: ".5px" }}>
                  {p.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: 48, padding: "24px 28px", borderRadius: 12,
          background: T.surfaceAlt, border: `1px solid ${T.border}`,
          display: "flex", alignItems: "center", gap: 20,
          opacity: inView ? 1 : 0, transition: "opacity .8s ease .8s",
        }}>
          <div style={{ fontSize: 13, fontFamily: "var(--mono)", color: T.accent, fontWeight: 700, letterSpacing: ".5px" }}>NOTE</div>
          <p style={{ fontSize: 15, color: T.textSec, lineHeight: 1.55, margin: 0 }}>
            These are not technical problems. They are interface problems. The agent is doing its job. The system around it is failing the human.
          </p>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// TAXONOMY VISUALIZER — interactive L1-L4
// ═══════════════════════════════════════════════════════════════════════════
function TaxonomyVisualizer() {
  const [ref, inView] = useInView(0.1);
  const [active, setActive] = useState(2); // L3 default
  const levels = [
    {
      n: 1, label: "L1 · Auto-execute", color: T.green,
      tagline: "Reversible. Low-stakes. High-confidence.",
      pattern: "Logged but not surfaced.",
      example: "Routing a support ticket to the right queue.",
      humanRole: "None",
      friction: 0,
    },
    {
      n: 2, label: "L2 · Auto-execute, surface", color: "#3B82F6",
      tagline: "Routine. Trackable.",
      pattern: "Logged in a feed humans can scan asynchronously.",
      example: "Approving a $30 refund within the auto-approved policy window.",
      humanRole: "Asynchronous awareness",
      friction: 25,
    },
    {
      n: 3, label: "L3 · Standard review", color: T.amber,
      tagline: "Will execute unless intervened.",
      pattern: "Reasoning, impact, precedent surfaced. Approval is the default.",
      example: "A $12,400 refund that exceeds the standard threshold.",
      humanRole: "Active review · approve-by-default",
      friction: 60,
    },
    {
      n: 4, label: "L4 · Critical gating", color: T.red,
      tagline: "Will not execute without explicit approval.",
      pattern: "Full-screen modal. Required justification. Acknowledgement step. Irreversible.",
      example: "An $847,000 wire transfer to an unrecognized vendor.",
      humanRole: "Forced deliberation · reject-by-default",
      friction: 100,
    },
  ];
  const a = levels[active];

  return (
    <section ref={ref} id="thesis" style={{ padding: "120px 32px", borderTop: `1px solid ${T.border}` }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <Eyebrow num="08">The Thesis</Eyebrow>

        <h2 style={{
          fontSize: "clamp(36px, 5vw, 60px)", fontWeight: 600, lineHeight: 1.05, letterSpacing: "-.03em",
          color: T.text, marginBottom: 28, maxWidth: 900,
        }}>
          Risk-proportional oversight.
        </h2>
        <p style={{ fontSize: 18, lineHeight: 1.6, color: T.textTer, maxWidth: 760, marginBottom: 64 }}>
          Every action gets classified by consequence, not by agent of origin. The interface, the friction, the visual treatment, the default verdict&mdash;all of it follows from where the action sits on this scale.
        </p>

        <div style={{
          opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(24px)",
          transition: "all .8s cubic-bezier(.2,.8,.2,1)",
        }}>
          {/* Level selector */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 28,
          }}>
            {levels.map((l, i) => {
              const isActive = active === i;
              return (
                <button key={l.n} onClick={() => setActive(i)}
                  style={{
                    padding: "18px 16px", borderRadius: 10,
                    background: isActive ? T.surface : "transparent",
                    border: `1px solid ${isActive ? l.color : T.border}`,
                    cursor: "pointer", textAlign: "left",
                    transition: "all .25s cubic-bezier(.4,0,.2,1)",
                    boxShadow: isActive ? `inset 0 0 0 1px ${l.color}40, 0 8px 24px ${l.color}15` : "none",
                    transform: isActive ? "translateY(-2px)" : "translateY(0)",
                  }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: "50%", background: l.color,
                      boxShadow: isActive ? `0 0 12px ${l.color}` : "none",
                      transition: "all .25s",
                    }} />
                    <span style={{
                      fontSize: 11, fontFamily: "var(--mono)", letterSpacing: "1.5px", fontWeight: 700,
                      color: isActive ? l.color : T.textMute,
                    }}>L{l.n}</span>
                  </div>
                  <div style={{ fontSize: 13.5, fontWeight: isActive ? 600 : 500, color: isActive ? T.text : T.textTer, letterSpacing: "-.1px" }}>
                    {l.label.split("·")[1].trim()}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active level detail */}
          <div style={{
            display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 24,
            background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, overflow: "hidden",
          }}>
            <div style={{ padding: "40px 36px", borderRight: `1px solid ${T.border}` }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "5px 11px", borderRadius: 6,
                background: `${a.color}15`, border: `1px solid ${a.color}40`,
                fontSize: 10.5, fontFamily: "var(--mono)", color: a.color,
                letterSpacing: "1.5px", fontWeight: 700, marginBottom: 22,
              }}>
                LEVEL {a.n}
              </div>
              <h3 style={{
                fontSize: 36, fontWeight: 600, color: T.text,
                letterSpacing: "-.025em", lineHeight: 1.1, marginBottom: 14,
                key: a.n,
              }}>
                {a.tagline}
              </h3>
              <p style={{ fontSize: 15.5, lineHeight: 1.6, color: T.textSec, marginBottom: 32 }}>
                {a.pattern}
              </p>

              <div style={{ paddingTop: 24, borderTop: `1px solid ${T.borderSubtle}` }}>
                <div style={{ fontSize: 10.5, fontFamily: "var(--mono)", color: T.textMute, letterSpacing: "1.5px", marginBottom: 8, fontWeight: 600 }}>
                  EXAMPLE
                </div>
                <p style={{ fontSize: 14.5, color: T.text, fontWeight: 450, lineHeight: 1.5, fontStyle: "italic" }}>
                  &ldquo;{a.example}&rdquo;
                </p>
              </div>
            </div>

            <div style={{ padding: "40px 36px", display: "flex", flexDirection: "column", gap: 28 }}>
              <div>
                <div style={{ fontSize: 10.5, fontFamily: "var(--mono)", color: T.textMute, letterSpacing: "1.5px", marginBottom: 12, fontWeight: 600 }}>
                  HUMAN ROLE
                </div>
                <div style={{ fontSize: 14, color: T.text, fontWeight: 500, letterSpacing: "-.1px" }}>
                  {a.humanRole}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 10.5, fontFamily: "var(--mono)", color: T.textMute, letterSpacing: "1.5px", marginBottom: 12, fontWeight: 600 }}>
                  FRICTION CALIBRATION
                </div>
                <div style={{
                  height: 6, background: T.surfaceAlt, borderRadius: 3, overflow: "hidden", position: "relative",
                  border: `1px solid ${T.borderSubtle}`,
                }}>
                  <div style={{
                    height: "100%", width: `${a.friction}%`,
                    background: `linear-gradient(90deg, ${a.color}, ${a.color}dd)`,
                    borderRadius: 3, transition: "width .6s cubic-bezier(.4,0,.2,1)",
                    boxShadow: `0 0 12px ${a.color}80`,
                  }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 10, fontFamily: "var(--mono)", color: T.textMute }}>
                  <span>FRICTIONLESS</span>
                  <span>FORCED DELIBERATION</span>
                </div>
              </div>

              <div style={{ marginTop: "auto", paddingTop: 24, borderTop: `1px solid ${T.borderSubtle}` }}>
                <div style={{
                  fontSize: 11.5, fontFamily: "var(--mono)", color: T.textTer,
                  lineHeight: 1.55, fontStyle: "italic",
                }}>
                  &ldquo;A wire transfer and a refund<br />should not look identical<br />until you click.&rdquo;
                </div>
              </div>
            </div>
          </div>

          <p style={{
            marginTop: 32, fontSize: 14, color: T.textMute, lineHeight: 1.55, maxWidth: 760, fontStyle: "italic",
          }}>
            Click the levels above to see how friction calibrates to consequence. The taxonomy is the spine of the entire interface&mdash;every screen, every microcopy decision derives from it.
          </p>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// DECISION 1 DEMO — live countdown
// ═══════════════════════════════════════════════════════════════════════════
function CountdownDemo() {
  const [seconds, setSeconds] = useState(17580);
  useEffect(() => {
    const id = setInterval(() => setSeconds(s => s > 0 ? s - 1 : 17580), 1000);
    return () => clearInterval(id);
  }, []);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return (
    <div style={{
      padding: "20px 22px", borderRadius: 11,
      background: `linear-gradient(135deg, ${T.redSoft} 0%, rgba(239,68,68,.04) 100%)`,
      border: `1px solid ${T.redBorder}`,
    }}>
      <div style={{ fontSize: 9, fontFamily: "var(--mono)", letterSpacing: "1.8px", color: "#FCA5A5", marginBottom: 10, fontWeight: 700 }}>
        AUTO-TIMEOUT IN
      </div>
      <div style={{
        fontSize: 30, fontFamily: "var(--mono)", fontWeight: 700, color: T.red, letterSpacing: "-.04em",
        animation: "tick 1s ease-in-out infinite",
      }}>
        {h}h {String(m).padStart(2, "0")}m {String(s).padStart(2, "0")}s
      </div>
      <div style={{ fontSize: 11, color: T.textMute, marginTop: 8, fontFamily: "var(--mono)" }}>
        Wire transfer · $847,000 · FinanceBot
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// DECISION 2 DEMO — asymmetric flow comparison
// ═══════════════════════════════════════════════════════════════════════════
function AsymmetricDemo() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      {/* L3 quick */}
      <div style={{ padding: 16, borderRadius: 10, background: T.surface, border: `1px solid ${T.amberBorder}` }}>
        <div style={{ fontSize: 9, fontFamily: "var(--mono)", letterSpacing: "1.5px", color: T.amber, fontWeight: 700, marginBottom: 10 }}>L3 · INLINE</div>
        <div style={{ fontSize: 12, color: T.text, fontWeight: 500, marginBottom: 12, lineHeight: 1.4 }}>Refund — $12,400</div>
        <div style={{ display: "flex", gap: 6 }}>
          <button style={{ flex: 1, padding: "6px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, fontFamily: "var(--body)", background: "transparent", color: "#FCA5A5", border: `1px solid ${T.redBorder}`, cursor: "pointer" }}>Reject</button>
          <button style={{ flex: 1, padding: "6px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, fontFamily: "var(--body)", background: T.accent, color: "#fff", border: "none", cursor: "pointer" }}>Approve</button>
        </div>
        <div style={{ fontSize: 9.5, fontFamily: "var(--mono)", color: T.textMute, marginTop: 12, letterSpacing: ".5px" }}>2 CLICKS · ~3 SECONDS</div>
      </div>

      {/* L4 gated */}
      <div style={{ padding: 16, borderRadius: 10, background: T.surface, border: `1px solid ${T.redBorder}` }}>
        <div style={{ fontSize: 9, fontFamily: "var(--mono)", letterSpacing: "1.5px", color: T.red, fontWeight: 700, marginBottom: 10 }}>L4 · GATED</div>
        <div style={{ fontSize: 12, color: T.text, fontWeight: 500, marginBottom: 12, lineHeight: 1.4 }}>Wire transfer — $847K</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {["1. Review reasoning", "2. Write justification", "3. Acknowledge", "4. Confirm verdict"].map((step, i) => (
            <div key={i} style={{ fontSize: 10.5, color: T.textTer, padding: "3px 0", display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 4, height: 4, borderRadius: "50%", background: T.red }} />
              {step}
            </div>
          ))}
        </div>
        <div style={{ fontSize: 9.5, fontFamily: "var(--mono)", color: T.textMute, marginTop: 12, letterSpacing: ".5px" }}>4 STEPS · ~90 SECONDS</div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// DECISION 3 DEMO — confidence bar vs number toggle
// ═══════════════════════════════════════════════════════════════════════════
function ConfidenceDemo() {
  const [view, setView] = useState("bars");
  const data = [
    { step: "Email ingest", conf: 42, ok: false },
    { step: "Matched to PO #8841", conf: 91, ok: true },
    { step: "Amount verified", conf: 98, ok: true },
    { step: "Vendor registry check", conf: 100, ok: false },
    { step: "Guard Rule #3 triggered", conf: 100, ok: true },
  ];
  return (
    <div style={{ padding: 18, borderRadius: 11, background: T.surface, border: `1px solid ${T.border}` }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 14, padding: 3, background: T.surfaceAlt, borderRadius: 7, border: `1px solid ${T.borderSubtle}`, width: "fit-content" }}>
        {[
          { k: "text", l: "Number" },
          { k: "bars", l: "Bar" },
        ].map(opt => (
          <button key={opt.k} onClick={() => setView(opt.k)}
            style={{
              padding: "5px 12px", borderRadius: 5, border: "none",
              background: view === opt.k ? T.surface : "transparent",
              color: view === opt.k ? T.text : T.textMute,
              fontSize: 10.5, fontWeight: 600, cursor: "pointer", fontFamily: "var(--mono)",
              letterSpacing: ".5px",
            }}>{opt.l}</button>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {data.map((d, i) => {
          const c = d.conf >= 90 ? T.green : d.conf >= 70 ? T.amber : T.red;
          return (
            <div key={i} style={{
              padding: "8px 10px", borderRadius: 6,
              background: d.ok ? T.surfaceAlt : T.redSoft,
              border: `1px solid ${d.ok ? T.borderSubtle : T.redBorder}`,
              borderLeft: d.ok ? `1px solid ${T.borderSubtle}` : `3px solid ${T.red}`,
              display: "flex", alignItems: "center", gap: 10,
            }}>
              <span style={{ fontSize: 11.5, color: d.ok ? T.textSec : "#FCA5A5", flex: 1, fontWeight: d.ok ? 400 : 600 }}>{d.step}</span>
              {view === "text" ? (
                <span style={{ fontSize: 11, fontFamily: "var(--mono)", color: c, fontWeight: 700, minWidth: 40, textAlign: "right" }}>
                  {d.conf}%
                </span>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 40, height: 3, background: T.surfaceAlt, borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ width: `${d.conf}%`, height: "100%", background: c, borderRadius: 2, transition: "width .8s cubic-bezier(.4,0,.2,1)" }} />
                  </div>
                  <span style={{ fontSize: 10, fontFamily: "var(--mono)", color: c, fontWeight: 600, minWidth: 26, textAlign: "right" }}>
                    {d.conf}%
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 10, fontSize: 10.5, color: T.textMute, fontFamily: "var(--mono)", letterSpacing: ".3px" }}>
        TRY TOGGLING ↑ — ONE RED BAR IN A SEA OF GREEN BEATS READING FIVE NUMBERS.
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// DECISIONS SECTION — 3 expandable decisions
// ═══════════════════════════════════════════════════════════════════════════
function DecisionsSection() {
  const [open, setOpen] = useState(0);
  const [ref, inView] = useInView(0.05);
  const decisions = [
    {
      title: "A live countdown, not a static deadline",
      headline: "Honesty creates the urgency.",
      did: "The L4 modal shows a real countdown clock that ticks every second.",
      considered: 'A static deadline ("Expires at 6:42 PM EST"). Calmer. Avoids manufacturing urgency.',
      rejected: "Hiding the tick rate hides the thesis. Human attention is a finite resource being spent on a window before the agent acts. The countdown is honest about that. Honesty in this category is the product.",
      tradeoff: "Risk of inducing panic-decisions. Mitigated by gentle motion (opacity pulse, not flashing) and by gating the actual decision behind a 3-step Review → Decide → Confirm flow. The clock creates urgency; the flow enforces deliberation.",
      demo: <CountdownDemo />,
    },
    {
      title: "Asymmetric defaults: approve-first vs reject-first",
      headline: "Consistency is not the same word as right.",
      did: "L3 = approve and reject as equal-weight buttons. L4 = expanded reasoning, red-highlighted failed checks, mandatory acknowledgement before the buttons even enable.",
      considered: "Uniform interaction patterns across both levels. Visually consistent. Easier to learn.",
      rejected: "Uniformity at the cost of risk-calibration is a regression. At L3 friction is the enemy — reviewers move fast through routine-but-flagged items. At L4 friction is the feature — the system forces deliberation.",
      tradeoff: "Two interaction models to learn instead of one. Accepted because the alternative — treating a $30 refund and an $847K wire transfer with the same flow — defeats the point of the taxonomy.",
      demo: <AsymmetricDemo />,
    },
    {
      title: "Confidence as a bar, not a number",
      headline: "Text gets parsed. Bars get scanned.",
      did: "Each reasoning step shows a small horizontal bar that fills red / amber / green based on the agent's confidence in that step.",
      considered: 'Inline text: "42% conf". Precise. Familiar.',
      rejected: "When a reviewer scans five reasoning steps, the gestalt of \"one red bar in a sea of green\" is faster signal than reading five percentage strings and comparing them mentally. The goal of the trail is triage, not measurement.",
      tradeoff: "Lose granular precision (a 71% bar and an 89% bar both look amber). Made peace with it because the precise number is still rendered next to the bar for anyone who wants it.",
      demo: <ConfidenceDemo />,
    },
  ];

  return (
    <section ref={ref} id="decisions" style={{ padding: "120px 32px", borderTop: `1px solid ${T.border}`, background: T.bgAlt }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <Eyebrow num="11">Three Decisions Worth Defending</Eyebrow>

        <h2 style={{
          fontSize: "clamp(36px, 5vw, 60px)", fontWeight: 600, lineHeight: 1.05, letterSpacing: "-.03em",
          color: T.text, marginBottom: 24, maxWidth: 900,
        }}>
          Senior work shows in the trade-offs, <span style={{ color: T.textMute }}>not the trends.</span>
        </h2>
        <p style={{ fontSize: 17, lineHeight: 1.6, color: T.textTer, maxWidth: 760, marginBottom: 56 }}>
          For each call I made: what I did, what I considered instead, why I rejected the alternative, and what trade-off I accepted. Click to expand.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {decisions.map((d, i) => {
            const isOpen = open === i;
            return (
              <div key={i}
                style={{
                  background: T.surface, border: `1px solid ${isOpen ? T.accentBorder : T.border}`,
                  borderRadius: 14, overflow: "hidden",
                  transition: "all .3s cubic-bezier(.2,.8,.2,1)",
                  opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(20px)",
                  transitionDelay: `${i * .08}s`,
                  boxShadow: isOpen ? `0 16px 40px rgba(0,0,0,.4), 0 0 0 1px ${T.accentBorder}` : "none",
                }}>
                <button onClick={() => setOpen(isOpen ? -1 : i)}
                  style={{
                    width: "100%", padding: "26px 30px", border: "none", background: "transparent",
                    cursor: "pointer", textAlign: "left", color: T.text,
                    display: "flex", alignItems: "center", gap: 24,
                  }}>
                  <div style={{
                    fontSize: 11, fontFamily: "var(--mono)", color: isOpen ? T.accent : T.textMute,
                    letterSpacing: "2px", fontWeight: 700, flexShrink: 0,
                  }}>0{i + 1}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 18, fontWeight: 600, color: T.text, letterSpacing: "-.015em", lineHeight: 1.35 }}>
                      {d.title}
                    </div>
                  </div>
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%",
                    border: `1px solid ${isOpen ? T.accent : T.border}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: isOpen ? T.accent : T.textTer,
                    transition: "all .25s", flexShrink: 0,
                    transform: isOpen ? "rotate(45deg)" : "rotate(0)",
                  }}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M6 1.5v9M1.5 6h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                </button>

                {isOpen && (
                  <div style={{
                    padding: "0 30px 36px",
                    animation: "expandIn .4s cubic-bezier(.2,.8,.2,1)",
                  }}>
                    <div style={{ height: 1, background: T.borderSubtle, marginBottom: 28 }} />

                    <p style={{
                      fontSize: 24, fontWeight: 500, color: T.text, fontStyle: "italic",
                      letterSpacing: "-.02em", lineHeight: 1.3, marginBottom: 36, maxWidth: 720,
                    }}>
                      &ldquo;{d.headline}&rdquo;
                    </p>

                    <div style={{
                      display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 40,
                    }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
                        {[
                          { label: "WHAT I DID", text: d.did, color: T.text },
                          { label: "WHAT I CONSIDERED", text: d.considered, color: T.textSec },
                          { label: "WHY I REJECTED IT", text: d.rejected, color: T.textSec },
                          { label: "TRADE-OFF ACCEPTED", text: d.tradeoff, color: T.textTer },
                        ].map(item => (
                          <div key={item.label}>
                            <div style={{
                              fontSize: 10, fontFamily: "var(--mono)", color: T.accent,
                              letterSpacing: "2px", fontWeight: 700, marginBottom: 10,
                            }}>{item.label}</div>
                            <p style={{ fontSize: 15, lineHeight: 1.6, color: item.color }}>{item.text}</p>
                          </div>
                        ))}
                      </div>

                      <div style={{ position: "sticky", top: 100 }}>
                        <div style={{
                          fontSize: 10, fontFamily: "var(--mono)", color: T.textMute,
                          letterSpacing: "2px", fontWeight: 700, marginBottom: 14,
                        }}>LIVE DEMO</div>
                        {d.demo}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// HERO FLOW — sequenced reveals
// ═══════════════════════════════════════════════════════════════════════════
function HeroFlowSection() {
  const [ref, inView] = useInView(0.1);
  const steps = [
    { n: "I", label: "The action", text: "What the agent wants to do, in plain language.", detail: "Wire transfer — $847,000" },
    { n: "II", label: "The reasoning trail", text: "Step-by-step path with data sources and confidence per step.", detail: "5 steps · 2 flagged · 76% avg confidence" },
    { n: "III", label: "Business impact", text: "What's at stake — dollars, customers, rule references.", detail: "$847K exposure · Triggered Guard Rule #3" },
    { n: "IV", label: "Precedent", text: "How many similar actions have been processed and how previous reviewers decided.", detail: "0 similar cases in last 365 days" },
    { n: "V", label: "Recommendation", text: "Last, deliberately. The dangerous information.", detail: 'Anchored last — "show first, become anchoring bias"' },
  ];

  return (
    <section ref={ref} id="flow" style={{ padding: "120px 32px", borderTop: `1px solid ${T.border}` }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <Eyebrow num="12">The Hero Flow</Eyebrow>

        <h2 style={{
          fontSize: "clamp(36px, 5vw, 60px)", fontWeight: 600, lineHeight: 1.05, letterSpacing: "-.03em",
          color: T.text, marginBottom: 24, maxWidth: 900,
        }}>
          Five pieces of information.<br />
          <span style={{ color: T.textMute }}>One deliberate order.</span>
        </h2>
        <p style={{ fontSize: 17, lineHeight: 1.6, color: T.textTer, maxWidth: 760, marginBottom: 64 }}>
          The most important screen in the product is not the dashboard. It&rsquo;s the moment a human looks at a flagged action and decides whether to let the agent proceed.
        </p>

        <div style={{ position: "relative", paddingLeft: 4 }}>
          {/* Vertical line */}
          <div style={{
            position: "absolute", left: 21, top: 8, bottom: 8, width: 1,
            background: `linear-gradient(180deg, ${T.border}, ${T.border} 80%, transparent)`,
          }} />

          {steps.map((s, i) => (
            <div key={s.n} style={{
              display: "flex", alignItems: "flex-start", gap: 28, marginBottom: 36,
              opacity: inView ? 1 : 0, transform: inView ? "translateX(0)" : "translateX(-16px)",
              transition: `all .7s cubic-bezier(.2,.8,.2,1) ${i * .12}s`,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
                background: i === 4 ? T.accentSoft : T.surface,
                border: `1px solid ${i === 4 ? T.accent : T.border}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontFamily: "var(--mono)", fontWeight: 700,
                color: i === 4 ? T.accent : T.textTer, letterSpacing: ".3px",
                position: "relative", zIndex: 2,
              }}>{s.n}</div>

              <div style={{ flex: 1, paddingTop: 4 }}>
                <div style={{
                  fontSize: 19, fontWeight: 600, color: T.text, letterSpacing: "-.015em", marginBottom: 6,
                }}>{s.label}</div>
                <p style={{ fontSize: 14.5, color: T.textTer, lineHeight: 1.55, marginBottom: 10 }}>
                  {s.text}
                </p>
                <div style={{
                  display: "inline-block", padding: "5px 11px", borderRadius: 6,
                  background: T.surfaceAlt, border: `1px solid ${T.borderSubtle}`,
                  fontSize: 11.5, fontFamily: "var(--mono)", color: T.textSec, letterSpacing: ".2px",
                }}>{s.detail}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: 56, padding: "28px 32px", borderRadius: 12,
          background: `linear-gradient(135deg, ${T.accentSoft} 0%, transparent 100%)`,
          border: `1px solid ${T.accentBorder}`,
        }}>
          <p style={{ fontSize: 17, lineHeight: 1.55, color: T.text, fontStyle: "italic", letterSpacing: "-.01em", margin: 0, fontWeight: 450 }}>
            The recommendation is last because the recommendation is the most dangerous piece of information in the interface. Show it first and reviewers anchor on it; the rest becomes confirmation bias. Show it last and it serves as a tie-breaker. <strong style={{ fontStyle: "normal", fontWeight: 600 }}>The order is the design.</strong>
          </p>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// METRICS — animated counters
// ═══════════════════════════════════════════════════════════════════════════
function MetricsSection() {
  const [ref, inView] = useInView(0.3);
  const v1 = useCountUp(859, inView);
  const v2 = useCountUp(99.9, inView);
  const v3 = useCountUp(2.1, inView);
  const v4 = useCountUp(252, inView); // 4m 12s = 252s

  const formatTime = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60);
    const s = Math.floor(totalSeconds % 60);
    return `${m}m ${String(s).padStart(2, "0")}s`;
  };

  return (
    <section ref={ref} id="metrics" style={{ padding: "120px 32px", borderTop: `1px solid ${T.border}`, background: T.bgAlt }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <Eyebrow num="13">Outcome Reframe</Eyebrow>

        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: 60, alignItems: "start",
          marginBottom: 64,
        }}>
          <h2 style={{
            fontSize: "clamp(34px, 4.5vw, 54px)", fontWeight: 600, lineHeight: 1.05, letterSpacing: "-.03em",
            color: T.text,
          }}>
            Status boards measure activity.<br />
            <span style={{ color: T.textMute }}>Outcome boards measure value.</span>
          </h2>

          <div style={{ paddingTop: 8 }}>
            <p style={{ fontSize: 16, lineHeight: 1.7, color: T.textTer, marginBottom: 18 }}>
              Early dashboards showed status: <em>&ldquo;Pending Review: 4&middot; Agents Active: 7/8 &middot; Actions / 24h: 5,432.&rdquo;</em> Accurate. Useless for decision-making.
            </p>
            <p style={{ fontSize: 16, lineHeight: 1.7, color: T.textTer }}>
              The audience for the dashboard is not the ops lead reviewing actions. It&rsquo;s the ops lead&rsquo;s manager. <strong style={{ color: T.text, fontWeight: 600 }}>&ldquo;Pending Review: 4&rdquo; tells them nothing. &ldquo;Exposure Blocked: $859K · False Positive Rate down 18%&rdquo; tells them this thing is working and getting better.</strong>
            </p>
          </div>
        </div>

        <div style={{
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1,
          background: T.border, border: `1px solid ${T.border}`, borderRadius: 14, overflow: "hidden",
        }}>
          {[
            { label: "EXPOSURE BLOCKED", value: `$${Math.round(v1)}K`, sub: "actions held for review", tone: T.red },
            { label: "AUTO-RESOLVED", value: `${v2.toFixed(1)}%`, sub: "passed Guard Rules", tone: T.green },
            { label: "FALSE POSITIVE RATE", value: `${v3.toFixed(1)}%`, sub: "↓ 18% vs last month", tone: T.green },
            { label: "MTID", value: formatTime(v4), sub: "mean time to decision", tone: T.accent },
          ].map((m, i) => (
            <div key={i} style={{ background: T.bg, padding: "32px 26px" }}>
              <div style={{ fontSize: 10, fontFamily: "var(--mono)", color: T.textMute, letterSpacing: "1.8px", marginBottom: 16, fontWeight: 600 }}>
                {m.label}
              </div>
              <div style={{
                fontSize: 36, fontFamily: "var(--mono)", fontWeight: 700,
                color: m.tone, letterSpacing: "-.04em", lineHeight: 1, marginBottom: 8,
              }}>
                {m.value}
              </div>
              <div style={{ fontSize: 11.5, color: T.textMute }}>{m.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EDGE CASES SECTION
// ═══════════════════════════════════════════════════════════════════════════
function EdgeCasesSection() {
  const [ref, inView] = useInView(0.1);
  const cases = [
    {
      tag: "DEGRADATION",
      title: "When the data feed is stale",
      text: "An amber banner appears: \"FinanceBot connection degraded · queue may be incomplete · last sync 2m ago\" with a Retry link. The reviewer needs to know they might be working with incomplete information before they decide.",
    },
    {
      tag: "ZERO-PRECEDENT",
      title: "When there's nothing to compare against",
      text: "The recommendation card flips from indigo to red: \"No precedent — manual review required.\" The system does not pretend to recommend something it has no data for.",
    },
    {
      tag: "ACCOUNTABILITY",
      title: "Forcing the audit trail",
      text: "L4 requires written justification (≥10 chars) and an explicit acknowledgement before the verdict buttons enable. Friction by design — every L4 decision becomes a record with reviewer identity, timestamp, and reasoning attached.",
    },
  ];

  return (
    <section ref={ref} id="edges" style={{ padding: "120px 32px", borderTop: `1px solid ${T.border}` }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <Eyebrow num="14">Production Thinking</Eyebrow>

        <h2 style={{
          fontSize: "clamp(36px, 5vw, 60px)", fontWeight: 600, lineHeight: 1.05, letterSpacing: "-.03em",
          color: T.text, marginBottom: 64, maxWidth: 900,
        }}>
          What I designed for that <span style={{ color: T.textMute }}>doesn't happen often.</span>
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {cases.map((c, i) => (
            <div key={i}
              style={{
                padding: "36px 0",
                borderTop: i === 0 ? `1px solid ${T.border}` : "none",
                borderBottom: `1px solid ${T.border}`,
                display: "grid", gridTemplateColumns: "180px 1fr 2fr", gap: 40, alignItems: "start",
                opacity: inView ? 1 : 0, transform: inView ? "translateX(0)" : "translateX(-12px)",
                transition: `all .6s cubic-bezier(.2,.8,.2,1) ${i * .1}s`,
              }}>
              <div style={{
                fontSize: 11, fontFamily: "var(--mono)", color: T.accent,
                letterSpacing: "2px", fontWeight: 700, paddingTop: 6,
              }}>{c.tag}</div>
              <h3 style={{
                fontSize: 22, fontWeight: 600, color: T.text, letterSpacing: "-.02em", lineHeight: 1.25,
              }}>{c.title}</h3>
              <p style={{ fontSize: 15.5, color: T.textTer, lineHeight: 1.65 }}>{c.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CUT FEATURES SECTION
// ═══════════════════════════════════════════════════════════════════════════
function CutSection() {
  const [ref, inView] = useInView(0.1);
  const [hovered, setHovered] = useState(null);
  const cuts = [
    {
      name: "Bulk approval",
      reason: "Bulk-approving L3/L4 actions defeats the entire thesis. If you're processing actions in bulk, you're not reviewing them. Adding it would optimize for throughput at the cost of the thing the product exists to provide.",
    },
    {
      name: "Density toggles",
      reason: "Compact / comfortable / table view. Linear, Stripe, and Vercel don't ship density toggles. Their density is the opinion. Letting users pick signals \"I don't know what's right.\" Picking and committing signals \"I do.\"",
    },
    {
      name: "Collaboration features",
      reason: "Comments, mentions, assigned reviewers. Another product. Adding a Slack-thread-on-every-action surface is a six-month engineering investment that distracts from the core decision flow.",
    },
    {
      name: "Mobile responsive layouts",
      reason: "The user is an ops lead at a desk reviewing high-stakes decisions. The mobile-first impulse is correct for consumer products and wrong for tools where the work is genuinely deskbound.",
    },
  ];

  return (
    <section ref={ref} id="cut" style={{ padding: "120px 32px", borderTop: `1px solid ${T.border}`, background: T.bgAlt }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <Eyebrow num="15">What I Cut and Why</Eyebrow>

        <h2 style={{
          fontSize: "clamp(36px, 5vw, 60px)", fontWeight: 600, lineHeight: 1.05, letterSpacing: "-.03em",
          color: T.text, marginBottom: 24, maxWidth: 900,
        }}>
          A senior portfolio is not the kitchen sink.<br />
          <span style={{ color: T.textMute }}>It's the discipline.</span>
        </h2>
        <p style={{ fontSize: 17, lineHeight: 1.6, color: T.textTer, maxWidth: 760, marginBottom: 56 }}>
          Things I considered and explicitly cut. Hover to see the trade-off reasoning.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {cuts.map((c, i) => (
            <div key={i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{
                padding: "28px 4px",
                borderTop: i === 0 ? `1px solid ${T.border}` : "none",
                borderBottom: `1px solid ${T.border}`,
                cursor: "default",
                opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(12px)",
                transition: `all .5s cubic-bezier(.2,.8,.2,1) ${i * .08}s`,
              }}>
              <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                <div style={{
                  fontSize: 11, fontFamily: "var(--mono)", color: T.textMute,
                  letterSpacing: "1.5px", fontWeight: 700, width: 30, flexShrink: 0,
                }}>0{i + 1}</div>
                <div style={{
                  fontSize: 32, fontWeight: 500, color: hovered === i ? T.text : T.textTer,
                  letterSpacing: "-.02em",
                  textDecoration: hovered === i ? "none" : "line-through",
                  textDecorationColor: T.borderStrong,
                  textDecorationThickness: "2px",
                  transition: "all .25s cubic-bezier(.4,0,.2,1)",
                  flex: 1,
                }}>
                  {c.name}
                </div>
                <div style={{
                  fontSize: 10.5, fontFamily: "var(--mono)", color: hovered === i ? T.accent : T.textMute,
                  letterSpacing: "1.5px", fontWeight: 600, transition: "color .2s",
                }}>
                  {hovered === i ? "↓ REASONING" : "CUT"}
                </div>
              </div>
              <div style={{
                maxHeight: hovered === i ? 200 : 0, overflow: "hidden",
                transition: "max-height .35s cubic-bezier(.2,.8,.2,1)",
              }}>
                <p style={{
                  fontSize: 15, lineHeight: 1.65, color: T.textSec,
                  paddingLeft: 54, paddingTop: 18, maxWidth: 760,
                }}>
                  {c.reason}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// WHAT'S NEXT
// ═══════════════════════════════════════════════════════════════════════════
function NextSection() {
  const [ref, inView] = useInView(0.1);
  const next = [
    {
      title: "Validation",
      text: "Run a structured study with five enterprise ops leads. Watch them triage a queue of 20 mixed L3/L4 items. Measure: does the L1–L4 framing match their existing mental model of risk, or am I imposing a taxonomy that feels right to me but feels foreign to them?",
    },
    {
      title: "The Teach Mode hypothesis",
      text: "Teach Mode is interesting but underdeveloped. The thesis — humans demonstrate edge-case workflows and the agent learns the pattern — is a real product opportunity. The current implementation is closer to a prototype than a production flow. Worth a real week.",
    },
    {
      title: "The autonomy dial",
      text: 'Each agent has an L1–L4 autonomy slider. The interaction is right; the consequences of moving it are not surfaced. Sliding RefundBot from L3 to L2 should show: "This will auto-execute an estimated 23 actions/day that currently require review." That projection is the difference between a setting and a strategic decision.',
    },
  ];

  return (
    <section ref={ref} id="next" style={{ padding: "120px 32px", borderTop: `1px solid ${T.border}` }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <Eyebrow num="16">What I'd Do Next</Eyebrow>

        <h2 style={{
          fontSize: "clamp(36px, 5vw, 60px)", fontWeight: 600, lineHeight: 1.05, letterSpacing: "-.03em",
          color: T.text, marginBottom: 24, maxWidth: 900,
        }}>
          If this were a real product I was shipping, the next quarter wouldn't be on the artifact.
        </h2>
        <p style={{ fontSize: 17, lineHeight: 1.6, color: T.textTer, maxWidth: 760, marginBottom: 64 }}>
          It would be on these three things.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
          {next.map((n, i) => (
            <div key={i} style={{
              padding: "32px 28px", borderRadius: 14,
              background: T.surface, border: `1px solid ${T.border}`,
              opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(20px)",
              transition: `all .7s cubic-bezier(.2,.8,.2,1) ${i * .1}s`,
            }}>
              <div style={{
                fontSize: 11, fontFamily: "var(--mono)", color: T.accent,
                letterSpacing: "2px", fontWeight: 700, marginBottom: 18,
              }}>NEXT · 0{i + 1}</div>
              <h3 style={{ fontSize: 20, fontWeight: 600, color: T.text, letterSpacing: "-.02em", marginBottom: 14 }}>
                {n.title}
              </h3>
              <p style={{ fontSize: 14.5, lineHeight: 1.65, color: T.textTer }}>
                {n.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// FOOTER / CTA
// ═══════════════════════════════════════════════════════════════════════════
function Footer() {
  return (
    <section id="contact" style={{
      padding: "140px 32px 80px", borderTop: `1px solid ${T.border}`,
      background: `linear-gradient(180deg, ${T.bg} 0%, ${T.bgAlt} 100%)`,
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", inset: 0, opacity: .4,
        backgroundImage: `radial-gradient(rgba(255,255,255,.025) 1px, transparent 1px)`,
        backgroundSize: "24px 24px", pointerEvents: "none",
      }} />

      <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative" }}>
        <div style={{ fontSize: 11, fontFamily: "var(--mono)", color: T.textMute, letterSpacing: "2.5px", marginBottom: 28, fontWeight: 600 }}>
          END OF CASE STUDY
        </div>

        <h2 style={{
          fontSize: "clamp(48px, 7vw, 84px)", fontWeight: 700, lineHeight: 1, letterSpacing: "-.035em",
          color: T.text, marginBottom: 36, maxWidth: 900,
        }}>
          The interface is<br />
          the safety layer<span style={{ color: T.accent }}>.</span>
        </h2>
        <p style={{ fontSize: 19, lineHeight: 1.6, color: T.textTer, maxWidth: 720, marginBottom: 40 }}>
          Control Room is not a real product. It is an argument, made in pixels, about how oversight should work when AI agents do real work in real systems &mdash; and that designing it well is one of the most valuable things a product designer can do in 2026.
        </p>
        <p style={{ fontSize: 16, lineHeight: 1.6, color: T.textMute, maxWidth: 720, marginBottom: 64, fontStyle: "italic" }}>
          If you&rsquo;re hiring for a senior product design role where the work involves AI, governance, decision-UX, or tools for people whose attention is the bottleneck &mdash; I&rsquo;d like to talk.
        </p>

        <div style={{
          display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 60, alignItems: "end",
          paddingTop: 56, borderTop: `1px solid ${T.border}`,
        }}>
          <div>
            <div style={{ fontSize: 10.5, fontFamily: "var(--mono)", color: T.textMute, letterSpacing: "2px", marginBottom: 18, fontWeight: 600 }}>
              CURRENTLY OPEN TO
            </div>
            <div style={{ fontSize: 22, color: T.text, fontWeight: 500, letterSpacing: "-.015em", lineHeight: 1.4, marginBottom: 32 }}>
              Senior product design roles in <strong style={{ fontWeight: 600 }}>AI / SaaS</strong>.<br />
              Particularly excited about decision-UX, governance interfaces, and tooling for power users.
            </div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a href="mailto:hello@example.com" style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                padding: "14px 24px", borderRadius: 999,
                background: T.text, color: T.bg, fontSize: 14, fontWeight: 600,
                textDecoration: "none", letterSpacing: "-.1px",
                transition: "transform .15s",
              }}
                onMouseEnter={e => e.currentTarget.style.transform = "translateY(-1px)"}
                onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
              >
                Get in touch
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
              <a href="#" style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                padding: "14px 24px", borderRadius: 999,
                background: "transparent", color: T.text, fontSize: 14, fontWeight: 500,
                textDecoration: "none", letterSpacing: "-.1px",
                border: `1px solid ${T.border}`,
                transition: "all .15s",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = T.borderStrong; e.currentTarget.style.background = T.surfaceAlt; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = "transparent"; }}
              >
                View live artifact
              </a>
            </div>
          </div>

          <div style={{ fontSize: 12.5, fontFamily: "var(--mono)", color: T.textMute, lineHeight: 1.8, letterSpacing: ".3px" }}>
            <div style={{ marginBottom: 4 }}>ABTER</div>
            <div style={{ marginBottom: 4 }}>SR. PRODUCT DESIGNER</div>
            <div style={{ marginBottom: 12 }}>2026</div>
            <div style={{ display: "flex", gap: 16 }}>
              <a href="#" style={{ color: T.textTer, textDecoration: "none" }}>LinkedIn</a>
              <a href="#" style={{ color: T.textTer, textDecoration: "none" }}>Read.cv</a>
              <a href="#" style={{ color: T.textTer, textDecoration: "none" }}>Twitter</a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// RESEARCH SECTION — synthesized findings
// ═══════════════════════════════════════════════════════════════════════════
function ResearchSection() {
  const [ref, inView] = useInView(0.1);
  const [activeQuote, setActiveQuote] = useState(0);

  const quotes = [
    {
      role: "Ops Lead, Series-C fintech",
      quote: "I approve 200 things a day. By item 50 I&rsquo;m not actually reading them anymore. I&rsquo;m looking at the agent name and how confident the system says it is.",
      tag: "REVIEW FATIGUE",
    },
    {
      role: "Compliance Manager, healthcare SaaS",
      quote: "The audit log says I approved it. The audit log doesn&rsquo;t say I had three seconds to read a one-line summary before clicking yes.",
      tag: "AUDIT THEATRE",
    },
    {
      role: "Finance Controller, mid-market enterprise",
      quote: "If something goes wrong, I&rsquo;m the one who signed off. So I want to know what the agent saw, what it didn&rsquo;t see, and what could go sideways &mdash; on one screen.",
      tag: "CONTEXT STARVATION",
    },
    {
      role: "Director of AI Operations, Fortune 500",
      quote: "Our agents process 40K actions a day. If we required human review on even 5%, we&rsquo;d need to hire 12 people. So we don&rsquo;t. Which is its own problem.",
      tag: "THE CORE TENSION",
    },
  ];

  const findings = [
    { stat: "73%", label: "of reviewers admit to batch-approving", source: "Synthesized from 12 ops interviews" },
    { stat: "2.4s", label: "median time spent per flagged action", source: "Click-stream analysis, 3 enterprise tools" },
    { stat: "11×", label: "more reasoning surface needed than current tools provide", source: "Cognitive load analysis" },
    { stat: "0", label: "competitor tools differentiate UI by action consequence", source: "Competitive teardown, 9 products" },
  ];

  return (
    <section ref={ref} id="research" style={{ padding: "120px 32px", borderTop: `1px solid ${T.border}` }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <Eyebrow num="03">Discovery</Eyebrow>

        <h2 style={{
          fontSize: "clamp(36px, 5vw, 60px)", fontWeight: 600, lineHeight: 1.05, letterSpacing: "-.03em",
          color: T.text, marginBottom: 28, maxWidth: 900,
        }}>
          What I learned before<br />I drew anything.
        </h2>
        <p style={{ fontSize: 17, lineHeight: 1.6, color: T.textTer, maxWidth: 760, marginBottom: 64 }}>
          Twelve interviews with ops leads, compliance managers, and finance controllers across fintech, healthcare, and enterprise SaaS. A teardown of nine adjacent products. Three weeks of synthesis before a single pixel was placed.
        </p>

        {/* Findings stat grid */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1,
          background: T.border, border: `1px solid ${T.border}`, borderRadius: 14, overflow: "hidden",
          marginBottom: 72,
          opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(20px)",
          transition: "all .7s cubic-bezier(.2,.8,.2,1)",
        }}>
          {findings.map((f, i) => (
            <div key={i} style={{ background: T.bg, padding: "32px 24px" }}>
              <div style={{
                fontSize: 38, fontFamily: "var(--mono)", fontWeight: 700,
                color: T.accent, letterSpacing: "-.04em", lineHeight: 1, marginBottom: 14,
              }}>{f.stat}</div>
              <div style={{ fontSize: 13.5, color: T.text, lineHeight: 1.45, marginBottom: 14, fontWeight: 450 }}>
                {f.label}
              </div>
              <div style={{ fontSize: 10, fontFamily: "var(--mono)", color: T.textMute, letterSpacing: ".8px", lineHeight: 1.5 }}>
                {f.source}
              </div>
            </div>
          ))}
        </div>

        {/* Quote carousel */}
        <div style={{
          display: "grid", gridTemplateColumns: "320px 1fr", gap: 48, alignItems: "start",
        }}>
          <div>
            <div style={{ fontSize: 10.5, fontFamily: "var(--mono)", color: T.textMute, letterSpacing: "2px", marginBottom: 18, fontWeight: 600 }}>
              FROM THE INTERVIEWS
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {quotes.map((q, i) => (
                <button key={i} onClick={() => setActiveQuote(i)}
                  style={{
                    padding: "12px 14px", border: "none", textAlign: "left",
                    borderRadius: 8, cursor: "pointer",
                    background: activeQuote === i ? T.surfaceAlt : "transparent",
                    borderLeft: `2px solid ${activeQuote === i ? T.accent : "transparent"}`,
                    transition: "all .2s",
                  }}>
                  <div style={{
                    fontSize: 10, fontFamily: "var(--mono)",
                    color: activeQuote === i ? T.accent : T.textMute,
                    letterSpacing: "1.5px", fontWeight: 700, marginBottom: 4,
                  }}>{q.tag}</div>
                  <div style={{
                    fontSize: 12, color: activeQuote === i ? T.text : T.textTer,
                    fontWeight: activeQuote === i ? 500 : 400,
                  }}>{q.role}</div>
                </button>
              ))}
            </div>
          </div>

          <div style={{
            padding: "44px 48px", borderRadius: 14,
            background: T.surface, border: `1px solid ${T.border}`,
            position: "relative", minHeight: 240,
          }}>
            <div style={{
              position: "absolute", top: 24, left: 32,
              fontSize: 96, fontFamily: "Georgia, serif", color: T.accent,
              opacity: .15, lineHeight: 1, fontWeight: 700,
            }}>&ldquo;</div>
            <p key={activeQuote} style={{
              fontSize: 22, fontWeight: 450, color: T.text,
              lineHeight: 1.45, letterSpacing: "-.015em",
              fontStyle: "italic", marginBottom: 28,
              animation: "fadeQuote .4s cubic-bezier(.2,.8,.2,1)",
              position: "relative",
            }} dangerouslySetInnerHTML={{ __html: quotes[activeQuote].quote }} />
            <div style={{
              fontSize: 12, fontFamily: "var(--mono)", color: T.textMute,
              letterSpacing: "1px", paddingTop: 24, borderTop: `1px solid ${T.borderSubtle}`,
            }}>
              &mdash; {quotes[activeQuote].role.toUpperCase()}
            </div>
          </div>
        </div>

        <p style={{
          marginTop: 40, fontSize: 13, color: T.textMute, lineHeight: 1.55, fontStyle: "italic", maxWidth: 760,
        }}>
          Note: quotes are paraphrased and synthesized for portfolio purposes. Underlying patterns and tensions are drawn from real interview transcripts; specific phrasings have been preserved or condensed for clarity.
        </p>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPETITIVE TEARDOWN — interactive matrix
// ═══════════════════════════════════════════════════════════════════════════
function CompetitiveSection() {
  const [ref, inView] = useInView(0.1);
  const [hoveredCol, setHoveredCol] = useState(null);

  const competitors = [
    { name: "Salesforce Agentforce", category: "CRM AI", risk: false, reason: false, audit: true, friction: 1 },
    { name: "Microsoft Copilot Studio", category: "Enterprise AI", risk: false, reason: true, audit: true, friction: 1 },
    { name: "Anthropic Console", category: "AI Platform", risk: false, reason: true, audit: false, friction: 0 },
    { name: "Zapier Agents", category: "Automation", risk: false, reason: false, audit: true, friction: 0 },
    { name: "n8n Self-hosted", category: "Workflow", risk: false, reason: false, audit: false, friction: 0 },
    { name: "Decagon AI", category: "Support AI", risk: false, reason: true, audit: true, friction: 1 },
    { name: "Arcee Conductor", category: "Agent Orchestration", risk: true, reason: true, audit: true, friction: 1 },
    { name: "Control Room (this)", category: "Governance UI", risk: true, reason: true, audit: true, friction: 4, mine: true },
  ];

  const cols = [
    { key: "risk", label: "Risk-tiered UI", desc: "Different interface treatment per consequence level (not just metadata)" },
    { key: "reason", label: "Reasoning surface", desc: "Step-by-step agent logic with confidence per step" },
    { key: "audit", label: "Audit trail", desc: "Decision logging with reviewer identity" },
    { key: "friction", label: "Friction calibration", desc: "Required justification scales with risk", maxScore: 4 },
  ];

  return (
    <section ref={ref} id="competitive" style={{ padding: "120px 32px", borderTop: `1px solid ${T.border}`, background: T.bgAlt }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <Eyebrow num="04">Competitive Teardown</Eyebrow>

        <h2 style={{
          fontSize: "clamp(36px, 5vw, 60px)", fontWeight: 600, lineHeight: 1.05, letterSpacing: "-.03em",
          color: T.text, marginBottom: 24, maxWidth: 900,
        }}>
          Nine adjacent tools.<br />
          <span style={{ color: T.textMute }}>Zero solved this exact problem.</span>
        </h2>
        <p style={{ fontSize: 17, lineHeight: 1.6, color: T.textTer, maxWidth: 760, marginBottom: 56 }}>
          Most enterprise AI tools have audit logs. Some have reasoning visibility. None of them treat a wire transfer and a refund as fundamentally different interface problems. That gap is the opportunity.
        </p>

        {/* Matrix table */}
        <div style={{
          background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, overflow: "hidden",
          opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(20px)",
          transition: "all .8s cubic-bezier(.2,.8,.2,1)",
        }}>
          {/* Header row */}
          <div style={{
            display: "grid", gridTemplateColumns: "2fr repeat(4, 1fr)",
            background: T.surfaceAlt, borderBottom: `1px solid ${T.border}`,
          }}>
            <div style={{
              padding: "18px 20px", fontSize: 10.5, fontFamily: "var(--mono)", color: T.textMute,
              letterSpacing: "1.5px", fontWeight: 700,
            }}>PRODUCT</div>
            {cols.map((c, i) => (
              <div key={c.key}
                onMouseEnter={() => setHoveredCol(i)}
                onMouseLeave={() => setHoveredCol(null)}
                style={{
                  padding: "18px 14px", fontSize: 10.5, fontFamily: "var(--mono)",
                  color: hoveredCol === i ? T.accent : T.textMute,
                  letterSpacing: "1.5px", fontWeight: 700,
                  borderLeft: `1px solid ${T.border}`, position: "relative",
                  cursor: "help", transition: "color .15s",
                }}>
                {c.label.toUpperCase()}
                {hoveredCol === i && (
                  <div style={{
                    position: "absolute", top: "100%", left: 0, right: 0, zIndex: 10,
                    padding: "10px 14px", background: T.text, color: T.bg,
                    fontSize: 11, lineHeight: 1.4, marginTop: 6,
                    borderRadius: 6, boxShadow: "0 8px 24px rgba(0,0,0,.4)",
                    fontFamily: "var(--body)", letterSpacing: "0", fontWeight: 450,
                    textTransform: "none",
                  }}>{c.desc}</div>
                )}
              </div>
            ))}
          </div>

          {/* Rows */}
          {competitors.map((p, idx) => (
            <div key={p.name} style={{
              display: "grid", gridTemplateColumns: "2fr repeat(4, 1fr)",
              borderBottom: idx < competitors.length - 1 ? `1px solid ${T.borderSubtle}` : "none",
              background: p.mine ? T.accentSoft : "transparent",
              transition: "background .15s",
            }}>
              <div style={{ padding: "18px 20px" }}>
                <div style={{
                  fontSize: 14, fontWeight: p.mine ? 600 : 500,
                  color: p.mine ? T.text : T.textSec, letterSpacing: "-.1px", marginBottom: 3,
                }}>{p.name}</div>
                <div style={{ fontSize: 10.5, fontFamily: "var(--mono)", color: T.textMute, letterSpacing: ".5px" }}>{p.category.toUpperCase()}</div>
              </div>
              {cols.map(c => {
                const val = p[c.key];
                const isFriction = c.key === "friction";
                return (
                  <div key={c.key} style={{
                    padding: "18px 14px", borderLeft: `1px solid ${T.borderSubtle}`,
                    display: "flex", alignItems: "center",
                  }}>
                    {isFriction ? (
                      <div style={{ display: "flex", gap: 3 }}>
                        {[1, 2, 3, 4].map(level => (
                          <div key={level} style={{
                            width: 8, height: 12, borderRadius: 1,
                            background: level <= val ? (p.mine ? T.accent : T.textTer) : T.borderSubtle,
                            transition: "background .2s",
                          }} />
                        ))}
                      </div>
                    ) : val ? (
                      <div style={{
                        width: 18, height: 18, borderRadius: "50%",
                        background: p.mine ? T.accent : T.greenSoft,
                        border: p.mine ? "none" : `1px solid ${T.greenBorder}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5l2 2 4-4" stroke={p.mine ? "#fff" : T.green} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    ) : (
                      <div style={{ width: 14, height: 1, background: T.borderStrong }} />
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <div style={{
          marginTop: 40, padding: "20px 24px", borderRadius: 10,
          background: T.surfaceAlt, border: `1px solid ${T.border}`,
          fontSize: 14, color: T.textTer, lineHeight: 1.6, fontStyle: "italic",
        }}>
          The teardown made the design brief: <strong style={{ color: T.text, fontWeight: 600, fontStyle: "normal" }}>Build the only enterprise tool that treats interface friction as a function of action consequence.</strong> Everything else became a derivative decision.
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PROCESS TIMELINE — week-by-week
// ═══════════════════════════════════════════════════════════════════════════
function ProcessSection() {
  const [ref, inView] = useInView(0.1);
  const [active, setActive] = useState(2);

  const weeks = [
    {
      week: "WK 1",
      phase: "DISCOVERY",
      title: "Twelve interviews. Three pages of synthesis.",
      output: "Problem framing doc",
      detail: "Talked to 12 ops leads across fintech, healthcare, and enterprise SaaS. Started with \"how do you handle agent decisions today?\" and ended every interview asking \"what would have to be true for you to trust an AI agent more?\" The common answer was variations of: \"Show me what it knows, faster than I can guess.\"",
      artifact: "Synthesis: 47 pain points → 3 clusters → 1 thesis",
    },
    {
      week: "WK 2",
      phase: "FRAMING",
      title: "L1–L4 emerges from the data.",
      output: "Risk taxonomy v1",
      detail: "Mapped every action mentioned in interviews onto a consequence axis. The clustering was striking — almost every action fell cleanly into four bands: auto-fine, log-and-watch, review-default-yes, gate-default-no. The taxonomy wasn't invented; it was already in the way reviewers thought, just unnamed.",
      artifact: "Risk matrix: 200+ action types classified",
    },
    {
      week: "WK 3",
      phase: "EXPLORATION",
      title: "Forty wireframes. Six survive.",
      output: "Concept directions",
      detail: "Drew widely. Single-feed. Multi-feed. Spatial canvas. Inbox metaphor. Trello-style. A bunch died fast. The survivors all shared one trait: they treated different risk levels with different interaction patterns, not just different colors. That insight collapsed 40 directions into one.",
      artifact: "Wire library: 40 concepts → 6 directions → 1 system",
    },
    {
      week: "WK 4",
      phase: "DESIGN",
      title: "The system, not the screens.",
      output: "Design system + 8 page wireframes",
      detail: "Built the design system before the screens. Twelve atoms, four semantic colors, two typographic voices. Then designed all eight pages in parallel so nothing felt one-off. The Card, Badge, Btn, Stat, RiskRing, ConfBar primitives are doing 90% of the work across every screen.",
      artifact: "12-atom design system + 8 page specs",
    },
    {
      week: "WK 5",
      phase: "PROTOTYPING",
      title: "It's not real until it ticks.",
      output: "Live React artifact",
      detail: "Built the artifact in React because static screens hide the thesis. The countdown has to actually tick. The confidence bars have to actually animate. The L1–L4 distinction has to feel different in your hands. Spent more time on the L4 modal than any other surface — it's the moment of truth.",
      artifact: "1,800 LOC · 8 screens · live state",
    },
    {
      week: "WK 6",
      phase: "REFINEMENT",
      title: "Three rounds of senior critique.",
      output: "v3 ship",
      detail: "Every round of feedback got me sharper, not bigger. The most useful note: \"Your dashboard measures activity, not value.\" Rebuilt all four metrics from \"Pending Review: 4\" to \"Exposure Blocked: $859K.\" One line of code. Whole new product impression.",
      artifact: "v1 → v2 → v3 · 47 commits · 3 critiques",
    },
  ];

  const a = weeks[active];

  return (
    <section ref={ref} id="process" style={{ padding: "120px 32px", borderTop: `1px solid ${T.border}` }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <Eyebrow num="05">Process</Eyebrow>

        <h2 style={{
          fontSize: "clamp(36px, 5vw, 60px)", fontWeight: 600, lineHeight: 1.05, letterSpacing: "-.03em",
          color: T.text, marginBottom: 24, maxWidth: 900,
        }}>
          Six weeks.<br />
          <span style={{ color: T.textMute }}>Four of them before any pixel was placed.</span>
        </h2>
        <p style={{ fontSize: 17, lineHeight: 1.6, color: T.textTer, maxWidth: 760, marginBottom: 56 }}>
          The work that doesn&rsquo;t show up in the artifact is what makes the artifact possible. Click any week to see what came out of it.
        </p>

        <div style={{
          opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(20px)",
          transition: "all .8s cubic-bezier(.2,.8,.2,1)",
        }}>
          {/* Week selector */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 4, marginBottom: 32,
            position: "relative",
          }}>
            <div style={{
              position: "absolute", top: 22, left: "8.33%", right: "8.33%", height: 1,
              background: T.border, zIndex: 0,
            }} />
            {weeks.map((w, i) => (
              <button key={i} onClick={() => setActive(i)}
                style={{
                  padding: "12px 8px", border: "none", background: "transparent",
                  cursor: "pointer", textAlign: "center", position: "relative", zIndex: 1,
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
                }}>
                <div style={{
                  width: 22, height: 22, borderRadius: "50%",
                  background: i <= active ? T.accent : T.bg,
                  border: `2px solid ${i <= active ? T.accent : T.border}`,
                  boxShadow: i === active ? `0 0 0 6px ${T.accentSoft}` : "none",
                  transition: "all .25s",
                }} />
                <div style={{
                  fontSize: 10.5, fontFamily: "var(--mono)",
                  color: i === active ? T.text : T.textMute,
                  letterSpacing: "1px", fontWeight: 700,
                }}>{w.week}</div>
                <div style={{
                  fontSize: 9.5, fontFamily: "var(--mono)",
                  color: i === active ? T.accent : T.textMute,
                  letterSpacing: "1.2px", fontWeight: 600, opacity: i === active ? 1 : .7,
                }}>{w.phase}</div>
              </button>
            ))}
          </div>

          {/* Active week detail */}
          <div style={{
            padding: "40px 44px", borderRadius: 14,
            background: T.surface, border: `1px solid ${T.border}`,
            display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 56, alignItems: "start",
          }}>
            <div>
              <div style={{
                fontSize: 11, fontFamily: "var(--mono)", color: T.accent,
                letterSpacing: "2px", fontWeight: 700, marginBottom: 18,
              }}>{a.week} · {a.phase}</div>
              <h3 key={active} style={{
                fontSize: 32, fontWeight: 600, color: T.text,
                letterSpacing: "-.025em", lineHeight: 1.15, marginBottom: 24,
                animation: "fadeQuote .4s cubic-bezier(.2,.8,.2,1)",
              }}>{a.title}</h3>
              <p key={`${active}-desc`} style={{
                fontSize: 15.5, lineHeight: 1.7, color: T.textSec,
                animation: "fadeQuote .4s cubic-bezier(.2,.8,.2,1) .05s both",
              }}>{a.detail}</p>
            </div>

            <div style={{
              padding: "28px 24px", borderRadius: 11,
              background: T.surfaceAlt, border: `1px solid ${T.borderSubtle}`,
            }}>
              <div style={{ fontSize: 10.5, fontFamily: "var(--mono)", color: T.textMute, letterSpacing: "1.5px", marginBottom: 12, fontWeight: 600 }}>
                OUTPUT
              </div>
              <div style={{ fontSize: 15, color: T.text, fontWeight: 500, marginBottom: 28, letterSpacing: "-.1px" }}>
                {a.output}
              </div>
              <div style={{ fontSize: 10.5, fontFamily: "var(--mono)", color: T.textMute, letterSpacing: "1.5px", marginBottom: 12, fontWeight: 600 }}>
                ARTIFACT
              </div>
              <div style={{ fontSize: 12.5, fontFamily: "var(--mono)", color: T.accentBright, lineHeight: 1.55, letterSpacing: ".3px" }}>
                {a.artifact}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// REJECTED CONCEPTS — sketches we didn't ship
// ═══════════════════════════════════════════════════════════════════════════
function RejectedSection() {
  const [ref, inView] = useInView(0.1);
  const [hovered, setHovered] = useState(null);

  const rejected = [
    {
      name: "The Unified Inbox",
      thumb: "inbox",
      premise: "Treat all agent actions like emails &mdash; one chronological feed, swipe to approve, swipe to reject.",
      why: "Familiar. Fast. Recognizable mental model.",
      kill: "Familiarity was the bug, not the feature. Email-style flattening hides the exact signal we need to amplify: that a $30 refund and an $847K wire transfer are categorically different objects. Visual flattening becomes cognitive flattening becomes audit theatre.",
      lesson: "Reaching for a familiar metaphor when your job is to teach a new one is a senior-level mistake.",
    },
    {
      name: "The Spatial Canvas",
      thumb: "canvas",
      premise: "Actions float on a 2D plane &mdash; Y-axis is risk, X-axis is time. Drag and drop to triage.",
      why: "Visually distinctive. Felt fresh. Photogenic for the portfolio.",
      kill: "I built it for the screenshot, not for the user. Ops leads don&rsquo;t want a creative interface; they want a fast one. The spatial metaphor adds two clicks for every decision and forces them to learn a new system to do an old job.",
      lesson: "If the interface is more interesting than the work, the interface is wrong.",
    },
    {
      name: "The Co-pilot Sidekick",
      thumb: "copilot",
      premise: 'A persistent AI assistant in the corner that explains each action in natural language: "I think you should approve this because&hellip;"',
      why: "Conversational. Modern. Plays into the AI moment.",
      kill: "It anchors the reviewer. The whole point of risk-proportional oversight is that the human brings independent judgment to the decision &mdash; not that the AI tells them what to do, then asks them to confirm. Adding a chat layer collapses oversight into rubber-stamping with extra steps.",
      lesson: "Adding more AI to an AI governance tool is not the same as solving the problem.",
    },
  ];

  // Tiny abstract thumbnails
  const Thumb = ({ kind }) => {
    const common = { width: "100%", height: 140, viewBox: "0 0 200 140" };
    if (kind === "inbox") return (
      <svg {...common}>
        <rect x="0" y="0" width="200" height="140" fill={T.surfaceAlt} />
        {[20, 44, 68, 92, 116].map((y, i) => (
          <g key={i}>
            <rect x="20" y={y} width="160" height="16" rx="3" fill={T.border} opacity={1 - i * .15} />
            <circle cx="32" cy={y + 8} r="3" fill={T.textMute} opacity={1 - i * .15} />
          </g>
        ))}
      </svg>
    );
    if (kind === "canvas") return (
      <svg {...common}>
        <rect x="0" y="0" width="200" height="140" fill={T.surfaceAlt} />
        <line x1="20" y1="120" x2="180" y2="120" stroke={T.border} strokeWidth="1" />
        <line x1="20" y1="20" x2="20" y2="120" stroke={T.border} strokeWidth="1" />
        <circle cx="50" cy="100" r="6" fill={T.green} opacity=".6" />
        <circle cx="80" cy="80" r="8" fill={T.amber} opacity=".7" />
        <circle cx="120" cy="50" r="10" fill={T.red} opacity=".8" />
        <circle cx="160" cy="40" r="7" fill={T.amber} opacity=".5" />
        <circle cx="100" cy="90" r="5" fill={T.accent} opacity=".5" />
      </svg>
    );
    if (kind === "copilot") return (
      <svg {...common}>
        <rect x="0" y="0" width="200" height="140" fill={T.surfaceAlt} />
        <rect x="20" y="20" width="100" height="40" rx="6" fill={T.border} />
        <rect x="20" y="68" width="80" height="16" rx="3" fill={T.border} opacity=".5" />
        <rect x="130" y="40" width="56" height="86" rx="8" fill={T.accent} opacity=".15" stroke={T.accent} strokeWidth=".5" strokeOpacity=".3" />
        <circle cx="158" cy="60" r="8" fill={T.accent} opacity=".4" />
        <rect x="142" y="76" width="32" height="3" rx="1.5" fill={T.accent} opacity=".4" />
        <rect x="142" y="82" width="24" height="3" rx="1.5" fill={T.accent} opacity=".3" />
      </svg>
    );
    return null;
  };

  return (
    <section ref={ref} id="rejected" style={{ padding: "120px 32px", borderTop: `1px solid ${T.border}`, background: T.bgAlt }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <Eyebrow num="09">Concepts I Killed</Eyebrow>

        <h2 style={{
          fontSize: "clamp(36px, 5vw, 60px)", fontWeight: 600, lineHeight: 1.05, letterSpacing: "-.03em",
          color: T.text, marginBottom: 24, maxWidth: 900,
        }}>
          Three directions I designed,<br />
          <span style={{ color: T.textMute }}>then rejected.</span>
        </h2>
        <p style={{ fontSize: 17, lineHeight: 1.6, color: T.textTer, maxWidth: 760, marginBottom: 56 }}>
          The shape of what survives is defined by what dies. These are the directions I explored, why each one was tempting, and the specific reason I killed it.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
          {rejected.map((r, i) => (
            <div key={i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{
                background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14,
                overflow: "hidden",
                opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(20px)",
                transition: `all .7s cubic-bezier(.2,.8,.2,1) ${i * .1}s`,
                position: "relative",
              }}>
              <div style={{
                position: "relative",
                filter: hovered === i ? "grayscale(0)" : "grayscale(.7)",
                transition: "filter .3s",
              }}>
                <Thumb kind={r.thumb} />
                <div style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(180deg, rgba(0,0,0,0) 50%, rgba(0,0,0,.4) 100%)",
                  pointerEvents: "none",
                }} />
                <div style={{
                  position: "absolute", top: 14, left: 14,
                  padding: "4px 10px", borderRadius: 4,
                  background: T.red, color: "#fff",
                  fontSize: 10, fontFamily: "var(--mono)", letterSpacing: "1.2px", fontWeight: 700,
                }}>REJECTED</div>
              </div>

              <div style={{ padding: "26px 26px 28px" }}>
                <h3 style={{
                  fontSize: 20, fontWeight: 600, color: T.text,
                  letterSpacing: "-.02em", marginBottom: 12, lineHeight: 1.2,
                }}>{r.name}</h3>
                <p style={{ fontSize: 13.5, color: T.textTer, lineHeight: 1.55, marginBottom: 20 }}
                  dangerouslySetInnerHTML={{ __html: r.premise }} />

                <div style={{ marginBottom: 16, paddingTop: 16, borderTop: `1px solid ${T.borderSubtle}` }}>
                  <div style={{ fontSize: 9.5, fontFamily: "var(--mono)", color: T.textMute, letterSpacing: "1.5px", marginBottom: 6, fontWeight: 700 }}>
                    WHY IT WAS TEMPTING
                  </div>
                  <p style={{ fontSize: 12.5, color: T.textSec, lineHeight: 1.5 }}>{r.why}</p>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 9.5, fontFamily: "var(--mono)", color: T.red, letterSpacing: "1.5px", marginBottom: 6, fontWeight: 700 }}>
                    WHY I KILLED IT
                  </div>
                  <p style={{ fontSize: 12.5, color: T.textSec, lineHeight: 1.55 }}>{r.kill}</p>
                </div>

                <div style={{ paddingTop: 14, borderTop: `1px solid ${T.borderSubtle}` }}>
                  <div style={{ fontSize: 9.5, fontFamily: "var(--mono)", color: T.accent, letterSpacing: "1.5px", marginBottom: 6, fontWeight: 700 }}>
                    LESSON
                  </div>
                  <p style={{ fontSize: 12.5, color: T.text, lineHeight: 1.5, fontStyle: "italic", fontWeight: 450 }}>
                    &ldquo;{r.lesson}&rdquo;
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// I WAS WRONG — vulnerability section
// ═══════════════════════════════════════════════════════════════════════════
function WrongSection() {
  const [ref, inView] = useInView(0.15);

  return (
    <section ref={ref} id="wrong" style={{ padding: "120px 32px", borderTop: `1px solid ${T.border}` }}>
      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        <Eyebrow num="10">Where I Was Wrong</Eyebrow>

        <div style={{
          padding: "56px 64px", borderRadius: 16,
          background: `linear-gradient(135deg, ${T.surface} 0%, ${T.bgAlt} 100%)`,
          border: `1px solid ${T.border}`, position: "relative",
          opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(24px)",
          transition: "all .8s cubic-bezier(.2,.8,.2,1)",
        }}>
          <div style={{
            position: "absolute", top: 24, right: 28,
            fontSize: 12, fontFamily: "var(--mono)", color: T.textMute,
            letterSpacing: "1.5px", fontWeight: 600,
          }}>v1 → v2 → v3</div>

          <h2 style={{
            fontSize: "clamp(34px, 4vw, 50px)", fontWeight: 600, lineHeight: 1.1, letterSpacing: "-.025em",
            color: T.text, marginBottom: 36,
          }}>
            v1 had the &ldquo;Recommended action&rdquo;<br />
            card <em style={{ fontStyle: "italic", color: T.accent }}>at the top of the modal</em>.
          </h2>

          <div style={{ fontSize: 17, lineHeight: 1.7, color: T.textSec, fontWeight: 400 }}>
            <p style={{ marginBottom: 20 }}>
              It was the first thing reviewers saw. Big indigo card. <em>&ldquo;Recommendation: Approve. Based on 14 similar cases, 100% were approved.&rdquo;</em> I shipped it because it felt helpful, decisive, AI-native.
            </p>
            <p style={{ marginBottom: 20 }}>
              A senior designer in critique watched me walk through the flow and said, flatly: <strong style={{ color: T.text, fontWeight: 600 }}>&ldquo;You just told the human what to think before showing them anything to think about. That&rsquo;s not oversight. That&rsquo;s anchoring bias with a checkbox.&rdquo;</strong>
            </p>
            <p style={{ marginBottom: 28 }}>
              They were right. The recommendation has to come <em>after</em> the reasoning trail, the impact assessment, and the precedent &mdash; not before. Putting it first turned the entire interface into confirmation theatre. Putting it last made it a tie-breaker for the genuinely ambiguous cases.
            </p>

            <div style={{
              padding: "24px 28px", borderRadius: 11,
              background: T.surfaceAlt, border: `1px solid ${T.border}`,
              fontSize: 15.5, lineHeight: 1.6, color: T.text, fontStyle: "italic",
              borderLeft: `3px solid ${T.accent}`,
            }}>
              The fix was a four-line code change. The lesson was bigger: in a governance interface, <strong style={{ fontStyle: "normal", fontWeight: 600 }}>the order of information is a moral decision, not a layout decision.</strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
// ═══════════════════════════════════════════════════════════════════════════
// BROWSER FRAME — premium chrome wrapper
// ═══════════════════════════════════════════════════════════════════════════
function BrowserFrame({ children, label, version }) {
  return (
    <div style={{
      borderRadius: 14, overflow: "hidden",
      background: M.bg, border: `1px solid ${M.border}`,
      boxShadow: "0 32px 72px rgba(50,50,93,.15), 0 12px 24px rgba(0,0,0,.1)",
    }}>
      {/* Chrome */}
      <div style={{
        padding: "11px 16px", background: "#FFFFFF", borderBottom: `1px solid ${M.border}`,
        display: "flex", alignItems: "center", gap: 12,
      }}>
        <div style={{ display: "flex", gap: 7 }}>
          <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#FF5F57" }} />
          <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#FEBC2E" }} />
          <span style={{ width: 11, height: 11, borderRadius: "50%", background: "#28C840" }} />
        </div>
        <div style={{ flex: 1 }} />
        {label && (
          <div style={{
            fontSize: 11, fontFamily: "var(--mono)", color: M.textTer,
            padding: "4px 12px", background: M.surfaceAlt, borderRadius: 6,
            border: `1px solid ${M.borderSubtle}`, letterSpacing: ".4px", fontWeight: 500,
          }}>{label}</div>
        )}
        {version && (
          <div style={{
            fontSize: 9.5, fontFamily: "var(--mono)", color: M.accent,
            padding: "4px 9px", background: M.accentLight, borderRadius: 5,
            border: `1px solid ${M.accentBorder}`, letterSpacing: "1px", fontWeight: 700,
          }}>{version}</div>
        )}
      </div>
      <div style={{ background: M.bg, position: "relative" }}>
        {children}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// STRIPE-INSPIRED PALETTE — warm, confident, commercial premium
// ═══════════════════════════════════════════════════════════════════════════
const M = {
  // Surfaces — warm off-whites, not flat gray
  bg: "#F6F8FB",           // warm cool-tinted background
  surface: "#FFFFFF",      // pure white cards
  surfaceAlt: "#F6F9FC",   // slight blue-cool tint for hover/secondary surfaces
  surfaceMuted: "#EBEEF3",
  // Borders — subtle, layered
  border: "#E3E8EE",
  borderSubtle: "#F0F2F5",
  borderStrong: "#D5DBE1",
  // Text — tight hierarchy, more contrast
  text: "#0A2540",         // deep navy-charcoal, the Stripe signature
  textSec: "#425466",
  textTer: "#697386",
  textMute: "#8898AA",
  textFaint: "#ADBDCC",
  // Primary accent — Stripe's confident indigo
  accent: "#635BFF",
  accentDark: "#4F46E5",
  accentLight: "#EFEEFF",
  accentSoft: "#E0DEFF",
  accentBorder: "#C7C2FF",
  accentText: "#3F3596",
  // Semantic — warmer, more intentional than v3
  red: "#DF1B41",
  redLight: "#FFF5F7",
  redSoft: "#FDE2E7",
  redBorder: "#F8C9D2",
  redText: "#A8002B",
  amber: "#BB5504",
  amberLight: "#FFF8EC",
  amberSoft: "#FCEBC1",
  amberBorder: "#F2D89A",
  amberText: "#7C3F02",
  green: "#0E8345",
  greenLight: "#EFFCEF",
  greenSoft: "#D7F7C2",
  greenBorder: "#9BD898",
  greenText: "#006908",
  // Stripe-y gradient endpoints
  gradStart: "#635BFF",
  gradEnd: "#A78BFA",
  // Shadow system — Stripe's signature layered depth
  shadow1: "0 1px 2px rgba(50,50,93,.08), 0 1px 1px rgba(0,0,0,.04)",
  shadow2: "0 2px 5px rgba(50,50,93,.1), 0 1px 2px rgba(0,0,0,.05)",
  shadow3: "0 6px 20px rgba(50,50,93,.12), 0 2px 6px rgba(0,0,0,.04)",
  shadowGlow: "0 0 0 4px rgba(99,91,255,.08)",
};

function MiniBadge({ children, tone = "accent", dot, solid }) {
  const map = {
    accent: [M.accentLight, M.accentText, M.accentBorder],
    red: [M.redLight, M.redText, M.redBorder],
    amber: [M.amberLight, M.amberText, M.amberBorder],
    green: [M.greenLight, M.greenText, M.greenBorder],
    mute: [M.surfaceAlt, M.textTer, M.borderSubtle],
  };
  const [bg, fg, bd] = map[tone];
  return (
    <span style={{
      fontSize: 9, fontWeight: 700, fontFamily: "var(--mono)", letterSpacing: ".5px",
      padding: "2px 7px", borderRadius: 4,
      background: solid ? fg : bg,
      color: solid ? "#fff" : fg,
      border: solid ? "none" : `1px solid ${bd}`,
      display: "inline-flex", alignItems: "center", gap: 4, whiteSpace: "nowrap",
      textTransform: "uppercase",
    }}>
      {dot && <span style={{ width: 4, height: 4, borderRadius: "50%", background: solid ? "#fff" : fg }} />}
      {children}
    </span>
  );
}

function MiniRiskRing({ risk, level, size = 36 }) {
  const c = level === 4 ? M.red : risk >= 65 ? M.amber : M.accent;
  const r = (size - 4) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (risk / 100) * circ;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} stroke={M.borderSubtle} strokeWidth={2} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={c} strokeWidth={2.5} fill="none"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 9, fontFamily: "var(--mono)", fontWeight: 700, color: c, letterSpacing: "-.3px",
      }}>L{level}</div>
    </div>
  );
}

function MiniConfBar({ value }) {
  const c = value >= 90 ? M.green : value >= 70 ? M.amber : M.red;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ width: 40, height: 3, background: M.surfaceMuted, borderRadius: 2, overflow: "hidden" }}>
        <div style={{ width: `${value}%`, height: "100%", background: c, borderRadius: 2 }} />
      </div>
      <span style={{ fontSize: 8.5, fontFamily: "var(--mono)", color: c, fontWeight: 700, minWidth: 22 }}>{value}%</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SCREEN: DASHBOARD MOCKUP — Stripe direction
// ═══════════════════════════════════════════════════════════════════════════
function DashboardScreen() {
  // Real spark chart data
  const spark = [22, 28, 24, 31, 38, 34, 42, 38, 45, 52, 48, 56, 61, 58, 65, 71, 68, 74, 78, 73, 81, 76, 84, 89];
  const sparkMax = Math.max(...spark);
  const sparkW = 280, sparkH = 50;
  const sparkPts = spark.map((v, i) => [i * (sparkW / (spark.length - 1)), sparkH - (v / sparkMax) * (sparkH - 8) - 4]);
  const sparkPath = "M " + sparkPts.map(p => p.join(" ")).join(" L ");
  const sparkArea = sparkPath + ` L ${sparkW} ${sparkH} L 0 ${sparkH} Z`;

  return (
    <div style={{
      display: "grid", gridTemplateColumns: "184px 1fr",
      fontFamily: "var(--body)", color: M.text, minHeight: 580,
    }}>
      {/* Sidebar */}
      <aside style={{
        background: M.surface, borderRight: `1px solid ${M.border}`,
        padding: "14px 11px", display: "flex", flexDirection: "column",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "2px 4px 14px", borderBottom: `1px solid ${M.borderSubtle}` }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: `linear-gradient(135deg, ${M.accent} 0%, ${M.gradEnd} 100%)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 4px 10px ${M.accent}40`,
            position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(255,255,255,.25) 0%, transparent 50%)" }} />
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ position: "relative" }}>
              <path d="M9 12.75L11.25 15 15 9.75M12 2.71a11.96 11.96 0 01-8.4 3.29c-.4 1.18-.6 2.43-.6 3.75 0 5.59 3.82 10.29 9 11.62 5.18-1.33 9-6.03 9-11.62 0-1.31-.21-2.57-.6-3.75A11.96 11.96 0 0112 2.71z" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "-.3px", color: M.text }}>Control Room</div>
            <div style={{ fontSize: 7.5, color: M.textMute, fontFamily: "var(--mono)", letterSpacing: ".4px", marginTop: 1 }}>v3.0 · ENTERPRISE</div>
          </div>
        </div>

        <div style={{ fontSize: 7.5, fontFamily: "var(--mono)", fontWeight: 700, letterSpacing: "1.6px", color: M.textMute, padding: "12px 7px 5px" }}>OPERATE</div>
        {[
          { i: "home", l: "Dashboard", active: true },
          { i: "bolt", l: "Action Queue", badge: 4 },
          { i: "cube", l: "Agent Fleet" },
        ].map((item, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 8, padding: "5px 8px", borderRadius: 6,
            background: item.active ? M.accentLight : "transparent",
            color: item.active ? M.accent : M.textSec,
            fontSize: 11, fontWeight: item.active ? 600 : 500, marginBottom: 1,
            position: "relative", letterSpacing: "-.1px",
          }}>
            {item.active && <div style={{ position: "absolute", left: -7, top: "26%", bottom: "26%", width: 2.5, borderRadius: 1.5, background: M.accent }} />}
            <div style={{ width: 13, height: 13, opacity: item.active ? 1 : .65 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={item.active ? 2 : 1.7} strokeLinecap="round" strokeLinejoin="round">
                {item.i === "home" && <path d="M2.25 12l8.954-8.955a1.5 1.5 0 012.122 0L22.28 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75" />}
                {item.i === "bolt" && <path d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />}
                {item.i === "cube" && <path d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25" />}
              </svg>
            </div>
            <span style={{ flex: 1 }}>{item.l}</span>
            {item.badge && <span style={{ fontSize: 8.5, padding: "1px 6px", background: M.red, color: "#fff", borderRadius: 4, fontFamily: "var(--mono)", fontWeight: 700, letterSpacing: ".3px" }}>{item.badge}</span>}
          </div>
        ))}

        <div style={{ fontSize: 7.5, fontFamily: "var(--mono)", fontWeight: 700, letterSpacing: "1.6px", color: M.textMute, padding: "12px 7px 5px" }}>GOVERN</div>
        {[
          { l: "Guard Rules" },
          { l: "Teach Mode" },
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 8px", color: M.textSec, fontSize: 11, fontWeight: 500, letterSpacing: "-.1px" }}>
            <div style={{ width: 13, height: 13, opacity: .55, background: "currentColor", borderRadius: 2 }} />
            <span>{item.l}</span>
          </div>
        ))}

        <div style={{ fontSize: 7.5, fontFamily: "var(--mono)", fontWeight: 700, letterSpacing: "1.6px", color: M.textMute, padding: "12px 7px 5px" }}>OBSERVE</div>
        {[
          { l: "Analytics" },
          { l: "Audit Log" },
        ].map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 8px", color: M.textSec, fontSize: 11, fontWeight: 500, letterSpacing: "-.1px" }}>
            <div style={{ width: 13, height: 13, opacity: .55, background: "currentColor", borderRadius: 2 }} />
            <span>{item.l}</span>
          </div>
        ))}

        {/* User block */}
        <div style={{ marginTop: "auto", padding: "10px 4px 2px", borderTop: `1px solid ${M.borderSubtle}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div style={{
              width: 22, height: 22, borderRadius: "50%",
              background: `linear-gradient(135deg, ${M.accent}, ${M.gradEnd})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff", fontSize: 8.5, fontWeight: 700, fontFamily: "var(--mono)",
            }}>AC</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: M.text, letterSpacing: "-.1px" }}>Alex Chen</div>
              <div style={{ fontSize: 8, color: M.textTer, fontFamily: "var(--mono)" }}>Ops Lead</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ overflow: "hidden" }}>
        {/* Header */}
        <header style={{
          padding: "11px 22px", height: 44, borderBottom: `1px solid ${M.border}`,
          display: "flex", alignItems: "center", gap: 9, background: M.surface,
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: M.text, letterSpacing: "-.25px" }}>Dashboard</div>
          <MiniBadge tone="mute">LIVE</MiniBadge>
          <div style={{ flex: 1 }} />
          <div style={{
            display: "flex", alignItems: "center", gap: 6, padding: "4px 10px",
            background: M.surfaceAlt, border: `1px solid ${M.border}`, borderRadius: 7, fontSize: 10, color: M.textTer,
            minWidth: 130,
          }}>
            <span>Search…</span>
            <div style={{ flex: 1 }} />
            <kbd style={{ fontSize: 8, padding: "1px 5px", background: M.surface, border: `1px solid ${M.border}`, borderRadius: 3.5, fontFamily: "var(--mono)", fontWeight: 600 }}>⌘K</kbd>
          </div>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "0 11px", height: 26, borderRadius: 6, background: M.red, color: "#fff",
            fontSize: 10, fontWeight: 600, letterSpacing: "-.05px",
            boxShadow: `0 1px 3px ${M.red}40`,
          }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#fff" }} />
            1 Critical
          </div>
        </header>

        <div style={{ padding: "20px 22px" }}>
          {/* 4-stat grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 11, marginBottom: 16 }}>
            {[
              { l: "Exposure Blocked", v: "$859K", sub: "4 actions awaiting review", color: M.text, accent: M.red, glow: true },
              { l: "Auto-Resolved", v: "99.9%", sub: "5,432 actions / 24h", color: M.text, accent: M.green },
              { l: "False Positive Rate", v: "2.1%", sub: "↓ 18% vs last month", color: M.text, accent: M.green, trend: true },
              { l: "MTID", v: "4m 12s", sub: "mean time to decision", color: M.text },
            ].map((s, i) => (
              <div key={i} style={{
                background: M.surface, border: `1px solid ${s.glow ? M.redBorder : M.border}`, borderRadius: 9, padding: "14px 14px",
                boxShadow: s.glow ? `${M.shadow1}, 0 0 0 3px rgba(223,27,65,.06)` : M.shadow1,
                position: "relative", overflow: "hidden",
              }}>
                {s.glow && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: M.red }} />}
                <div style={{ fontSize: 9.5, fontWeight: 600, color: M.textTer, marginBottom: 7, letterSpacing: "-.05px", textTransform: "none" }}>{s.l}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 5 }}>
                  <div style={{ fontSize: 22, fontWeight: 700, color: s.color, lineHeight: 1, letterSpacing: "-.7px", fontFamily: "var(--body)" }}>{s.v}</div>
                </div>
                <div style={{ fontSize: 9, color: s.accent || M.textTer, fontWeight: s.accent ? 600 : 500, fontFamily: s.accent ? "var(--mono)" : "var(--body)", letterSpacing: ".1px" }}>{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Critical banner */}
          <div style={{
            background: M.surface, border: `1px solid ${M.redBorder}`,
            borderRadius: 9, padding: "10px 14px",
            display: "flex", alignItems: "center", gap: 11, marginBottom: 16,
            position: "relative", overflow: "hidden",
            boxShadow: M.shadow1,
          }}>
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: M.red }} />
            <div style={{
              width: 28, height: 28, borderRadius: 7, background: M.redLight,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={M.red} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 650, color: M.text, letterSpacing: "-.15px", marginBottom: 1 }}>1 critical action awaiting your review</div>
              <div style={{ fontSize: 10, color: M.textTer, fontWeight: 500 }}>Pre-execution window closes in under 6 hours.</div>
            </div>
            <div style={{
              padding: "6px 12px", background: M.red, color: "#fff",
              fontSize: 10, fontWeight: 600, borderRadius: 6, letterSpacing: "-.05px",
              boxShadow: `0 1px 3px ${M.red}40`,
            }}>Review →</div>
          </div>

          {/* Two columns */}
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 11 }}>
            {/* Pending actions */}
            <div style={{ background: M.surface, border: `1px solid ${M.border}`, borderRadius: 9, boxShadow: M.shadow1 }}>
              <div style={{ padding: "10px 14px", borderBottom: `1px solid ${M.border}`, display: "flex", alignItems: "center", gap: 7 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={M.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
                <div style={{ fontSize: 11, fontWeight: 650, color: M.text, letterSpacing: "-.15px", flex: 1 }}>Pending actions</div>
                <span style={{ fontSize: 9, fontFamily: "var(--mono)", color: M.textTer, letterSpacing: ".4px" }}>VIEW QUEUE →</span>
              </div>
              {[
                { agent: "FinanceBot", title: "Wire transfer — $847,000", time: "4h 53m", risk: 94, level: 4, critical: true },
                { agent: "RefundBot", title: "Process refund — $12,400", time: "5h 45m", risk: 72, level: 3 },
                { agent: "AccessBot", title: "Grant API access — TechPartner", time: "5h 06m", risk: 65, level: 3 },
                { agent: "EmailBot", title: "Bulk pricing update — 340 clients", time: "3h 12m", risk: 45, level: 3 },
              ].map((a, i) => (
                <div key={i} style={{
                  padding: "10px 14px", borderBottom: i < 3 ? `1px solid ${M.borderSubtle}` : "none",
                  display: "flex", alignItems: "center", gap: 11,
                  borderLeft: a.critical ? `3px solid ${M.red}` : "3px solid transparent",
                }}>
                  <MiniRiskRing risk={a.risk} level={a.level} size={30} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2 }}>
                      <span style={{ fontSize: 8.5, fontFamily: "var(--mono)", fontWeight: 700, color: M.textTer, letterSpacing: ".3px" }}>{a.agent}</span>
                      {a.critical && <MiniBadge tone="red" dot>CRITICAL</MiniBadge>}
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: M.text, letterSpacing: "-.15px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.title}</div>
                  </div>
                  <div style={{ fontSize: 8.5, fontFamily: "var(--mono)", color: M.textTer, fontWeight: 500 }}>{a.time}</div>
                </div>
              ))}
            </div>

            {/* Volume chart card */}
            <div style={{ background: M.surface, border: `1px solid ${M.border}`, borderRadius: 9, padding: "12px 14px", boxShadow: M.shadow1 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 9.5, fontWeight: 600, color: M.textTer, marginBottom: 4 }}>Action volume · 24h</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 7 }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: M.text, letterSpacing: "-.5px", lineHeight: 1 }}>5,432</div>
                    <span style={{ fontSize: 9, fontFamily: "var(--mono)", color: M.green, fontWeight: 700 }}>↑ 12.4%</span>
                  </div>
                </div>
                <MiniBadge tone="mute">7 AGENTS</MiniBadge>
              </div>
              {/* Spark chart */}
              <svg width="100%" height={sparkH} viewBox={`0 0 ${sparkW} ${sparkH}`} preserveAspectRatio="none" style={{ display: "block", marginBottom: 8 }}>
                <defs>
                  <linearGradient id="sparkFillStripe" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={M.accent} stopOpacity=".25" />
                    <stop offset="100%" stopColor={M.accent} stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d={sparkArea} fill="url(#sparkFillStripe)" />
                <path d={sparkPath} fill="none" stroke={M.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx={sparkPts[sparkPts.length - 1][0]} cy={sparkPts[sparkPts.length - 1][1]} r="3" fill={M.surface} stroke={M.accent} strokeWidth="1.5" />
              </svg>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 8, fontFamily: "var(--mono)", color: M.textMute, letterSpacing: ".3px" }}>
                <span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>NOW</span>
              </div>

              {/* Mini agent fleet list */}
              <div style={{ marginTop: 11, paddingTop: 10, borderTop: `1px solid ${M.borderSubtle}` }}>
                <div style={{ fontSize: 8.5, fontFamily: "var(--mono)", fontWeight: 700, letterSpacing: "1px", color: M.textMute, marginBottom: 6 }}>AGENT FLEET</div>
                {[
                  { name: "RefundBot", last: "Refund #8812 — $89", active: true },
                  { name: "SupportBot", last: "Ticket #4421 resolved", active: true },
                  { name: "FinanceBot", last: "Wire transfer HELD", active: false },
                ].map((a, i) => (
                  <div key={i} style={{ padding: "5px 0", display: "flex", alignItems: "center", gap: 7, borderBottom: i < 2 ? `1px solid ${M.borderSubtle}` : "none" }}>
                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: a.active ? M.green : M.amber, flexShrink: 0, boxShadow: a.active ? `0 0 0 2.5px ${M.green}25` : "none" }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 10, fontWeight: 600, color: M.text, letterSpacing: "-.1px" }}>{a.name}</div>
                      <div style={{ fontSize: 8.5, color: M.textTer, fontFamily: "var(--mono)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.last}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SCREEN: QUEUE MOCKUP — Stripe direction
// ═══════════════════════════════════════════════════════════════════════════
function QueueScreen() {
  return (
    <div style={{ fontFamily: "var(--body)", color: M.text, minHeight: 580, padding: "20px 22px" }}>
      {/* Filter strip */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <div style={{ display: "flex", background: M.surface, border: `1px solid ${M.border}`, borderRadius: 7, padding: 3, boxShadow: M.shadow1 }}>
          {[
            { l: "All", count: 4, active: true },
            { l: "Critical", count: 1 },
            { l: "Standard", count: 3 },
          ].map((f, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "5px 11px", borderRadius: 5,
              background: f.active ? M.accent : "transparent",
              color: f.active ? "#fff" : M.textSec,
              fontSize: 10.5, fontWeight: f.active ? 600 : 500, letterSpacing: "-.1px",
              boxShadow: f.active ? `0 1px 3px ${M.accent}40` : "none",
            }}>
              {f.l}
              <span style={{
                fontSize: 9, fontFamily: "var(--mono)", fontWeight: 700,
                padding: "0 5px", borderRadius: 3, minWidth: 16, textAlign: "center",
                background: f.active ? "rgba(255,255,255,.2)" : M.surfaceMuted,
                color: f.active ? "#fff" : M.textTer,
              }}>{f.count}</span>
            </div>
          ))}
        </div>
        <div style={{ flex: 1 }} />
        <div style={{
          padding: "5px 10px", background: M.surface, border: `1px solid ${M.border}`, borderRadius: 6,
          fontSize: 10, color: M.textSec, fontWeight: 500, display: "flex", alignItems: "center", gap: 5,
          boxShadow: M.shadow1,
        }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={M.textTer} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          Reset demo
        </div>
      </div>

      {/* Degradation banner */}
      <div style={{
        display: "flex", alignItems: "center", gap: 9,
        padding: "8px 12px", marginBottom: 12, borderRadius: 7,
        background: M.amberLight, border: `1px solid ${M.amberBorder}`,
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: M.amber }} />
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={M.amber} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
        <span style={{ fontSize: 10, color: M.amberText, flex: 1, fontWeight: 500, letterSpacing: "-.05px" }}>
          FinanceBot connection degraded · queue may be incomplete · last sync 2m ago
        </span>
        <span style={{ fontSize: 9.5, fontFamily: "var(--mono)", color: M.amberText, fontWeight: 700, textDecoration: "underline", letterSpacing: ".3px" }}>RETRY</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 12 }}>
        {/* Action cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { agent: "FinanceBot", title: "Wire transfer — $847,000", desc: "Transfer to unrecognized vendor account.", time: "4h 53m", risk: 94, level: 4, tags: [">$100K", "UNKNOWN", "AI-SRC"], flags: 2, critical: true },
            { agent: "RefundBot", title: "Process refund — $12,400", desc: "Customer refund exceeds $5K threshold.", time: "5h 45m", risk: 72, level: 3, tags: ["AI-SRC", "THRESHOLD"], flags: 1, active: true },
            { agent: "AccessBot", title: "Grant API access — TechPartner", desc: "First-time vendor requesting prod API.", time: "5h 06m", risk: 65, level: 3, tags: ["NEW VENDOR", "NO AUDIT"], flags: 1 },
            { agent: "EmailBot", title: "Bulk pricing update — 340 clients", desc: "Enterprise pricing update. Brand-verified.", time: "3h 12m", risk: 45, level: 3, tags: ["BULK", "VERIFIED"], flags: 0 },
          ].map((a, i) => (
            <div key={i} style={{
              background: a.active ? M.surfaceAlt : M.surface,
              border: `1px solid ${a.active ? M.accentBorder : a.critical ? M.redBorder : M.border}`,
              borderRadius: 9, padding: 12,
              boxShadow: a.critical ? `${M.shadow1}, 0 0 0 3px rgba(223,27,65,.06)` : a.active ? `${M.shadow2}` : M.shadow1,
              borderLeft: a.critical ? `3px solid ${M.red}` : a.active ? `3px solid ${M.accent}` : "3px solid transparent",
              position: "relative", overflow: "hidden",
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 11 }}>
                <MiniRiskRing risk={a.risk} level={a.level} size={34} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    <span style={{ fontSize: 9, fontFamily: "var(--mono)", fontWeight: 700, color: M.textSec, letterSpacing: ".4px" }}>{a.agent}</span>
                    <span style={{ fontSize: 9, color: M.textFaint }}>·</span>
                    <span style={{ fontSize: 9, color: M.textTer, fontFamily: "var(--mono)", fontWeight: 500 }}>{a.time} left</span>
                    <div style={{ flex: 1 }} />
                    <MiniBadge tone={a.critical ? "red" : "amber"} dot>{a.critical ? "CRITICAL" : "REVIEW"}</MiniBadge>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 650, color: M.text, letterSpacing: "-.2px", marginBottom: 4 }}>{a.title}</div>
                  <div style={{ fontSize: 10, color: M.textSec, lineHeight: 1.5, marginBottom: 8 }}>{a.desc}</div>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap", alignItems: "center" }}>
                    {a.tags.map(t => <MiniBadge key={t} tone={a.critical ? "red" : "amber"}>{t}</MiniBadge>)}
                    {a.flags > 0 && <MiniBadge tone="red" dot>{a.flags} FLAG{a.flags > 1 ? "S" : ""}</MiniBadge>}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Detail panel */}
        <div style={{ background: M.surface, border: `1px solid ${M.border}`, borderRadius: 9, overflow: "hidden", boxShadow: M.shadow2 }}>
          <div style={{ padding: "10px 14px", borderBottom: `1px solid ${M.border}`, display: "flex", alignItems: "center" }}>
            <div style={{ fontSize: 11, fontWeight: 650, color: M.text, letterSpacing: "-.15px", flex: 1 }}>Decision review</div>
            <div style={{ width: 18, height: 18, borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", color: M.textTer }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
          <div style={{ padding: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 650, color: M.text, letterSpacing: "-.2px", marginBottom: 4 }}>Process refund — $12,400</div>
            <div style={{ fontSize: 10.5, color: M.textSec, lineHeight: 1.5, marginBottom: 14 }}>Customer refund exceeds $5K threshold. One source in reasoning chain is AI-interpreted policy.</div>

            <div style={{ fontSize: 8.5, fontFamily: "var(--mono)", fontWeight: 700, letterSpacing: "1.4px", color: M.textTer, marginBottom: 7 }}>REASONING TRAIL</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 12 }}>
              {[
                { step: "Customer complaint — purchase #9214", src: "Zendesk", conf: 88, ok: true },
                { step: "Matched return policy §4.2", src: "Knowledge base", conf: 92, ok: true },
                { step: "Policy allows refund <90 days", src: "AI interpretation", conf: 78, ok: false },
                { step: "Calculated refund: $12,400", src: "Billing DB", conf: 100, ok: true },
              ].map((r, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "flex-start", gap: 7,
                  padding: "6px 9px", borderRadius: 5,
                  background: r.ok ? M.surfaceAlt : M.redLight,
                  border: `1px solid ${r.ok ? M.borderSubtle : M.redBorder}`,
                  borderLeft: r.ok ? `1px solid ${M.borderSubtle}` : `2.5px solid ${M.red}`,
                }}>
                  <div style={{
                    width: 14, height: 14, borderRadius: "50%", flexShrink: 0,
                    background: r.ok ? M.greenLight : M.redSoft,
                    display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1,
                  }}>
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke={r.ok ? M.green : M.red} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      {r.ok ? <path d="M4.5 12.75l6 6 9-13.5" /> : <path d="M12 9v3.75m0 3.75h.008" />}
                    </svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 9.5, color: r.ok ? M.text : M.redText, fontWeight: r.ok ? 500 : 650, lineHeight: 1.35 }}>{r.step}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
                      <span style={{ fontSize: 8, fontFamily: "var(--mono)", color: M.textTer, fontWeight: 500 }}>{r.src}</span>
                      <MiniConfBar value={r.conf} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{
              padding: "8px 11px", borderRadius: 6,
              background: M.accentLight, border: `1px solid ${M.accentBorder}`,
              display: "flex", alignItems: "flex-start", gap: 8,
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={M.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: 1, flexShrink: 0 }}>
                <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
              </svg>
              <div>
                <div style={{ fontSize: 9.5, fontWeight: 650, color: M.accentText, marginBottom: 2, letterSpacing: "-.05px" }}>Recommended: Approve</div>
                <div style={{ fontSize: 9, color: M.accentText, opacity: .85, lineHeight: 1.4 }}>Based on 14 similar cases, most were approved. Avg review time: 2m 08s.</div>
              </div>
            </div>
          </div>
          <div style={{ padding: "10px 14px", borderTop: `1px solid ${M.border}`, background: M.surfaceAlt, display: "flex", gap: 6 }}>
            <div style={{
              flex: 1, padding: "7px 0", textAlign: "center", borderRadius: 6,
              fontSize: 10, fontWeight: 600, color: M.redText,
              background: M.surface, border: `1px solid ${M.redBorder}`,
            }}>Reject</div>
            <div style={{
              flex: 1, padding: "7px 0", textAlign: "center", borderRadius: 6,
              fontSize: 10, fontWeight: 600, color: "#fff",
              background: M.accent, boxShadow: `0 1px 3px ${M.accent}40`,
            }}>Approve</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SCREEN: AGENTS MOCKUP — Stripe direction
// ═══════════════════════════════════════════════════════════════════════════
function AgentsScreen() {
  return (
    <div style={{ fontFamily: "var(--body)", color: M.text, minHeight: 580, padding: "20px 22px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 11 }}>
        {[
          { name: "RefundBot", dept: "Finance", uptime: 99.8, tasks: 847, level: 3, last: "Refund #8812 — $89", active: true },
          { name: "SupportBot", dept: "Customer Experience", uptime: 99.9, tasks: 1203, level: 2, last: "Ticket #4421 resolved", active: true },
          { name: "FinanceBot", dept: "Finance", uptime: 94.2, tasks: 234, level: 4, last: "Wire transfer HELD", active: false },
        ].map((a, i) => (
          <div key={i} style={{
            background: M.surface, border: `1px solid ${M.border}`, borderRadius: 10, padding: 14,
            boxShadow: M.shadow1, position: "relative", overflow: "hidden",
          }}>
            {/* Top accent stripe */}
            <div style={{
              position: "absolute", top: 0, left: 0, right: 0, height: 2.5,
              background: a.active
                ? `linear-gradient(90deg, ${M.accent}, ${M.gradEnd})`
                : M.amber,
            }} />

            <div style={{ display: "flex", alignItems: "flex-start", gap: 9, marginBottom: 11, marginTop: 2 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 8,
                background: a.active
                  ? `linear-gradient(135deg, ${M.accent} 0%, ${M.gradEnd} 100%)`
                  : M.amberLight,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                boxShadow: a.active ? `0 4px 10px ${M.accent}35` : "none",
                position: "relative", overflow: "hidden",
              }}>
                {a.active && <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(255,255,255,.25), transparent 50%)" }} />}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={a.active ? "#fff" : M.amber} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ position: "relative" }}>
                  <path d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 650, color: M.text, letterSpacing: "-.2px" }}>{a.name}</span>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: a.active ? M.green : M.amber, boxShadow: a.active ? `0 0 0 3px ${M.green}25` : "none" }} />
                </div>
                <div style={{ fontSize: 9.5, color: M.textTer, fontFamily: "var(--mono)", marginTop: 2, fontWeight: 500, letterSpacing: ".2px" }}>{a.dept.toUpperCase()} · {a.uptime}% UPTIME</div>
              </div>
              {/* Toggle */}
              <div style={{
                width: 28, height: 16, borderRadius: 8,
                background: a.active ? M.accent : M.surfaceMuted,
                padding: 1.5, position: "relative",
                boxShadow: a.active ? `0 0 0 3px ${M.accent}15` : "none",
                transition: "all .2s",
              }}>
                <div style={{
                  width: 13, height: 13, borderRadius: "50%", background: "#fff",
                  transform: a.active ? "translateX(12px)" : "translateX(0)",
                  transition: "transform .2s",
                  boxShadow: "0 1px 2px rgba(0,0,0,.2)",
                }} />
              </div>
            </div>

            {/* Last action */}
            <div style={{
              fontSize: 9.5, color: M.textSec, padding: "7px 9px",
              background: M.surfaceAlt,
              borderRadius: 6, marginBottom: 11, fontFamily: "var(--mono)",
              border: `1px solid ${M.borderSubtle}`,
              display: "flex", alignItems: "center", gap: 7,
            }}>
              <span style={{ fontSize: 7.5, color: M.textMute, fontWeight: 700, letterSpacing: ".4px" }}>LAST</span>
              <span style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", letterSpacing: "-.05px" }}>{a.last}</span>
            </div>

            {/* Autonomy */}
            <div style={{ fontSize: 8.5, fontFamily: "var(--mono)", fontWeight: 700, letterSpacing: "1.4px", color: M.textTer, marginBottom: 7 }}>AUTONOMY</div>
            <div style={{ display: "flex", gap: 4, marginBottom: 7 }}>
              {[1, 2, 3, 4].map(l => (
                <div key={l} style={{
                  flex: 1, padding: "6px 0", borderRadius: 5,
                  background: l <= a.level ? (l === 4 ? M.red : l === 3 ? M.amber : M.accent) : M.surfaceMuted,
                  color: l <= a.level ? "#fff" : M.textTer,
                  fontSize: 9, fontWeight: 700, fontFamily: "var(--mono)", textAlign: "center",
                  letterSpacing: ".4px",
                  boxShadow: l === a.level ? `0 1px 3px ${l === 4 ? M.red : l === 3 ? M.amber : M.accent}40` : "none",
                }}>L{l}</div>
              ))}
            </div>
            <div style={{ fontSize: 9.5, color: M.textTer, lineHeight: 1.45, marginBottom: 11 }}>
              {a.level === 2 && "Auto-execute routine actions. Log only."}
              {a.level === 3 && "Standard actions need human approval."}
              {a.level === 4 && "All actions require explicit approval."}
            </div>

            {/* Stats */}
            <div style={{ display: "flex", gap: 8, paddingTop: 10, borderTop: `1px solid ${M.borderSubtle}` }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 8, fontFamily: "var(--mono)", color: M.textMute, letterSpacing: ".5px", marginBottom: 2, fontWeight: 700 }}>24H TASKS</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: M.text, letterSpacing: "-.3px" }}>{a.tasks.toLocaleString()}</div>
              </div>
              <div style={{ width: 1, background: M.borderSubtle }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 8, fontFamily: "var(--mono)", color: M.textMute, letterSpacing: ".5px", marginBottom: 2, fontWeight: 700 }}>SUCCESS</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: a.active ? M.green : M.amber, letterSpacing: "-.3px" }}>{a.uptime}%</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SCREEN: L4 MODAL — Stripe direction, premium commercial
// ═══════════════════════════════════════════════════════════════════════════
function L4ModalScreen({ variant = "v3" }) {
  const isV2 = variant === "v2";
  return (
    <div style={{
      background: M.text,
      padding: "32px 24px", minHeight: 580,
      display: "flex", alignItems: "center", justifyContent: "center",
      backgroundImage: "radial-gradient(circle at 50% 30%, rgba(99,91,255,.08), transparent 60%), radial-gradient(circle at 50% 80%, rgba(223,27,65,.06), transparent 60%)",
      position: "relative", overflow: "hidden",
    }}>
      {/* Backdrop dot grid */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "radial-gradient(rgba(255,255,255,.03) 1px, transparent 1px)",
        backgroundSize: "20px 20px", pointerEvents: "none",
      }} />

      <div style={{
        background: M.surface, borderRadius: 14, width: "100%", maxWidth: 500,
        overflow: "hidden",
        boxShadow: "0 32px 64px rgba(0,0,0,.4), 0 12px 24px rgba(0,0,0,.2)",
        border: `1px solid ${M.borderStrong}`,
        fontFamily: "var(--body)", color: M.text,
        position: "relative",
      }}>
        {/* Top accent bar */}
        <div style={{ height: 3, background: M.red }} />

        {/* Header */}
        <div style={{
          padding: "13px 18px",
          background: M.surface,
          borderBottom: `1px solid ${M.borderSubtle}`,
          display: "flex", alignItems: "center", gap: 11,
        }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8, background: M.red,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            boxShadow: `0 4px 12px ${M.red}50`,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
              <MiniBadge tone="red" dot solid>L4 CRITICAL</MiniBadge>
              <span style={{ fontSize: 9, fontFamily: "var(--mono)", color: M.textTer, fontWeight: 700, letterSpacing: ".4px" }}>{!isV2 ? "FINANCEBOT" : "FinanceBot"}</span>
              {!isV2 && <MiniBadge tone="red">2 FLAGS</MiniBadge>}
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: M.text, letterSpacing: "-.25px" }}>Wire transfer — $847,000</div>
          </div>
          {/* Countdown — v3 only */}
          {!isV2 && (
            <div style={{
              textAlign: "right", padding: "6px 11px",
              background: M.redLight, borderRadius: 7, border: `1px solid ${M.redBorder}`,
            }}>
              <div style={{ fontSize: 7, fontFamily: "var(--mono)", fontWeight: 700, letterSpacing: "1px", color: M.redText, marginBottom: 1, textTransform: "uppercase" }}>TIMEOUT IN</div>
              <div style={{ fontSize: 12, fontFamily: "var(--mono)", fontWeight: 700, color: M.red, letterSpacing: "-.4px" }}>4h 53m 22s</div>
            </div>
          )}
          {isV2 && (
            <div style={{ fontSize: 9, fontFamily: "var(--mono)", color: M.textTer, fontWeight: 600 }}>4h 53m left</div>
          )}
        </div>

        {/* Step indicator — v3 only */}
        {!isV2 && (
          <div style={{
            padding: "10px 18px", borderBottom: `1px solid ${M.borderSubtle}`,
            display: "flex", alignItems: "center", gap: 14,
            background: M.surfaceAlt,
          }}>
            {[
              { n: 1, l: "Review", active: true },
              { n: 2, l: "Decide" },
              { n: 3, l: "Confirm" },
            ].map((s, i) => (
              <div key={s.n} style={{ display: "flex", alignItems: "center", gap: 6, flex: i === 2 ? 0 : 1 }}>
                <div style={{
                  width: 17, height: 17, borderRadius: "50%",
                  background: s.active ? M.accent : M.surface,
                  color: s.active ? "#fff" : M.textTer,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 8, fontWeight: 700, fontFamily: "var(--mono)",
                  border: `1.5px solid ${s.active ? M.accent : M.border}`,
                  boxShadow: s.active ? `0 0 0 3px ${M.accent}20` : "none",
                }}>{s.n}</div>
                <span style={{ fontSize: 9.5, fontWeight: s.active ? 650 : 500, color: s.active ? M.text : M.textTer, letterSpacing: "-.05px" }}>{s.l}</span>
                {i < 2 && <div style={{ flex: 1, height: 1, background: M.border, margin: "0 4px" }} />}
              </div>
            ))}
          </div>
        )}

        {/* Body */}
        <div style={{ padding: "16px 18px", maxHeight: !isV2 ? 480 : 360, overflow: "hidden" }}>
          <div style={{ fontSize: 10.5, color: M.textSec, lineHeight: 1.5, marginBottom: 14 }}>
            Transfer to unrecognized vendor account. Invoice source unverified. Zero precedent in last 12 months.
          </div>

          {/* Risk cards — v3 only */}
          {!isV2 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 7, marginBottom: 14 }}>
              {[
                { l: "RISK", v: "94", sub: "/100", color: M.red, bg: M.redLight, bd: M.redBorder, fg: M.redText },
                { l: "SIMILAR", v: "0", sub: "cases", color: M.text, bg: M.surfaceAlt, bd: M.border, fg: M.textTer },
                { l: "WINDOW", v: "4h 53m", sub: "", color: M.amber, bg: M.amberLight, bd: M.amberBorder, fg: M.amberText },
              ].map((s, i) => (
                <div key={i} style={{
                  padding: "10px 11px", background: s.bg, borderRadius: 8, border: `1px solid ${s.bd}`,
                }}>
                  <div style={{ fontSize: 7.5, fontFamily: "var(--mono)", fontWeight: 700, letterSpacing: "1px", color: s.fg, marginBottom: 4 }}>{s.l}</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 3 }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: s.color, lineHeight: 1, letterSpacing: "-.5px" }}>{s.v}</div>
                    {s.sub && <span style={{ fontSize: 9, color: s.fg, fontWeight: 600 }}>{s.sub}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ fontSize: 8.5, fontFamily: "var(--mono)", fontWeight: 700, letterSpacing: "1.4px", color: M.textTer, marginBottom: 7 }}>
            REASONING TRAIL{!isV2 && " · 2 FLAGS"}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 14 }}>
            {[
              { step: "Received invoice from vendor@newco.com", src: "Email ingest", conf: 42, ok: false },
              { step: "Matched to PO #8841 in ERP", src: "NetSuite", conf: 91, ok: true },
              { step: "Amount verified against PO line items", src: "Billing DB", conf: 98, ok: true },
              { step: "Destination NOT in approved registry", src: "Vendor registry", conf: 100, ok: false },
            ].map((r, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "flex-start", gap: 7,
                padding: "7px 10px", borderRadius: 6,
                // v2 = uniform amber. v3 = red for failed, neutral for passing
                background: isV2 ? M.surfaceAlt : (r.ok ? M.surfaceAlt : M.redLight),
                border: `1px solid ${isV2 ? (r.ok ? M.borderSubtle : M.amberBorder) : (r.ok ? M.borderSubtle : M.redBorder)}`,
                borderLeft: isV2 ? `1px solid ${r.ok ? M.borderSubtle : M.amberBorder}` : (r.ok ? `1px solid ${M.borderSubtle}` : `2.5px solid ${M.red}`),
              }}>
                {!isV2 && <div style={{ fontSize: 7.5, fontFamily: "var(--mono)", color: M.textMute, fontWeight: 700, marginTop: 2, flexShrink: 0, letterSpacing: ".3px" }}>{String(i + 1).padStart(2, "0")}</div>}
                <div style={{
                  width: 14, height: 14, borderRadius: "50%", flexShrink: 0,
                  background: isV2 ? (r.ok ? M.greenLight : M.amberLight) : (r.ok ? M.greenLight : M.redSoft),
                  display: "flex", alignItems: "center", justifyContent: "center", marginTop: 1,
                }}>
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke={isV2 ? (r.ok ? M.green : M.amber) : (r.ok ? M.green : M.red)} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    {r.ok ? <path d="M4.5 12.75l6 6 9-13.5" /> : <path d="M12 9v3.75m0 3.75h.008" />}
                  </svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 9.5, color: isV2 ? M.text : (r.ok ? M.text : M.redText), fontWeight: isV2 ? 500 : (r.ok ? 500 : 650), lineHeight: 1.4 }}>{r.step}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
                    <span style={{ fontSize: 8, fontFamily: "var(--mono)", color: M.textTer, fontWeight: 500 }}>{r.src}</span>
                    {/* v2 = inline text, v3 = bar */}
                    {isV2 ? (
                      <span style={{ fontSize: 8, fontFamily: "var(--mono)", color: r.conf >= 90 ? M.green : r.conf >= 70 ? M.amber : M.red, fontWeight: 700 }}>
                        {r.conf}% conf
                      </span>
                    ) : (
                      <MiniConfBar value={r.conf} />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Recommendation — v3 only, in red because no precedent */}
          {!isV2 && (
            <div style={{
              padding: "9px 12px", borderRadius: 7,
              background: M.redLight, border: `1px solid ${M.redBorder}`,
              display: "flex", alignItems: "flex-start", gap: 8,
              borderLeft: `2.5px solid ${M.red}`,
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={M.red} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: 1, flexShrink: 0 }}>
                <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <div>
                <div style={{ fontSize: 10, fontWeight: 650, color: M.redText, marginBottom: 2, letterSpacing: "-.05px" }}>No precedent — manual review required</div>
                <div style={{ fontSize: 9, color: M.redText, opacity: .85, lineHeight: 1.4 }}>First action of this type in the last 365 days.</div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: "10px 18px", borderTop: `1px solid ${M.borderSubtle}`,
          background: M.surfaceAlt, display: "flex", gap: 7, alignItems: "center",
        }}>
          {!isV2 && (
            <div style={{ flex: 1, fontSize: 8, fontFamily: "var(--mono)", color: M.textTer, letterSpacing: ".3px", display: "flex", alignItems: "center", gap: 4, fontWeight: 600 }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
              MAKER-CHECKER · AUDIT LOGGED
            </div>
          )}
          {isV2 && <div style={{ flex: 1 }} />}
          {isV2 && (
            <div style={{
              padding: "7px 14px", borderRadius: 6,
              fontSize: 10, fontWeight: 600, color: M.redText,
              background: M.surface, border: `1px solid ${M.redBorder}`,
            }}>Reject</div>
          )}
          <div style={{
            padding: "7px 14px", borderRadius: 6,
            fontSize: 10, fontWeight: 600, color: "#fff",
            background: M.accent,
            boxShadow: `0 1px 3px ${M.accent}50`,
            display: "flex", alignItems: "center", gap: 5,
          }}>
            {isV2 ? "Approve" : (
              <>
                Proceed to decide
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CALLOUT — annotation pin pointing to a screen change
// ═══════════════════════════════════════════════════════════════════════════
function Callout({ num, title, text, color = T.accent }) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 14,
      padding: "16px 18px", borderRadius: 10,
      background: T.surface, border: `1px solid ${T.border}`,
      borderLeft: `3px solid ${color}`,
    }}>
      <div style={{
        width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
        background: `${color}20`, color: color,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 11, fontFamily: "var(--mono)", fontWeight: 700,
      }}>{num}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: T.text, letterSpacing: "-.15px", marginBottom: 5 }}>{title}</div>
        <p style={{ fontSize: 13, lineHeight: 1.5, color: T.textTer }}>{text}</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SCREENS SECTION — single shots with callouts
// ═══════════════════════════════════════════════════════════════════════════
function ScreensSection() {
  const [ref, inView] = useInView(0.05);
  const [activeScreen, setActiveScreen] = useState(0);

  const screens = [
    {
      key: "dashboard",
      label: "DASHBOARD",
      title: "From status board to outcome board.",
      tagline: "The headline screen — what an ops lead sees first thing in the morning.",
      Component: DashboardScreen,
      callouts: [
        { num: "01", title: "Outcome metrics, not vanity stats", text: 'Replaced "Pending Review: 4" with "Exposure Blocked: $859K." Same data, different audience. The dashboard now serves the ops lead\'s manager, not just the ops lead.', color: T.accent },
        { num: "02", title: "Critical state visual lift", text: "L4 actions get a red glow shadow on their stat card. Senior reviewers scan the dashboard in 2 seconds — the most important card has to *demand* the eye.", color: T.red },
        { num: "03", title: "Tooltip on MTID", text: "Mean Time to Informed Decision is jargon. Hovering reveals: \"Average time from action flagged to human verdict. Target <5m for L3.\" Discoverable, not obscure.", color: T.amber },
      ],
    },
    {
      key: "queue",
      label: "ACTION QUEUE",
      title: "Master-detail review, calibrated to risk.",
      tagline: "The day-to-day workspace — where ops leads actually spend their hours.",
      Component: QueueScreen,
      callouts: [
        { num: "01", title: "Connection degradation banner", text: 'Production reality: agent feeds go stale. The amber banner ("FinanceBot connection degraded") signals the reviewer might be working with incomplete data — before they decide, not after.', color: T.amber },
        { num: "02", title: "Red-bordered failed reasoning", text: "v2 treated all reasoning steps with uniform amber. v3 makes failed steps visually distinct — red background, red left-border, red text. Risk-proportional signal applied at the row level.", color: T.red },
        { num: "03", title: "Recommendation card, anchored last", text: "After reasoning, impact, and precedent — never before. Show it first and reviewers anchor; show it last and it's a tiebreaker. The order is the design.", color: T.accent },
      ],
    },
    {
      key: "agents",
      label: "AGENT FLEET",
      title: "Autonomy as a strategic dial.",
      tagline: "Where ops leads tune what the agents are allowed to do without asking.",
      Component: AgentsScreen,
      callouts: [
        { num: "01", title: "Color-coded autonomy levels", text: "L1 indigo, L2 indigo, L3 amber, L4 red. The slider is the same risk taxonomy as the action queue, applied at the agent level. One mental model, two contexts.", color: T.accent },
        { num: "02", title: "Live status integration", text: 'Each card shows the agent\'s last action ("Wire transfer HELD") and 24h success metrics. The fleet view is also a debugging surface, not just a settings panel.', color: T.green },
        { num: "03", title: "Paused state semantics", text: "Toggling an agent off doesn't delete its data — it pauses execution while preserving audit history. Recoverable state matters when the consequences of pausing are unclear.", color: T.amber },
      ],
    },
  ];

  const cur = screens[activeScreen];

  return (
    <section ref={ref} id="screens" style={{ padding: "120px 32px", borderTop: `1px solid ${T.border}` }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <Eyebrow num="06">The Artifact, In Detail</Eyebrow>

        <h2 style={{
          fontSize: "clamp(36px, 5vw, 60px)", fontWeight: 600, lineHeight: 1.05, letterSpacing: "-.03em",
          color: T.text, marginBottom: 24, maxWidth: 900,
        }}>
          Three screens.<br />
          <span style={{ color: T.textMute }}>Nine specific decisions you can point at.</span>
        </h2>
        <p style={{ fontSize: 17, lineHeight: 1.6, color: T.textTer, maxWidth: 760, marginBottom: 56 }}>
          Switch between screens to see what changed and why. Each callout maps to a specific design decision documented in the next section.
        </p>

        {/* Screen tabs */}
        <div style={{
          display: "flex", gap: 4, marginBottom: 24,
          padding: 4, background: T.surfaceAlt, borderRadius: 10, width: "fit-content",
          border: `1px solid ${T.border}`,
        }}>
          {screens.map((s, i) => (
            <button key={s.key} onClick={() => setActiveScreen(i)}
              style={{
                padding: "10px 18px", border: "none", borderRadius: 7,
                background: activeScreen === i ? T.surface : "transparent",
                color: activeScreen === i ? T.text : T.textTer,
                fontSize: 12, fontWeight: 600, fontFamily: "var(--mono)",
                letterSpacing: ".5px", cursor: "pointer",
                boxShadow: activeScreen === i ? "0 1px 2px rgba(0,0,0,.2)" : "none",
                transition: "all .2s",
              }}>{s.label}</button>
          ))}
        </div>

        <div style={{
          opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(20px)",
          transition: "all .8s cubic-bezier(.2,.8,.2,1)",
        }}>
          <div style={{ marginBottom: 32 }}>
            <h3 key={activeScreen} style={{
              fontSize: 28, fontWeight: 600, color: T.text, letterSpacing: "-.02em",
              lineHeight: 1.2, marginBottom: 8,
              animation: "fadeQuote .35s cubic-bezier(.2,.8,.2,1)",
            }}>{cur.title}</h3>
            <p style={{ fontSize: 14.5, color: T.textTer, lineHeight: 1.55 }}>{cur.tagline}</p>
          </div>

          {/* Screen mockup */}
          <div style={{ marginBottom: 36 }}>
            <BrowserFrame label={cur.label} version="V3.0">
              <cur.Component />
            </BrowserFrame>
          </div>

          {/* Callouts */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
            {cur.callouts.map((c, i) => (
              <Callout key={i} {...c} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// L4 EVOLUTION — side-by-side V2 vs V3
// ═══════════════════════════════════════════════════════════════════════════
function L4EvolutionSection() {
  const [ref, inView] = useInView(0.05);
  const changes = [
    {
      area: "URGENCY",
      v2: 'Static text: "4h 53m left"',
      v3: "Live ticking countdown: 4h 53m 22s",
      why: "Honest urgency. The clock makes the pre-execution window feel real, not theoretical. The thesis of the product is that human attention is a finite resource being spent on a window — hiding the tick rate hides the thesis.",
    },
    {
      area: "STRUCTURE",
      v2: "Single-step modal — read, click approve/reject",
      v3: "Three-step gating: Review → Decide → Confirm",
      why: "Friction calibrated to consequence. A $30 refund and an $847K wire transfer should not have the same interaction depth. Step structure forces deliberation without forcing speed.",
    },
    {
      area: "REASONING",
      v2: "Uniform amber treatment for all steps; confidence as inline text",
      v3: "Failed steps get red bg + red border; confidence as colored bar",
      why: "Risk-proportional signal at the row level. \"One red bar in a sea of green\" is faster scan than reading five percentage strings. The interface itself does the triage.",
    },
    {
      area: "RECOMMENDATION",
      v2: "Recommendation card at top of modal",
      v3: "Recommendation moved below reasoning; flips to red for zero precedent",
      why: 'The reversal that mattered most. Showing recommendation first creates anchoring bias. Moving it last makes it a tiebreaker for genuinely ambiguous cases. "No precedent" gets honest treatment instead of a fabricated approval suggestion.',
    },
  ];

  return (
    <section ref={ref} id="evolution" style={{ padding: "120px 32px", borderTop: `1px solid ${T.border}`, background: T.bgAlt }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <Eyebrow num="07">The Hero Modal — V2 → V3</Eyebrow>

        <h2 style={{
          fontSize: "clamp(36px, 5vw, 60px)", fontWeight: 600, lineHeight: 1.05, letterSpacing: "-.03em",
          color: T.text, marginBottom: 24, maxWidth: 900,
        }}>
          The same modal, two iterations apart.
        </h2>
        <p style={{ fontSize: 17, lineHeight: 1.6, color: T.textTer, maxWidth: 760, marginBottom: 56 }}>
          The L4 critical modal is the most important screen in the product — the moment a human decides whether to let an agent move $847,000. It earned more iteration than any other surface. Here&rsquo;s the delta.
        </p>

        {/* Side-by-side */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 48 }}>
          <div style={{
            opacity: inView ? 1 : 0, transform: inView ? "translateX(0)" : "translateX(-12px)",
            transition: "all .7s cubic-bezier(.2,.8,.2,1)",
          }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 8, marginBottom: 14,
              padding: "8px 14px", borderRadius: 999,
              background: T.surface, border: `1px solid ${T.border}`,
              width: "fit-content",
            }}>
              <span style={{
                fontSize: 10, fontFamily: "var(--mono)", color: T.textMute,
                letterSpacing: "1.5px", fontWeight: 700,
              }}>BEFORE · V2.0</span>
            </div>
            <BrowserFrame version="V2.0">
              <L4ModalScreen variant="v2" />
            </BrowserFrame>
          </div>

          <div style={{
            opacity: inView ? 1 : 0, transform: inView ? "translateX(0)" : "translateX(12px)",
            transition: "all .7s cubic-bezier(.2,.8,.2,1) .1s",
          }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 8, marginBottom: 14,
              padding: "8px 14px", borderRadius: 999,
              background: T.accentSoft, border: `1px solid ${T.accentBorder}`,
              width: "fit-content",
            }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: T.accent, boxShadow: `0 0 0 3px ${T.accent}30` }} />
              <span style={{
                fontSize: 10, fontFamily: "var(--mono)", color: T.accent,
                letterSpacing: "1.5px", fontWeight: 700,
              }}>AFTER · V3.0 SHIPPED</span>
            </div>
            <BrowserFrame version="V3.0">
              <L4ModalScreen variant="v3" />
            </BrowserFrame>
          </div>
        </div>

        {/* Changes table */}
        <div style={{
          background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, overflow: "hidden",
          opacity: inView ? 1 : 0, transform: inView ? "translateY(0)" : "translateY(20px)",
          transition: "all .8s cubic-bezier(.2,.8,.2,1) .3s",
        }}>
          <div style={{
            display: "grid", gridTemplateColumns: "120px 1fr 1fr 1.4fr",
            background: T.surfaceAlt, borderBottom: `1px solid ${T.border}`,
            fontSize: 10, fontFamily: "var(--mono)", color: T.textMute,
            letterSpacing: "1.5px", fontWeight: 700,
          }}>
            <div style={{ padding: "14px 18px" }}>AREA</div>
            <div style={{ padding: "14px 18px", borderLeft: `1px solid ${T.border}` }}>BEFORE · V2</div>
            <div style={{ padding: "14px 18px", borderLeft: `1px solid ${T.border}`, color: T.accent }}>AFTER · V3</div>
            <div style={{ padding: "14px 18px", borderLeft: `1px solid ${T.border}` }}>RATIONALE</div>
          </div>
          {changes.map((c, i) => (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: "120px 1fr 1fr 1.4fr",
              borderBottom: i < changes.length - 1 ? `1px solid ${T.borderSubtle}` : "none",
            }}>
              <div style={{
                padding: "20px 18px",
                fontSize: 11, fontFamily: "var(--mono)", color: T.accent,
                letterSpacing: "1.5px", fontWeight: 700,
              }}>{c.area}</div>
              <div style={{
                padding: "20px 18px", borderLeft: `1px solid ${T.borderSubtle}`,
                fontSize: 13, color: T.textTer, lineHeight: 1.55,
              }}>{c.v2}</div>
              <div style={{
                padding: "20px 18px", borderLeft: `1px solid ${T.borderSubtle}`,
                fontSize: 13, color: T.text, lineHeight: 1.55, fontWeight: 500,
              }}>{c.v3}</div>
              <div style={{
                padding: "20px 18px", borderLeft: `1px solid ${T.borderSubtle}`,
                fontSize: 13, color: T.textSec, lineHeight: 1.6,
              }}>{c.why}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
// ═══════════════════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════════════════
export default function App() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;450;500;550;600;700;800&family=Space+Mono:wght@400;700&display=swap');
        :root { --body: 'Outfit', -apple-system, sans-serif; --mono: 'Space Mono', ui-monospace, monospace; }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body, #root { background: ${T.bg}; color: ${T.text}; font-family: var(--body); -webkit-font-smoothing: antialiased; }
        ::selection { background: ${T.accent}; color: ${T.bg}; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: ${T.bg}; }
        ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: ${T.borderStrong}; }
        button { font-family: var(--body); cursor: pointer; }

        @keyframes scrollHint {
          0% { transform: translateX(0); }
          50% { transform: translateX(28px); }
          100% { transform: translateX(0); }
        }
        @keyframes tick { 0%,100% { opacity: 1; } 50% { opacity: .85; } }
        @keyframes expandIn {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeQuote {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <ProgressBar />
      <TopNav />

      <Hero />
      <TLDR />
      <ProblemSection />
      <ResearchSection />
      <CompetitiveSection />
      <ProcessSection />
      <ScreensSection />
      <L4EvolutionSection />
      <TaxonomyVisualizer />
      <RejectedSection />
      <WrongSection />
      <DecisionsSection />
      <HeroFlowSection />
      <MetricsSection />
      <EdgeCasesSection />
      <CutSection />
      <NextSection />
      <Footer />
    </>
  );
}
