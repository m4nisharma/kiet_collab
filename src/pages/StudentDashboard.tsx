import React, { useState, useEffect, Component, ReactNode } from "react";
import ProfilePage from "./ProfilePage";
import TeammatesPage from "./TeammatesPage";
import TeamsPage from "./TeamsPage";
import HackathonsPage from "./HackathonsPage";
import QAForumPage from "./QAForumPage";
import LeaderboardPage from "./LeaderboardPage";
import AdminAnalyticsDashboard from "./AdminAnalyticsDashboard";
import NotificationBell from "../components/NotificationBell";
import {
  LayoutDashboard,
  User,
  Users,
  UsersRound,
  Trophy,
  MessageSquare,
  BarChart3,
  BarChart2,
  LogOut,
  Rocket,
  ChevronRight,
  Zap,
  Star,
  Search,
  Plus,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  Bell,
  Menu,
  X,
  TrendingUp,
} from "lucide-react";

/* ═══════════════════════════════════════════════════
   PAGE ERROR BOUNDARY
═══════════════════════════════════════════════════ */
class PageErrorBoundary extends Component<
  { children: ReactNode; page: string },
  { error: Error | null }
> {
  state = { error: null };
  static getDerivedStateFromError(e: Error) {
    return { error: e };
  }
  componentDidUpdate(prev: { page: string }) {
    if (prev.page !== this.props.page) this.setState({ error: null });
  }
  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "60vh",
            gap: "1rem",
            fontFamily: "'Inter', sans-serif",
            color: "#28292C",
          }}
        >
          <div style={{ fontSize: "2.5rem" }}>⚠️</div>
          <p style={{ fontWeight: 700, fontSize: "1rem" }}>
            Failed to load this page
          </p>
          <p
            style={{
              color: "#96979A",
              fontSize: "0.82rem",
              maxWidth: 380,
              textAlign: "center",
              lineHeight: 1.6,
            }}
          >
            {(this.state.error as Error).message}
          </p>
          <button
            onClick={() => this.setState({ error: null })}
            style={{
              padding: "0.5rem 1.25rem",
              borderRadius: "999px",
              border: "1.5px solid #28292C",
              background: "transparent",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: "0.85rem",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            Retry
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ═══════════════════════════════════════════════════
   BRAND
═══════════════════════════════════════════════════ */
const B = {
  bg: "#F3F3F3",
  card: "#FFFFFF",
  dark: "#28292C",
  muted: "#96979A",
  border: "rgba(40,41,44,0.07)",
  active: "rgba(40,41,44,0.06)",
  shadow: "0 2px 12px rgba(40,41,44,0.06)",
  shadowH: "0 12px 32px rgba(40,41,44,0.11)",
  green: "#38A169",
  amber: "#D97706",
} as const;

const FONT = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";

/* ═══════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════ */
export interface DashboardUser {
  id: string;
  name: string;
  email: string;
  role: "student" | "faculty" | "admin";
  branch?: string;
  year?: number;
  avatar?: string;
}

interface StudentDashboardProps {
  user: DashboardUser;
  onLogout: () => void;
}

/* ═══════════════════════════════════════════════════
   NAV ITEMS
═══════════════════════════════════════════════════ */
const NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "profile", label: "Profile", icon: User },
  { id: "teammates", label: "Teammates", icon: Users },
  { id: "teams", label: "Teams", icon: UsersRound },
  { id: "hackathons", label: "Hackathons", icon: Trophy },
  { id: "qa", label: "Q&A", icon: MessageSquare },
  { id: "leaderboard", label: "Leaderboard", icon: BarChart3 },
  { id: "analytics", label: "Analytics", icon: BarChart2 },
] as const;

type NavId = (typeof NAV)[number]["id"];

/* ═══════════════════════════════════════════════════
   STYLE INJECT
═══════════════════════════════════════════════════ */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');

.sd-root * { box-sizing: border-box; margin: 0; padding: 0; }

/* Sidebar transition */
.sd-sidebar { transition: transform 0.3s cubic-bezier(.4,0,.2,1); }

/* Card hover lift */
.sd-card-lift {
  transition: transform 0.22s cubic-bezier(.34,1.56,.64,1),
              box-shadow 0.22s ease,
              border-color 0.22s ease;
}
.sd-card-lift:hover {
  transform: translateY(-5px);
  box-shadow: 0 16px 40px rgba(40,41,44,0.12) !important;
  border-color: rgba(40,41,44,0.14) !important;
}

/* Nav item hover */
.sd-nav-item {
  transition: background 0.15s, color 0.15s;
  cursor: pointer;
  border-radius: 0.65rem;
}
.sd-nav-item:hover { background: rgba(40,41,44,0.04); }

/* Quick card inner hover */
.sd-quick-icon {
  transition: transform 0.2s cubic-bezier(.34,1.56,.64,1), background 0.2s;
}
.sd-card-lift:hover .sd-quick-icon {
  transform: scale(1.12);
  background: rgba(40,41,44,0.1) !important;
}

/* Fade in */
.sd-fadein {
  animation: sdFadeIn 0.45s cubic-bezier(.4,0,.2,1) both;
}
@keyframes sdFadeIn {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Scrollbar */
.sd-main::-webkit-scrollbar { width: 5px; }
.sd-main::-webkit-scrollbar-track { background: transparent; }
.sd-main::-webkit-scrollbar-thumb { background: rgba(40,41,44,0.15); border-radius: 99px; }

/* Responsive sidebar overlay */
@media (max-width: 768px) {
  .sd-sidebar-overlay {
    position: fixed; inset: 0; background: rgba(40,41,44,0.3);
    backdrop-filter: blur(4px); z-index: 39;
  }
}

/* Chip pulse */
@keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:.5; } }
.sd-pulse { animation: pulse 2s ease-in-out infinite; }
`;

function StyleInject() {
  useEffect(() => {
    if (document.getElementById("sd-style")) return;
    const el = document.createElement("style");
    el.id = "sd-style";
    el.textContent = CSS;
    document.head.appendChild(el);
    return () => el.remove();
  }, []);
  return null;
}

/* ═══════════════════════════════════════════════════
   SMALL REUSABLE PIECES
═══════════════════════════════════════════════════ */

function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: B.dark,
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.36,
        fontWeight: 700,
        flexShrink: 0,
        fontFamily: FONT,
        letterSpacing: "-0.02em",
      }}
    >
      {initials}
    </div>
  );
}

function Badge({
  children,
  color = B.dark,
  bg = B.active,
}: {
  children: React.ReactNode;
  color?: string;
  bg?: string;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.3rem",
        padding: "0.22rem 0.7rem",
        borderRadius: "999px",
        background: bg,
        color,
        fontSize: "0.72rem",
        fontWeight: 700,
        letterSpacing: "0.02em",
        fontFamily: FONT,
      }}
    >
      {children}
    </span>
  );
}

interface PillBtnProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "dark" | "outline";
}
function PillBtn({ children, onClick, variant = "dark" }: PillBtnProps) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.4rem",
        padding: "0.55rem 1.2rem",
        borderRadius: "999px",
        border: variant === "outline" ? `1.5px solid ${B.dark}` : "none",
        background:
          variant === "outline"
            ? hov
              ? "rgba(40,41,44,0.05)"
              : "transparent"
            : hov
              ? "#3a3b3f"
              : B.dark,
        color: variant === "outline" ? B.dark : "#fff",
        fontSize: "0.82rem",
        fontWeight: 700,
        cursor: "pointer",
        fontFamily: FONT,
        transition: "all 0.18s",
        boxShadow:
          variant === "dark" ? "0 3px 10px rgba(40,41,44,0.18)" : "none",
        transform: hov ? "translateY(-1px)" : "none",
      }}
    >
      {children}
    </button>
  );
}

/* ═══════════════════════════════════════════════════
   SIDEBAR
═══════════════════════════════════════════════════ */
interface SidebarProps {
  active: NavId;
  onNav: (id: NavId) => void;
  user: DashboardUser;
  onLogout: () => void;
  open: boolean;
}
function Sidebar({ active, onNav, user, onLogout, open }: SidebarProps) {
  return (
    <aside
      className="sd-sidebar"
      style={{
        width: 240,
        flexShrink: 0,
        background: B.card,
        borderRight: `1px solid ${B.border}`,
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        position: "sticky",
        top: 0,
        overflowY: "auto",
        // Mobile
        ...(window.innerWidth <= 768
          ? {
              position: "fixed",
              left: 0,
              top: 0,
              zIndex: 40,
              transform: open ? "translateX(0)" : "translateX(-100%)",
              boxShadow: open ? "4px 0 24px rgba(40,41,44,0.1)" : "none",
            }
          : {}),
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "1.5rem 1.25rem 1rem",
          borderBottom: `1px solid ${B.border}`,
          display: "flex",
          alignItems: "center",
          gap: "0.6rem",
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 9,
            background: B.dark,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 3px 8px rgba(40,41,44,0.22)",
          }}
        >
          <Rocket size={16} />
        </div>
        <span
          style={{
            fontSize: "0.95rem",
            fontWeight: 800,
            color: B.dark,
            letterSpacing: "-0.03em",
            fontFamily: FONT,
          }}
        >
          KIET Collab
        </span>
      </div>

      {/* Nav */}
      <nav
        style={{
          padding: "1rem 0.875rem",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "0.2rem",
        }}
      >
        <p
          style={{
            fontSize: "0.65rem",
            fontWeight: 700,
            color: B.muted,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            padding: "0.25rem 0.5rem 0.75rem",
            fontFamily: FONT,
          }}
        >
          Navigation
        </p>
        {NAV.filter(({ id }) => {
          // Hide analytics nav item from regular students
          if (id === "analytics" && user.role === "student") return false;
          return true;
        }).map(({ id, label, icon: Icon }) => {
          const isActive = active === id;
          return (
            <div
              key={id}
              className="sd-nav-item"
              onClick={() => onNav(id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.7rem",
                padding: "0.6rem 0.75rem",
                background: isActive ? B.active : "transparent",
                color: isActive ? B.dark : B.muted,
                fontWeight: isActive ? 700 : 500,
                fontSize: "0.875rem",
                fontFamily: FONT,
                userSelect: "none",
              }}
            >
              <Icon size={17} strokeWidth={isActive ? 2.2 : 1.8} />
              {label}
              {isActive && (
                <div
                  style={{
                    marginLeft: "auto",
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: B.dark,
                  }}
                />
              )}
            </div>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div
        style={{
          padding: "1rem 0.875rem",
          borderTop: `1px solid ${B.border}`,
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.7rem" }}>
          <Avatar name={user.name} size={34} />
          <div style={{ flex: 1, overflow: "hidden" }}>
            <p
              style={{
                fontSize: "0.82rem",
                fontWeight: 700,
                color: B.dark,
                fontFamily: FONT,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {user.name}
            </p>
            <p
              style={{
                fontSize: "0.7rem",
                color: B.muted,
                fontFamily: FONT,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {user.email}
            </p>
          </div>
        </div>
        <button
          onClick={onLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.5rem 0.75rem",
            borderRadius: "0.65rem",
            border: `1px solid ${B.border}`,
            background: "transparent",
            color: B.muted,
            fontSize: "0.8rem",
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: FONT,
            width: "100%",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = B.active;
            e.currentTarget.style.color = B.dark;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = B.muted;
          }}
        >
          <LogOut size={14} /> Sign out
        </button>
      </div>
    </aside>
  );
}

/* ═══════════════════════════════════════════════════
   QUICK ACTION CARD
═══════════════════════════════════════════════════ */
interface QuickCardProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
  label: string;
  delay?: number;
  onClick?: () => void;
}
function QuickCard({
  icon,
  title,
  desc,
  label,
  delay = 0,
  onClick,
}: QuickCardProps) {
  return (
    <div
      className="sd-card-lift sd-fadein"
      onClick={onClick}
      style={{
        background: B.card,
        borderRadius: "1.25rem",
        border: `1px solid ${B.border}`,
        boxShadow: B.shadow,
        padding: "1.6rem",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        cursor: "pointer",
        animationDelay: `${delay}ms`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <div
          className="sd-quick-icon"
          style={{
            width: 46,
            height: 46,
            borderRadius: "0.875rem",
            background: "rgba(40,41,44,0.06)",
            color: B.dark,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </div>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "rgba(40,41,44,0.05)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: B.muted,
          }}
        >
          <ArrowUpRight size={14} />
        </div>
      </div>
      <div>
        <h3
          style={{
            fontSize: "0.97rem",
            fontWeight: 800,
            color: B.dark,
            letterSpacing: "-0.02em",
            marginBottom: "0.3rem",
            fontFamily: FONT,
          }}
        >
          {title}
        </h3>
        <p
          style={{
            fontSize: "0.82rem",
            color: B.muted,
            lineHeight: 1.6,
            fontFamily: FONT,
          }}
        >
          {desc}
        </p>
      </div>
      <div>
        <Badge>
          {label} <ChevronRight size={11} />
        </Badge>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   STAT MINI CARD
═══════════════════════════════════════════════════ */
function StatCard({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
}) {
  return (
    <div
      className="sd-card-lift sd-fadein"
      style={{
        background: B.card,
        borderRadius: "1.25rem",
        border: `1px solid ${B.border}`,
        boxShadow: B.shadow,
        padding: "1.4rem 1.5rem",
        display: "flex",
        alignItems: "center",
        gap: "1rem",
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: "0.75rem",
          background: "rgba(40,41,44,0.06)",
          color: B.dark,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <p
          style={{
            fontSize: "0.72rem",
            color: B.muted,
            fontWeight: 600,
            fontFamily: FONT,
            letterSpacing: "0.02em",
          }}
        >
          {label}
        </p>
        <p
          style={{
            fontSize: "1.35rem",
            fontWeight: 900,
            color: B.dark,
            letterSpacing: "-0.04em",
            lineHeight: 1.2,
            fontFamily: FONT,
          }}
        >
          {value}
        </p>
        <p
          style={{
            fontSize: "0.7rem",
            color: B.muted,
            fontFamily: FONT,
            marginTop: "1px",
          }}
        >
          {sub}
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   HACKATHON ROW
═══════════════════════════════════════════════════ */
interface HackathonRowProps {
  name: string;
  date: string;
  status: "open" | "soon" | "closed";
  seats: number;
  onNav?: (id: NavId) => void;
}
function HackathonRow({ name, date, status, seats, onNav }: HackathonRowProps) {
  const statusMap = {
    open: { label: "Open", bg: "rgba(56,161,105,0.09)", color: B.green },
    soon: { label: "Coming Soon", bg: "rgba(217,119,6,0.09)", color: B.amber },
    closed: { label: "Closed", bg: "rgba(40,41,44,0.07)", color: B.muted },
  };
  const s = statusMap[status];
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0.9rem 0",
        borderBottom: `1px solid ${B.border}`,
        flexWrap: "wrap",
        gap: "0.5rem",
      }}
    >
      <div>
        <p
          style={{
            fontSize: "0.875rem",
            fontWeight: 700,
            color: B.dark,
            fontFamily: FONT,
          }}
        >
          {name}
        </p>
        <p
          style={{
            fontSize: "0.75rem",
            color: B.muted,
            fontFamily: FONT,
            marginTop: "2px",
            display: "flex",
            alignItems: "center",
            gap: "0.3rem",
          }}
        >
          <Clock size={11} /> {date} · {seats} seats left
        </p>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <span
          style={{
            fontSize: "0.72rem",
            fontWeight: 700,
            padding: "0.2rem 0.65rem",
            borderRadius: "999px",
            background: s.bg,
            color: s.color,
            fontFamily: FONT,
          }}
        >
          {s.label}
        </span>
        {status === "open" && (
          <PillBtn variant="outline" onClick={() => onNav?.("hackathons")}>
            Register <ArrowUpRight size={12} />
          </PillBtn>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   ACTIVITY ITEM
═══════════════════════════════════════════════════ */
function ActivityItem({
  icon,
  text,
  time,
}: {
  icon: React.ReactNode;
  text: React.ReactNode;
  time: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "0.75rem",
        padding: "0.75rem 0",
        borderBottom: `1px solid ${B.border}`,
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: "50%",
          background: "rgba(40,41,44,0.05)",
          color: B.dark,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          marginTop: "1px",
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1 }}>
        <p
          style={{
            fontSize: "0.83rem",
            color: B.dark,
            fontFamily: FONT,
            lineHeight: 1.55,
          }}
        >
          {text}
        </p>
        <p
          style={{
            fontSize: "0.7rem",
            color: B.muted,
            fontFamily: FONT,
            marginTop: "2px",
          }}
        >
          {time}
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   TEAM STATUS CARD
═══════════════════════════════════════════════════ */
function TeamStatusCard({
  hasTeam,
  onNav,
}: {
  hasTeam: boolean;
  onNav: (id: NavId) => void;
}) {
  return (
    <div
      style={{
        background: B.card,
        borderRadius: "1.25rem",
        border: `1px solid ${B.border}`,
        boxShadow: B.shadow,
        padding: "1.4rem 1.6rem",
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        flexWrap: "wrap",
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: "0.75rem",
          background: hasTeam ? "rgba(56,161,105,0.09)" : "rgba(40,41,44,0.06)",
          color: hasTeam ? B.green : B.muted,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <UsersRound size={20} />
      </div>
      <div style={{ flex: 1 }}>
        <p
          style={{
            fontSize: "0.72rem",
            color: B.muted,
            fontWeight: 600,
            fontFamily: FONT,
            letterSpacing: "0.02em",
          }}
        >
          TEAM STATUS
        </p>
        {hasTeam ? (
          <>
            <p
              style={{
                fontSize: "0.95rem",
                fontWeight: 700,
                color: B.dark,
                fontFamily: FONT,
              }}
            >
              InnovateBots
            </p>
            <p
              style={{ fontSize: "0.73rem", color: B.muted, fontFamily: FONT }}
            >
              4 members · SIH 2025
            </p>
          </>
        ) : (
          <>
            <p
              style={{
                fontSize: "0.95rem",
                fontWeight: 700,
                color: B.dark,
                fontFamily: FONT,
              }}
            >
              No team yet
            </p>
            <p
              style={{ fontSize: "0.73rem", color: B.muted, fontFamily: FONT }}
            >
              Create or join a team to compete
            </p>
          </>
        )}
      </div>
      {hasTeam ? (
        <Badge bg="rgba(56,161,105,0.09)" color={B.green}>
          <CheckCircle2 size={11} /> Active
        </Badge>
      ) : (
        <PillBtn onClick={() => onNav("teammates")}>
          Find Team <ChevronRight size={13} />
        </PillBtn>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   MAIN DASHBOARD CONTENT
═══════════════════════════════════════════════════ */
function DashboardContent({
  user,
  onNav,
}: {
  user: DashboardUser;
  onNav: (id: NavId) => void;
}) {
  const points = 1240;
  const rank = 38;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* ── Welcome Banner ── */}
      <div
        className="sd-fadein"
        style={{
          background: B.dark,
          borderRadius: "1.25rem",
          padding: "2rem 2rem 1.75rem",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1.25rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle texture blobs */}
        <div
          style={{
            position: "absolute",
            top: -40,
            right: -40,
            width: 200,
            height: 200,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.03)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -30,
            left: "30%",
            width: 140,
            height: 140,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.02)",
            pointerEvents: "none",
          }}
        />

        <div>
          <p
            style={{
              fontSize: "0.78rem",
              color: "rgba(255,255,255,0.5)",
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              fontFamily: FONT,
              marginBottom: "0.4rem",
            }}
          >
            Welcome back 👋
          </p>
          <h1
            style={{
              fontSize: "clamp(1.4rem, 3vw, 2rem)",
              fontWeight: 900,
              color: "#fff",
              letterSpacing: "-0.04em",
              lineHeight: 1.2,
              fontFamily: FONT,
            }}
          >
            {user.name}
          </h1>
          <p
            style={{
              fontSize: "0.875rem",
              color: "rgba(255,255,255,0.5)",
              fontFamily: FONT,
              marginTop: "0.4rem",
            }}
          >
            {user.branch && `${user.branch} · `}
            {user.year && `Year ${user.year} · `}Student
          </p>
        </div>

        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          {/* Points badge */}
          <div
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "1rem",
              padding: "1rem 1.25rem",
              textAlign: "center",
              minWidth: 100,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.3rem",
                marginBottom: "0.25rem",
              }}
            >
              <Zap size={14} style={{ color: "#FCD34D" }} />
              <span
                style={{
                  fontSize: "0.68rem",
                  color: "rgba(255,255,255,0.55)",
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  fontFamily: FONT,
                }}
              >
                Points
              </span>
            </div>
            <p
              style={{
                fontSize: "1.6rem",
                fontWeight: 900,
                color: "#fff",
                letterSpacing: "-0.05em",
                fontFamily: FONT,
              }}
            >
              {points.toLocaleString()}
            </p>
          </div>
          {/* Rank badge */}
          <div
            style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "1rem",
              padding: "1rem 1.25rem",
              textAlign: "center",
              minWidth: 100,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.3rem",
                marginBottom: "0.25rem",
              }}
            >
              <TrendingUp size={14} style={{ color: "#86EFAC" }} />
              <span
                style={{
                  fontSize: "0.68rem",
                  color: "rgba(255,255,255,0.55)",
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  fontFamily: FONT,
                }}
              >
                Campus Rank
              </span>
            </div>
            <p
              style={{
                fontSize: "1.6rem",
                fontWeight: 900,
                color: "#fff",
                letterSpacing: "-0.05em",
                fontFamily: FONT,
              }}
            >
              #{rank}
            </p>
          </div>
        </div>
      </div>

      {/* ── Team Status ── */}
      <TeamStatusCard hasTeam={true} onNav={onNav} />

      {/* ── Stats Row ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "1rem",
        }}
      >
        <StatCard
          label="Projects"
          value="3"
          sub="2 active"
          icon={<Star size={18} />}
        />
        <StatCard
          label="Hackathons"
          value="5"
          sub="2 won"
          icon={<Trophy size={18} />}
        />
        <StatCard
          label="Teammates"
          value="12"
          sub="connections"
          icon={<Users size={18} />}
        />
        <StatCard
          label="Q&A Posts"
          value="18"
          sub="48 upvotes"
          icon={<MessageSquare size={18} />}
        />
      </div>

      {/* ── Quick Actions ── */}
      <div>
        <h2
          style={{
            fontSize: "1rem",
            fontWeight: 800,
            color: B.dark,
            letterSpacing: "-0.02em",
            fontFamily: FONT,
            marginBottom: "1rem",
          }}
        >
          Quick Actions
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
          }}
        >
          <QuickCard
            icon={<Search size={20} />}
            title="Find Teammates"
            desc="Discover skilled students by branch, year, and tech stack."
            label="Search now"
            delay={0}
            onClick={() => onNav("teammates")}
          />
          <QuickCard
            icon={<Plus size={20} />}
            title="Create Team"
            desc="Start a new team and invite members for an upcoming hackathon."
            label="Create"
            delay={60}
            onClick={() => onNav("teams")}
          />
          <QuickCard
            icon={<Trophy size={20} />}
            title="Join Hackathon"
            desc="Browse open competitions and register before seats fill up."
            label="View all"
            delay={120}
            onClick={() => onNav("hackathons")}
          />
          <QuickCard
            icon={<ArrowUpRight size={20} />}
            title="View Submissions"
            desc="Track your submitted projects, judging status, and results."
            label="Open"
            delay={180}
            onClick={() => onNav("hackathons")}
          />
        </div>
      </div>

      {/* ── Bottom 2-col ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1.25rem",
          alignItems: "start",
        }}
      >
        {/* Upcoming Hackathons */}
        <div
          className="sd-fadein"
          style={{
            background: B.card,
            borderRadius: "1.25rem",
            border: `1px solid ${B.border}`,
            boxShadow: B.shadow,
            padding: "1.5rem",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "0.25rem",
            }}
          >
            <h2
              style={{
                fontSize: "0.95rem",
                fontWeight: 800,
                color: B.dark,
                fontFamily: FONT,
                letterSpacing: "-0.02em",
              }}
            >
              Upcoming Hackathons
            </h2>
            <button
              onClick={() => onNav("hackathons")}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: B.muted,
                fontSize: "0.78rem",
                fontFamily: FONT,
                fontWeight: 600,
              }}
            >
              View all
            </button>
          </div>
          <div style={{ marginTop: "0.5rem" }}>
            <HackathonRow
              name="Smart India Hackathon 2025"
              date="Mar 15–16"
              status="open"
              seats={12}
              onNav={onNav}
            />
            <HackathonRow
              name="KIET Innovate — Spring"
              date="Apr 2"
              status="open"
              seats={30}
              onNav={onNav}
            />
            <HackathonRow
              name="Ideathon by TechClub"
              date="Apr 18"
              status="soon"
              seats={50}
              onNav={onNav}
            />
            <HackathonRow
              name="HackFest 2024"
              date="Dec 10"
              status="closed"
              seats={0}
              onNav={onNav}
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div
          className="sd-fadein"
          style={{
            background: B.card,
            borderRadius: "1.25rem",
            border: `1px solid ${B.border}`,
            boxShadow: B.shadow,
            padding: "1.5rem",
            animationDelay: "80ms",
          }}
        >
          <h2
            style={{
              fontSize: "0.95rem",
              fontWeight: 800,
              color: B.dark,
              fontFamily: FONT,
              letterSpacing: "-0.02em",
              marginBottom: "0.25rem",
            }}
          >
            Recent Activity
          </h2>
          <div>
            <ActivityItem
              icon={<CheckCircle2 size={14} />}
              text={
                <>
                  You joined team <strong>InnovateBots</strong> for SIH 2025
                </>
              }
              time="2 hours ago"
            />
            <ActivityItem
              icon={<Zap size={14} />}
              text={
                <>
                  Earned <strong>50 points</strong> for completing your profile
                </>
              }
              time="Yesterday"
            />
            <ActivityItem
              icon={<Users size={14} />}
              text={<>Priya Sharma sent you a teammate request</>}
              time="2 days ago"
            />
            <ActivityItem
              icon={<Trophy size={14} />}
              text={
                <>
                  Your project <strong>AgroScan</strong> was shortlisted
                </>
              }
              time="5 days ago"
            />
            <ActivityItem
              icon={<Star size={14} />}
              text={
                <>
                  You earned the <strong>First Hackathon</strong> badge
                </>
              }
              time="1 week ago"
            />
          </div>
        </div>
      </div>

      {/* Bottom spacing */}
      <div style={{ height: "1rem" }} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   TOP BAR (mobile)
═══════════════════════════════════════════════════ */
interface TopBarProps {
  onToggleSidebar: () => void;
  user: DashboardUser;
}
function TopBar({ onToggleSidebar, user }: TopBarProps) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0.875rem 1.25rem",
        background: B.card,
        borderBottom: `1px solid ${B.border}`,
        position: "sticky",
        top: 0,
        zIndex: 30,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <button
          onClick={onToggleSidebar}
          style={{
            display: "none", // shown via CSS @media on mobile
            width: 36,
            height: 36,
            borderRadius: "0.6rem",
            border: `1px solid ${B.border}`,
            background: B.card,
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: B.dark,
          }}
          className="sd-mobile-menu"
        >
          <Menu size={18} />
        </button>
        <div>
          <p
            style={{
              fontSize: "0.72rem",
              color: B.muted,
              fontWeight: 600,
              fontFamily: FONT,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            Student Dashboard
          </p>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <NotificationBell
          userId={String((user as any)._id ?? (user as any).id ?? "")}
        />
        <Avatar name={user.name} size={34} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   ROOT EXPORT
═══════════════════════════════════════════════════ */
export default function StudentDashboard({
  user,
  onLogout,
}: StudentDashboardProps) {
  const [activeNav, setActiveNav] = useState<NavId>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on nav (mobile)
  const handleNav = (id: NavId) => {
    setActiveNav(id);
    setSidebarOpen(false);
  };

  const VIEW_MAP: Record<NavId, React.ReactNode> = {
    dashboard: <DashboardContent user={user} onNav={handleNav} />,
    profile: <ProfilePage user={user} />,
    teammates: <TeammatesPage user={user} />,
    teams: <TeamsPage />,
    hackathons: <HackathonsPage />,
    qa: <QAForumPage />,
    leaderboard: <LeaderboardPage />,
    analytics:
      user.role === "admin" || user.role === "faculty" ? (
        <AdminAnalyticsDashboard />
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 320,
            gap: "1rem",
            padding: "3rem",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "1rem",
              background: "rgba(40,41,44,0.06)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#96979A",
            }}
          >
            <BarChart2 size={26} />
          </div>
          <h2
            style={{
              fontSize: "1.05rem",
              fontWeight: 800,
              color: "#28292C",
              fontFamily: "'Inter',sans-serif",
              letterSpacing: "-0.03em",
            }}
          >
            Admin Only
          </h2>
          <p
            style={{
              fontSize: "0.83rem",
              color: "#96979A",
              fontFamily: "'Inter',sans-serif",
              maxWidth: 320,
              lineHeight: 1.6,
            }}
          >
            The Analytics dashboard is accessible to Admin and Faculty roles
            only.
          </p>
        </div>
      ),
  };

  return (
    <>
      <StyleInject />
      <style>{`
        @media (max-width: 768px) {
          .sd-mobile-menu { display: flex !important; }
          .sd-sidebar-desktop { display: none !important; }
        }
        @media (min-width: 769px) {
          .sd-sidebar { transform: translateX(0) !important; position: sticky !important; box-shadow: none !important; }
        }
        .sd-bottom-2col { grid-template-columns: 1fr 1fr; }
        @media (max-width: 900px) {
          .sd-bottom-2col { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div
        className="sd-root"
        style={{
          display: "flex",
          minHeight: "100vh",
          background: B.bg,
          fontFamily: FONT,
          position: "relative",
        }}
      >
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="sd-sidebar-overlay"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <Sidebar
          active={activeNav}
          onNav={handleNav}
          user={user}
          onLogout={onLogout}
          open={sidebarOpen}
        />

        {/* Main shell */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
          }}
        >
          {/* Top bar */}
          <TopBar
            onToggleSidebar={() => setSidebarOpen((p) => !p)}
            user={user}
          />

          {/* Scrollable main */}
          <main
            className="sd-main"
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "clamp(1.25rem, 3vw, 2rem)",
            }}
          >
            <PageErrorBoundary page={activeNav}>
              {VIEW_MAP[activeNav]}
            </PageErrorBoundary>
          </main>
        </div>

        {/* Mobile sidebar close button */}
        {sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(false)}
            style={{
              position: "fixed",
              top: "1rem",
              left: 256,
              zIndex: 50,
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: B.dark,
              color: "#fff",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(40,41,44,0.25)",
            }}
          >
            <X size={16} />
          </button>
        )}
      </div>
    </>
  );
}
