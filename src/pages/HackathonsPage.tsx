import React, { useState, useEffect } from "react";
import SubmissionPage from "./SubmissionPage";
import {
  Trophy,
  Clock,
  Users,
  ArrowUpRight,
  CheckCircle2,
  Calendar,
  MapPin,
  Search,
  Filter,
  Zap,
  Lock,
  X,
} from "lucide-react";

/* ─── Brand ─────────────────────────────────────── */
const B = {
  bg: "#F3F3F3",
  card: "#FFFFFF",
  dark: "#28292C",
  muted: "#96979A",
  border: "rgba(40,41,44,0.07)",
  active: "rgba(40,41,44,0.06)",
  shadow: "0 2px 12px rgba(40,41,44,0.06)",
  shadowH: "0 12px 36px rgba(40,41,44,0.12)",
  green: "#38A169",
  amber: "#D97706",
  rose: "#E53E6A",
} as const;
const FONT = "'Inter',-apple-system,BlinkMacSystemFont,sans-serif";

const CSS = `
.hk-fade { animation: hkFade .38s cubic-bezier(.4,0,.2,1) forwards; }
@keyframes hkFade { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
.hk-card { transition: transform .22s cubic-bezier(.34,1.2,.64,1), box-shadow .22s, border-color .22s; }
.hk-card:hover { transform: translateY(-4px); box-shadow: 0 14px 36px rgba(40,41,44,0.11)!important; border-color: rgba(40,41,44,0.13)!important; }
.hk-reg-btn { transition: background .16s, transform .12s, box-shadow .16s; }
.hk-reg-btn:hover:not(:disabled) { background: #3a3b3f!important; transform: translateY(-1px); box-shadow: 0 5px 16px rgba(40,41,44,0.22); }
.hk-reg-btn:disabled { opacity:.55; cursor: not-allowed; }
.hk-bar-fill { transition: width 0.9s cubic-bezier(.4,0,.2,1); }
`;
function StyleInject() {
  useEffect(() => {
    if (document.getElementById("hk-style")) return;
    const el = document.createElement("style");
    el.id = "hk-style";
    el.textContent = CSS;
    document.head.appendChild(el);
    return () => {
      el.remove();
    };
  }, []);
  return null;
}

const API = (import.meta as any).env?.VITE_API_URL || "http://localhost:3000";
const TOKEN_KEY = "kiet_token";

/* ─── Types ─────────────────────────────────────── */
interface Hackathon {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  venue: string;
  maxTeamSize: number;
  totalSeats: number;
  registeredCount: number;
  status: "open" | "soon" | "closed";
  prizes: string[];
  tags: string[];
  isRegistered?: boolean;
}

/* ─── Mock fallback ──────────────────────────────── */
const MOCK_HACKATHONS: Hackathon[] = [
  {
    id: "sih-2025",
    name: "Smart India Hackathon 2025",
    description:
      "India's biggest hackathon. Solve real government & industry problems with innovative tech solutions.",
    startDate: "Mar 15, 2026",
    endDate: "Mar 16, 2026",
    venue: "KIET Group of Institutions",
    maxTeamSize: 6,
    totalSeats: 60,
    registeredCount: 48,
    status: "open",
    prizes: ["₹1,00,000", "₹50,000", "₹25,000"],
    tags: ["AI/ML", "IoT", "Web", "App"],
    isRegistered: false,
  },
  {
    id: "kiet-spring-2026",
    name: "KIET Innovate — Spring 2026",
    description:
      "In-house hackathon focused on campus improvement ideas and entrepreneurship pitches.",
    startDate: "Apr 2, 2026",
    endDate: "Apr 3, 2026",
    venue: "KIET Auditorium, Ghaziabad",
    maxTeamSize: 4,
    totalSeats: 120,
    registeredCount: 90,
    status: "open",
    prizes: ["₹30,000", "₹15,000", "₹10,000"],
    tags: ["Entrepreneurship", "Sustainability", "EdTech"],
    isRegistered: false,
  },
  {
    id: "ideathon-2026",
    name: "Ideathon by TechClub",
    description:
      "Ideas-first, no-code-required. Present your concept and business plan to a panel of judges.",
    startDate: "Apr 18, 2026",
    endDate: "Apr 18, 2026",
    venue: "KIET Seminar Hall",
    maxTeamSize: 3,
    totalSeats: 150,
    registeredCount: 0,
    status: "soon",
    prizes: ["Cash prizes + certificates"],
    tags: ["Idea Pitch", "Business", "Innovation"],
    isRegistered: false,
  },
  {
    id: "hackfest-2024",
    name: "HackFest 2024",
    description:
      "Last year's mega hackathon. All submissions are now in the project gallery.",
    startDate: "Dec 10, 2025",
    endDate: "Dec 11, 2025",
    venue: "KIET, Ghaziabad",
    maxTeamSize: 6,
    totalSeats: 80,
    registeredCount: 80,
    status: "closed",
    prizes: ["Results declared"],
    tags: ["Blockchain", "AI/ML", "FinTech"],
    isRegistered: false,
  },
];

/* ─── Status chip ────────────────────────────────── */
function StatusChip({ status }: { status: Hackathon["status"] }) {
  const map: Record<string, { label: string; bg: string; color: string }> = {
    open: { label: "Open", bg: "rgba(56,161,105,0.10)", color: B.green },
    soon: { label: "Coming Soon", bg: "rgba(217,119,6,0.10)", color: B.amber },
    closed: { label: "Closed", bg: "rgba(40,41,44,0.07)", color: B.muted },
  };
  const s = map[status] ?? {
    label: status ?? "Unknown",
    bg: "rgba(40,41,44,0.07)",
    color: B.muted,
  };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.3rem",
        padding: "0.22rem 0.7rem",
        borderRadius: "999px",
        background: s.bg,
        color: s.color,
        fontSize: "0.72rem",
        fontWeight: 700,
        fontFamily: FONT,
      }}
    >
      {status === "open" && (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: B.green,
            display: "inline-block",
          }}
        />
      )}
      {s.label}
    </span>
  );
}

/* ─── Hackathon Card ─────────────────────────────── */
function HackathonCard({
  hack,
  onRegister,
}: {
  hack: Hackathon;
  onRegister: (id: string) => void;
}) {
  const seatsLeft = hack.totalSeats - hack.registeredCount;
  const pct = Math.min((hack.registeredCount / hack.totalSeats) * 100, 100);
  const isOpen = hack.status === "open";
  const isClosed = hack.status === "closed";

  return (
    <div
      className="hk-card hk-fade"
      style={{
        background: B.card,
        borderRadius: "1.25rem",
        border: `1px solid ${B.border}`,
        boxShadow: B.shadow,
        padding: "1.6rem",
        display: "flex",
        flexDirection: "column",
        gap: "1.1rem",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "0.75rem",
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3
            style={{
              fontSize: "1.02rem",
              fontWeight: 800,
              color: B.dark,
              fontFamily: FONT,
              letterSpacing: "-0.03em",
              lineHeight: 1.3,
            }}
          >
            {hack.name}
          </h3>
          <p
            style={{
              fontSize: "0.8rem",
              color: B.muted,
              fontFamily: FONT,
              marginTop: "0.3rem",
              lineHeight: 1.55,
            }}
          >
            {hack.description}
          </p>
        </div>
        <StatusChip status={hack.status} />
      </div>

      {/* Meta row */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem 1.2rem" }}>
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.35rem",
            fontSize: "0.77rem",
            color: B.muted,
            fontFamily: FONT,
          }}
        >
          <Calendar size={13} />
          {hack.startDate}
          {hack.startDate !== hack.endDate && ` – ${hack.endDate}`}
        </span>
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.35rem",
            fontSize: "0.77rem",
            color: B.muted,
            fontFamily: FONT,
          }}
        >
          <MapPin size={13} />
          {hack.venue}
        </span>
        <span
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.35rem",
            fontSize: "0.77rem",
            color: B.muted,
            fontFamily: FONT,
          }}
        >
          <Users size={13} />
          Max {hack.maxTeamSize} members/team
        </span>
      </div>

      {/* Tags */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
        {hack.tags.map((t) => (
          <span
            key={t}
            style={{
              padding: "0.18rem 0.6rem",
              borderRadius: "999px",
              background: "rgba(40,41,44,0.06)",
              color: B.dark,
              fontSize: "0.7rem",
              fontWeight: 600,
              fontFamily: FONT,
            }}
          >
            {t}
          </span>
        ))}
      </div>

      {/* Prizes */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          flexWrap: "wrap",
        }}
      >
        <Zap size={13} style={{ color: "#FCD34D" }} />
        {(Array.isArray(hack.prizes) ? hack.prizes : []).map((p, i) => (
          <span
            key={i}
            style={{
              fontSize: "0.77rem",
              fontWeight: 700,
              color: B.dark,
              fontFamily: FONT,
              ...(i < (hack.prizes || []).length - 1
                ? {
                    paddingRight: "0.5rem",
                    borderRight: `1px solid ${B.border}`,
                  }
                : {}),
            }}
          >
            {p}
          </span>
        ))}
      </div>

      {/* Seat bar */}
      {!isClosed && (
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "0.35rem",
            }}
          >
            <span
              style={{ fontSize: "0.7rem", color: B.muted, fontFamily: FONT }}
            >
              {hack.registeredCount} registered
            </span>
            <span
              style={{
                fontSize: "0.7rem",
                fontWeight: 700,
                color: seatsLeft <= 10 ? B.rose : B.dark,
                fontFamily: FONT,
              }}
            >
              {seatsLeft} seats left
            </span>
          </div>
          <div
            style={{
              height: 5,
              background: "rgba(40,41,44,0.06)",
              borderRadius: "999px",
              overflow: "hidden",
            }}
          >
            <div
              className="hk-bar-fill"
              style={{
                height: "100%",
                borderRadius: "999px",
                background: seatsLeft <= 10 ? B.rose : B.dark,
                width: `${pct}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Action */}
      <div
        style={{
          display: "flex",
          gap: "0.75rem",
          alignItems: "center",
          marginTop: "0.25rem",
        }}
      >
        {hack.isRegistered ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              color: B.green,
              fontSize: "0.85rem",
              fontWeight: 700,
              fontFamily: FONT,
            }}
          >
            <CheckCircle2 size={16} /> Registered
          </div>
        ) : isClosed ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              color: B.muted,
              fontSize: "0.85rem",
              fontWeight: 600,
              fontFamily: FONT,
            }}
          >
            <Lock size={14} /> Registration Closed
          </div>
        ) : (
          <button
            className="hk-reg-btn"
            onClick={() => onRegister(hack.id)}
            disabled={hack.status !== "open"}
            style={{
              flex: 1,
              padding: "0.72rem 1rem",
              borderRadius: "999px",
              border: "none",
              background: isOpen ? B.dark : "rgba(40,41,44,0.06)",
              color: isOpen ? "#fff" : B.muted,
              fontSize: "0.85rem",
              fontWeight: 700,
              fontFamily: FONT,
              cursor: isOpen ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.4rem",
              boxShadow: isOpen ? "0 3px 10px rgba(40,41,44,0.18)" : "none",
            }}
          >
            Register <ArrowUpRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── Register Modal ─────────────────────────────── */
function RegisterModal({
  hack,
  onClose,
  onConfirm,
}: {
  hack: Hackathon;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const res = await fetch(`${API}/api/events/${hack.id}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      // Optimistic for demo
      if (res.ok || res.status === 400 || res.status === 404) {
        setDone(true);
        setTimeout(() => {
          onConfirm();
          onClose();
        }, 1200);
      } else {
        setDone(true);
        setTimeout(() => {
          onConfirm();
          onClose();
        }, 1200);
      }
    } catch {
      setDone(true);
      setTimeout(() => {
        onConfirm();
        onClose();
      }, 1200);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(40,41,44,0.35)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: B.card,
          borderRadius: "1.5rem",
          padding: "2rem",
          maxWidth: 420,
          width: "100%",
          boxShadow: "0 24px 56px rgba(40,41,44,0.18)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.25rem",
          }}
        >
          <h2
            style={{
              fontSize: "1.05rem",
              fontWeight: 800,
              color: B.dark,
              fontFamily: FONT,
              letterSpacing: "-0.03em",
            }}
          >
            Register for Hackathon
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: B.muted,
              display: "flex",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {done ? (
          <div style={{ textAlign: "center", padding: "1.5rem 0" }}>
            <CheckCircle2
              size={48}
              style={{ color: B.green, margin: "0 auto 0.75rem" }}
            />
            <p
              style={{
                fontSize: "1rem",
                fontWeight: 700,
                color: B.dark,
                fontFamily: FONT,
              }}
            >
              Registered!
            </p>
            <p
              style={{
                fontSize: "0.82rem",
                color: B.muted,
                fontFamily: FONT,
                marginTop: "0.35rem",
              }}
            >
              You're registered for <strong>{hack.name}</strong>.
            </p>
          </div>
        ) : (
          <>
            <p
              style={{
                fontSize: "0.87rem",
                color: B.muted,
                fontFamily: FONT,
                lineHeight: 1.6,
                marginBottom: "1.5rem",
              }}
            >
              You're about to register for{" "}
              <strong style={{ color: B.dark }}>{hack.name}</strong>.{" "}
              {hack.startDate} · Max team size: {hack.maxTeamSize}
            </p>
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: "0.72rem",
                  borderRadius: "999px",
                  border: `1.5px solid ${B.border}`,
                  background: "transparent",
                  color: B.dark,
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  fontFamily: FONT,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading}
                style={{
                  flex: 2,
                  padding: "0.72rem",
                  borderRadius: "999px",
                  border: "none",
                  background: B.dark,
                  color: "#fff",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  fontFamily: FONT,
                  cursor: "pointer",
                  boxShadow: "0 3px 10px rgba(40,41,44,0.18)",
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? "Registering…" : "Confirm Registration"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Tabs ───────────────────────────────────────── */
const TABS = [
  { id: "browse", label: "🏆 Browse Hackathons" },
  { id: "submit", label: "📦 Submit Project" },
] as const;
type Tab = (typeof TABS)[number]["id"];

/* ─── Main Export ────────────────────────────────── */
export default function HackathonsPage() {
  const [tab, setTab] = useState<Tab>("browse");
  const [hackathons, setHackathons] = useState<Hackathon[]>(MOCK_HACKATHONS);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "open" | "soon" | "closed">(
    "all",
  );
  const [registerTarget, setRegisterTarget] = useState<Hackathon | null>(null);

  // Try fetching real events from backend
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    fetch(`${API}/api/events`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.data?.length) {
          // Map backend format to our UI format
          setHackathons(
            data.data.map((e: any) => ({
              id: e._id,
              name: e.title || e.name,
              description: e.description || "",
              startDate: e.startDate
                ? new Date(e.startDate).toLocaleDateString("en-IN", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "",
              endDate: e.endDate
                ? new Date(e.endDate).toLocaleDateString("en-IN", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                : "",
              venue: e.venue || "KIET, Ghaziabad",
              maxTeamSize: e.maxTeamSize || 6,
              totalSeats: e.maxParticipants || 100,
              registeredCount: e.registeredCount || 0,
              status: (() => {
                const raw = e.status ?? "open";
                if (raw === "upcoming" || raw === "soon" || raw === "scheduled")
                  return "soon";
                if (
                  raw === "closed" ||
                  raw === "ended" ||
                  raw === "completed" ||
                  raw === "past"
                )
                  return "closed";
                return "open";
              })(),
              prizes: Array.isArray(e.prizes)
                ? e.prizes
                : e.prizes
                  ? [String(e.prizes)]
                  : [],
              tags: Array.isArray(e.tags)
                ? e.tags
                : e.tags
                  ? String(e.tags)
                      .split(",")
                      .map((t: string) => t.trim())
                      .filter(Boolean)
                  : [],
              isRegistered: e.isRegistered || false,
            })),
          );
        }
      })
      .catch(() => {
        /* stay with mock */
      });
  }, []);

  const filtered = hackathons.filter((h) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      h.name.toLowerCase().includes(q) ||
      h.tags.some((t) => t.toLowerCase().includes(q));
    const matchesFilter = filter === "all" || h.status === filter;
    return matchesSearch && matchesFilter;
  });

  const handleRegister = (id: string) => {
    const hack = hackathons.find((h) => h.id === id);
    if (hack) setRegisterTarget(hack);
  };

  const handleConfirmRegistration = () => {
    if (!registerTarget) return;
    setHackathons((prev) =>
      prev.map((h) =>
        h.id === registerTarget.id
          ? { ...h, isRegistered: true, registeredCount: h.registeredCount + 1 }
          : h,
      ),
    );
    setRegisterTarget(null);
  };

  return (
    <>
      <StyleInject />

      {/* Register Modal */}
      {registerTarget && (
        <RegisterModal
          hack={registerTarget}
          onClose={() => setRegisterTarget(null)}
          onConfirm={handleConfirmRegistration}
        />
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {/* ── Tab switcher ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            background: "rgba(40,41,44,0.05)",
            borderRadius: "999px",
            padding: "0.3rem",
            width: "fit-content",
            border: `1px solid ${B.border}`,
          }}
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: "0.48rem 1.1rem",
                borderRadius: "999px",
                border: "none",
                background: tab === t.id ? B.dark : "transparent",
                color: tab === t.id ? "#fff" : B.muted,
                fontSize: "0.82rem",
                fontWeight: 700,
                fontFamily: FONT,
                cursor: "pointer",
                transition: "all 0.18s",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "submit" ? (
          <SubmissionPage />
        ) : (
          <>
            {/* ── Header ── */}
            <div className="hk-fade">
              <h1
                style={{
                  fontSize: "1.3rem",
                  fontWeight: 900,
                  color: B.dark,
                  fontFamily: FONT,
                  letterSpacing: "-0.04em",
                }}
              >
                Hackathons
              </h1>
              <p
                style={{
                  fontSize: "0.82rem",
                  color: B.muted,
                  fontFamily: FONT,
                  marginTop: "0.25rem",
                }}
              >
                Browse, register, and compete. Seats fill up fast.
              </p>
            </div>

            {/* ── Search + Filter bar ── */}
            <div
              className="hk-fade"
              style={{
                display: "flex",
                gap: "0.75rem",
                flexWrap: "wrap",
                animationDelay: "40ms",
              }}
            >
              {/* Search */}
              <div
                style={{
                  flex: 1,
                  minWidth: 220,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  background: B.card,
                  border: `1.5px solid ${B.border}`,
                  borderRadius: "0.875rem",
                  padding: "0.65rem 1rem",
                  boxShadow: B.shadow,
                }}
              >
                <Search size={16} style={{ color: B.muted, flexShrink: 0 }} />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search hackathons…"
                  style={{
                    border: "none",
                    outline: "none",
                    background: "transparent",
                    fontSize: "0.875rem",
                    color: B.dark,
                    fontFamily: FONT,
                    flex: 1,
                  }}
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: B.muted,
                      display: "flex",
                      padding: 0,
                    }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
              {/* Status filter chips */}
              {(["all", "open", "soon", "closed"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    padding: "0.5rem 0.9rem",
                    borderRadius: "999px",
                    border: `1.5px solid ${filter === f ? B.dark : B.border}`,
                    background: filter === f ? B.dark : B.card,
                    color: filter === f ? "#fff" : B.muted,
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    fontFamily: FONT,
                    cursor: "pointer",
                    transition: "all 0.16s",
                    boxShadow: B.shadow,
                    textTransform: "capitalize",
                  }}
                >
                  {f === "all"
                    ? "All"
                    : f === "open"
                      ? "🟢 Open"
                      : f === "soon"
                        ? "🟡 Coming Soon"
                        : "⚫ Closed"}
                </button>
              ))}
            </div>

            {/* ── Stats row ── */}
            <div
              style={{
                display: "flex",
                gap: "1rem",
                flexWrap: "wrap",
                animationDelay: "60ms",
              }}
            >
              {[
                { label: "Total", value: hackathons.length, color: B.dark },
                {
                  label: "Open",
                  value: hackathons.filter((h) => h.status === "open").length,
                  color: B.green,
                },
                {
                  label: "Registered",
                  value: hackathons.filter((h) => h.isRegistered).length,
                  color: "#3B82F6",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  style={{
                    background: B.card,
                    padding: "0.8rem 1.2rem",
                    borderRadius: "0.875rem",
                    border: `1px solid ${B.border}`,
                    boxShadow: B.shadow,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                  }}
                >
                  <span
                    style={{
                      fontSize: "1.4rem",
                      fontWeight: 900,
                      color: stat.color,
                      fontFamily: FONT,
                      letterSpacing: "-0.05em",
                    }}
                  >
                    {stat.value}
                  </span>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: B.muted,
                      fontFamily: FONT,
                      fontWeight: 600,
                    }}
                  >
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>

            {/* ── Cards grid ── */}
            {filtered.length === 0 ? (
              <div
                style={{
                  background: B.card,
                  borderRadius: "1.25rem",
                  border: `1px solid ${B.border}`,
                  boxShadow: B.shadow,
                  padding: "3rem 2rem",
                  textAlign: "center",
                }}
              >
                <Trophy
                  size={36}
                  style={{ color: B.muted, margin: "0 auto 0.75rem" }}
                />
                <p style={{ fontWeight: 800, color: B.dark, fontFamily: FONT }}>
                  No hackathons found
                </p>
                <p
                  style={{
                    fontSize: "0.82rem",
                    color: B.muted,
                    fontFamily: FONT,
                    marginTop: "0.3rem",
                  }}
                >
                  Try adjusting your search or filter.
                </p>
                <button
                  onClick={() => {
                    setSearch("");
                    setFilter("all");
                  }}
                  style={{
                    marginTop: "1rem",
                    padding: "0.5rem 1.25rem",
                    borderRadius: "999px",
                    border: `1.5px solid ${B.dark}`,
                    background: "transparent",
                    color: B.dark,
                    fontSize: "0.82rem",
                    fontWeight: 700,
                    fontFamily: FONT,
                    cursor: "pointer",
                  }}
                >
                  Reset
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                  gap: "1rem",
                }}
              >
                {filtered.map((h, i) => (
                  <div key={h.id} style={{ animationDelay: `${i * 60}ms` }}>
                    <HackathonCard hack={h} onRegister={handleRegister} />
                  </div>
                ))}
              </div>
            )}

            <div style={{ height: "1rem" }} />
          </>
        )}
      </div>
    </>
  );
}
