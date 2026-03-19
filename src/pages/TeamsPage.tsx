import React, { useState, useEffect } from "react";
import TeamChatPage from "./TeamChatPage";
import {
  Trophy,
  Users,
  UserPlus,
  UserMinus,
  Copy,
  CheckCircle2,
  Crown,
  Share2,
  Settings,
  ChevronRight,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  MessageSquare,
  Loader2,
  Plus,
  X,
  Trash2,
  LogOut,
} from "lucide-react";

const API = (import.meta as any).env?.VITE_API_URL || "http://localhost:3000";
const TOKEN_KEY = "kiet_token";

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem(TOKEN_KEY) || "";
  return token ? { Authorization: `Bearer ${token}` } : {};
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
  shadowH: "0 10px 30px rgba(40,41,44,0.10)",
  green: "#38A169",
  rose: "#E53E6A",
  amber: "#D97706",
  blue: "#3B82F6",
} as const;
const FONT = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";

/* ═══════════════════════════════════════════════════
   CSS
═══════════════════════════════════════════════════ */
const CSS = `
.td-fadein { animation: tdFade 0.4s cubic-bezier(.4,0,.2,1) both; }
@keyframes tdFade { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
.td-card { transition: box-shadow 0.22s ease, border-color 0.22s ease; }
.td-card:hover { box-shadow: 0 10px 30px rgba(40,41,44,0.10) !important; }
.td-row { transition: background 0.15s; }
.td-row:hover { background: rgba(40,41,44,0.025) !important; }
.td-remove-btn { transition: color 0.15s, background 0.15s; }
.td-remove-btn:hover { color: #E53E6A !important; background: rgba(229,62,106,0.07) !important; }
.td-invite-btn { transition: background 0.17s, transform 0.13s, box-shadow 0.17s; }
.td-invite-btn:hover:not(:disabled) { background: #3a3b3f !important; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(40,41,44,0.22); }
.td-bar-fill { transition: width 0.9s cubic-bezier(.4,0,.2,1); }
.td-copy-btn:hover { background: rgba(40,41,44,0.08) !important; }
`;
function StyleInject() {
  useEffect(() => {
    if (document.getElementById("td-style")) return;
    const el = document.createElement("style");
    el.id = "td-style";
    el.textContent = CSS;
    document.head.appendChild(el);
    return () => el.remove();
  }, []);
  return null;
}

/* ═══════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════ */
type Gender = "female" | "male" | "other" | "prefer_not_to_say";

/** Member as returned from populated API response */
interface Member {
  _id: string;
  name: string;
  avatar?: string;
  gender?: Gender;
  branch?: string;
  skills?: string[];
}

/** Team as returned from API */
interface Team {
  _id: string;
  team_name: string;
  hackathon_name: string;
  created_by: { _id: string; name: string; avatar?: string };
  members: Member[];
  required_skills: string[];
  required_female_members: number;
  max_team_size: number;
  createdAt: string;
}

/* ═══════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════ */
function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
function namehue(name: string) {
  return (name.charCodeAt(0) * 17 + name.charCodeAt(1) * 7) % 360;
}

function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  const hue = namehue(name);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        flexShrink: 0,
        background: `hsl(${hue},12%,22%)`,
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.36,
        fontWeight: 800,
        fontFamily: FONT,
      }}
    >
      {initials(name)}
    </div>
  );
}

function GenderBadge({ gender }: { gender?: Gender }) {
  const g = gender ?? "prefer_not_to_say";
  const cfg = {
    female: {
      label: "Female",
      bg: "rgba(229,62,106,0.08)",
      color: "#C0385A",
      dot: "#E53E6A",
    },
    male: {
      label: "Male",
      bg: "rgba(59,130,246,0.08)",
      color: "#2563EB",
      dot: "#3B82F6",
    },
    other: {
      label: "Other",
      bg: "rgba(40,41,44,0.07)",
      color: B.muted,
      dot: B.muted,
    },
    prefer_not_to_say: {
      label: "–",
      bg: "rgba(40,41,44,0.07)",
      color: B.muted,
      dot: B.muted,
    },
  }[g];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.3rem",
        padding: "0.2rem 0.65rem",
        borderRadius: "999px",
        background: cfg.bg,
        color: cfg.color,
        fontSize: "0.7rem",
        fontWeight: 700,
        fontFamily: FONT,
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: cfg.dot,
          display: "inline-block",
        }}
      />
      {cfg.label}
    </span>
  );
}

function SkillPill({ label, covered }: { label: string; covered?: boolean }) {
  return (
    <span
      style={{
        padding: "0.18rem 0.6rem",
        borderRadius: "999px",
        background: covered ? B.dark : B.active,
        color: covered ? "#fff" : B.dark,
        fontSize: "0.7rem",
        fontWeight: 600,
        fontFamily: FONT,
        display: "inline-flex",
        alignItems: "center",
      }}
    >
      {label}
    </span>
  );
}

/* ═══════════════════════════════════════════════════
   SKILL COVERAGE BAR
═══════════════════════════════════════════════════ */
function CoverageBar({ covered, total }: { covered: number; total: number }) {
  const pct = total === 0 ? 0 : Math.round((covered / total) * 100);
  const color = pct >= 80 ? B.green : pct >= 50 ? B.amber : "#E53E6A";
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: "0.5rem",
        }}
      >
        <span
          style={{
            fontSize: "0.75rem",
            fontWeight: 700,
            color: B.dark,
            fontFamily: FONT,
          }}
        >
          {pct}%
        </span>
        <span style={{ fontSize: "0.7rem", color: B.muted, fontFamily: FONT }}>
          {covered}/{total} skills
        </span>
      </div>
      <div
        style={{
          height: 7,
          borderRadius: "999px",
          background: "rgba(40,41,44,0.07)",
          overflow: "hidden",
        }}
      >
        <div
          className="td-bar-fill"
          style={{
            height: "100%",
            borderRadius: "999px",
            background: color,
            width: `${pct}%`,
          }}
        />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   STAT ROW
═══════════════════════════════════════════════════ */
function StatRow({
  icon,
  label,
  value,
  sub,
  accent = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0.75rem 0",
        borderBottom: `1px solid ${B.border}`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
        <div
          style={{
            width: 30,
            height: 30,
            borderRadius: "0.6rem",
            background: B.active,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: B.dark,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <div>
          <p
            style={{
              fontSize: "0.78rem",
              fontWeight: 600,
              color: B.dark,
              fontFamily: FONT,
            }}
          >
            {label}
          </p>
          {sub && (
            <p
              style={{ fontSize: "0.68rem", color: B.muted, fontFamily: FONT }}
            >
              {sub}
            </p>
          )}
        </div>
      </div>
      <span
        style={{
          fontSize: "1rem",
          fontWeight: 900,
          color: accent ? B.green : B.dark,
          fontFamily: FONT,
          letterSpacing: "-0.04em",
        }}
      >
        {value}
      </span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   MEMBER ROW
═══════════════════════════════════════════════════ */
interface MemberRowProps {
  member: Member;
  covered: Set<string>;
  isLeader: boolean;
  isCurrentUser: boolean;
  onRemove?: (id: string) => void;
}
function MemberRow({
  member,
  covered,
  isLeader,
  isCurrentUser,
  onRemove,
}: MemberRowProps) {
  const [removing, setRemoving] = useState(false);
  const skills = member.skills ?? [];

  const handleRemove = async () => {
    if (!onRemove || removing) return;
    setRemoving(true);
    onRemove(member._id);
  };

  return (
    <div
      className="td-row"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        padding: "1rem 1.5rem",
        borderBottom: `1px solid ${B.border}`,
        opacity: removing ? 0.4 : 1,
        transition: "opacity 0.3s",
      }}
    >
      {/* Avatar */}
      <Avatar name={member.name} size={40} />

      {/* Name + info */}
      <div style={{ flex: "0 0 180px", minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <p
            style={{
              fontSize: "0.88rem",
              fontWeight: 800,
              color: B.dark,
              fontFamily: FONT,
              letterSpacing: "-0.02em",
            }}
          >
            {member.name}
            {isCurrentUser && (
              <span style={{ color: B.muted, fontWeight: 500 }}> (you)</span>
            )}
          </p>
          {isLeader && (
            <Crown size={12} style={{ color: "#D97706", flexShrink: 0 }} />
          )}
        </div>
        <p style={{ fontSize: "0.72rem", color: B.muted, fontFamily: FONT }}>
          {member.branch ?? "KIET"}
        </p>
      </div>

      {/* Gender badge */}
      <div style={{ flex: "0 0 90px" }}>
        <GenderBadge gender={member.gender} />
      </div>

      {/* Skills */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexWrap: "wrap",
          gap: "0.3rem",
          minWidth: 0,
        }}
      >
        {skills.length === 0 ? (
          <span
            style={{
              fontSize: "0.72rem",
              color: B.muted,
              fontFamily: FONT,
              fontStyle: "italic",
            }}
          >
            No skills listed
          </span>
        ) : (
          skills.map((s) => (
            <SkillPill key={s} label={s} covered={covered.has(s)} />
          ))
        )}
      </div>

      {/* Actions */}
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          alignItems: "center",
          flexShrink: 0,
        }}
      >
        {!isLeader && !isCurrentUser && (
          <button
            className="td-remove-btn"
            onClick={handleRemove}
            disabled={removing}
            title="Remove member"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.3rem",
              padding: "0.45rem 0.85rem",
              borderRadius: "0.6rem",
              background: "none",
              border: `1px solid ${B.border}`,
              color: B.muted,
              fontSize: "0.75rem",
              fontWeight: 600,
              fontFamily: FONT,
              cursor: "pointer",
            }}
          >
            <UserMinus size={13} /> Remove
          </button>
        )}
        {isLeader && (
          <span
            style={{
              padding: "0.35rem 0.7rem",
              borderRadius: "0.6rem",
              background: "rgba(217,119,6,0.08)",
              color: "#D97706",
              fontSize: "0.72rem",
              fontWeight: 700,
              fontFamily: FONT,
              display: "inline-flex",
              alignItems: "center",
              gap: "0.3rem",
            }}
          >
            <Crown size={11} /> Leader
          </span>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   INVITE MODAL (inline, not a real modal)
═══════════════════════════════════════════════════ */
function InvitePanel({ code, onClose }: { code: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div
      className="td-fadein"
      style={{
        background: B.card,
        border: `1px solid ${B.border}`,
        borderRadius: "1.25rem",
        padding: "1.5rem",
        boxShadow: B.shadowH,
        marginBottom: "1.25rem",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "1rem",
        }}
      >
        <div>
          <p
            style={{
              fontSize: "0.93rem",
              fontWeight: 800,
              color: B.dark,
              fontFamily: FONT,
            }}
          >
            Invite to Team
          </p>
          <p
            style={{
              fontSize: "0.78rem",
              color: B.muted,
              fontFamily: FONT,
              marginTop: "0.15rem",
            }}
          >
            Share the code or link with your teammate.
          </p>
        </div>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: B.muted,
            display: "flex",
            padding: "2px",
          }}
        >
          ✕
        </button>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          background: B.active,
          borderRadius: "0.85rem",
          padding: "0.85rem 1rem",
        }}
      >
        <code
          style={{
            flex: 1,
            fontSize: "1.05rem",
            fontWeight: 900,
            color: B.dark,
            letterSpacing: "0.12em",
            fontFamily: "monospace",
          }}
        >
          {code}
        </code>
        <button
          className="td-copy-btn"
          onClick={copy}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.35rem",
            padding: "0.55rem 1rem",
            borderRadius: "999px",
            background: copied ? B.green : B.dark,
            color: "#fff",
            border: "none",
            cursor: "pointer",
            fontSize: "0.8rem",
            fontWeight: 700,
            fontFamily: FONT,
            transition: "background 0.18s",
          }}
        >
          {copied ? (
            <>
              <CheckCircle2 size={14} /> Copied!
            </>
          ) : (
            <>
              <Copy size={13} /> Copy
            </>
          )}
        </button>
      </div>

      <p
        style={{
          fontSize: "0.72rem",
          color: B.muted,
          fontFamily: FONT,
          marginTop: "0.85rem",
        }}
      >
        Teammates can use this code on the Join Team page. Code expires in 48
        hours.
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   STATS SIDEBAR
═══════════════════════════════════════════════════ */
interface StatsProps {
  team: Team;
}
function StatsSidebar({ team }: StatsProps) {
  const members = team.members;
  const femaleCount = members.filter((m) => m.gender === "female").length;
  const femaleOk = femaleCount >= team.required_female_members;
  const teamSkills = new Set(members.flatMap((m) => m.skills ?? []));
  const coveredCount = team.required_skills.filter((s) =>
    teamSkills.has(s),
  ).length;
  const slotsLeft = team.max_team_size - members.length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      {/* Stats card */}
      <div
        className="td-card"
        style={{
          background: B.card,
          borderRadius: "1.25rem",
          border: `1px solid ${B.border}`,
          boxShadow: B.shadow,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "1.2rem 1.4rem",
            borderBottom: `1px solid ${B.border}`,
          }}
        >
          <p
            style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              color: B.muted,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              fontFamily: FONT,
            }}
          >
            Team Stats
          </p>
        </div>
        <div style={{ padding: "0 1.4rem" }}>
          <StatRow
            icon={<Users size={15} />}
            label="Team Size"
            value={`${members.length}/${team.max_team_size}`}
            sub={
              slotsLeft > 0
                ? `${slotsLeft} slot${slotsLeft > 1 ? "s" : ""} open`
                : "Team full"
            }
          />
          <StatRow
            icon={<span style={{ fontSize: "0.85rem" }}>♀</span>}
            label="Female Members"
            value={femaleCount}
            sub={`Min. ${team.required_female_members} required`}
            accent={femaleOk}
          />
          <StatRow
            icon={<ShieldCheck size={15} />}
            label="Required Female"
            value={team.required_female_members}
            sub={femaleOk ? "Requirement met ✓" : "Not yet fulfilled"}
          />
        </div>

        {/* Skill coverage */}
        <div style={{ padding: "1rem 1.4rem 1.4rem" }}>
          <p
            style={{
              fontSize: "0.72rem",
              fontWeight: 700,
              color: B.muted,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              fontFamily: FONT,
              marginBottom: "0.75rem",
            }}
          >
            Skill Coverage
          </p>
          <CoverageBar
            covered={coveredCount}
            total={team.required_skills.length}
          />
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.3rem",
              marginTop: "0.85rem",
            }}
          >
            {team.required_skills.map((s) => (
              <SkillPill key={s} label={s} covered={teamSkills.has(s)} />
            ))}
          </div>
          <p
            style={{
              fontSize: "0.68rem",
              color: B.muted,
              fontFamily: FONT,
              marginTop: "0.6rem",
            }}
          >
            Dark = covered · Light = missing
          </p>
        </div>
      </div>

      {/* Warning alert */}
      {!femaleOk && (
        <div
          className="td-fadein"
          style={{
            background: "rgba(229,62,106,0.06)",
            border: "1px solid rgba(229,62,106,0.15)",
            borderRadius: "1rem",
            padding: "1rem 1.1rem",
            display: "flex",
            gap: "0.65rem",
            alignItems: "flex-start",
          }}
        >
          <AlertCircle
            size={16}
            style={{ color: B.rose, flexShrink: 0, marginTop: "1px" }}
          />
          <div>
            <p
              style={{
                fontSize: "0.78rem",
                fontWeight: 700,
                color: B.rose,
                fontFamily: FONT,
              }}
            >
              Female Requirement Unmet
            </p>
            <p
              style={{
                fontSize: "0.72rem",
                color: "#C0385A",
                fontFamily: FONT,
                marginTop: "0.2rem",
                lineHeight: 1.5,
              }}
            >
              SIH 2025 requires at least {team.required_female_members} female
              member. Add one to be eligible.
            </p>
          </div>
        </div>
      )}

      {/* Eligible badge */}
      {femaleOk &&
        coveredCount >= Math.ceil(team.required_skills.length * 0.6) && (
          <div
            style={{
              background: "rgba(56,161,105,0.07)",
              border: "1px solid rgba(56,161,105,0.18)",
              borderRadius: "1rem",
              padding: "1rem 1.1rem",
              display: "flex",
              gap: "0.65rem",
              alignItems: "center",
            }}
          >
            <Sparkles size={16} style={{ color: B.green, flexShrink: 0 }} />
            <div>
              <p
                style={{
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  color: B.green,
                  fontFamily: FONT,
                }}
              >
                Team Eligible!
              </p>
              <p
                style={{
                  fontSize: "0.72rem",
                  color: "#2E7D5A",
                  fontFamily: FONT,
                  marginTop: "0.15rem",
                }}
              >
                Requirements met. Ready to submit.
              </p>
            </div>
          </div>
        )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   NO TEAM STATE
═══════════════════════════════════════════════════ */
function NoTeamState({
  onCreate,
  onJoin,
}: {
  onCreate: () => void;
  onJoin: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "4rem 2rem",
        gap: "1.25rem",
        maxWidth: 420,
        margin: "0 auto",
        textAlign: "center",
      }}
    >
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: "1.5rem",
          background: B.active,
          color: B.muted,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Users size={32} />
      </div>
      <div>
        <p
          style={{
            fontSize: "1.1rem",
            fontWeight: 900,
            color: B.dark,
            fontFamily: FONT,
            letterSpacing: "-0.03em",
          }}
        >
          You're not in a team yet
        </p>
        <p
          style={{
            fontSize: "0.83rem",
            color: B.muted,
            fontFamily: FONT,
            marginTop: "0.4rem",
            lineHeight: 1.6,
          }}
        >
          Create a new team for your hackathon or join an existing one with an
          invite code.
        </p>
      </div>
      <div
        style={{
          display: "flex",
          gap: "0.75rem",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <button
          onClick={onCreate}
          style={{
            padding: "0.72rem 1.5rem",
            borderRadius: "999px",
            border: "none",
            background: B.dark,
            color: "#fff",
            fontSize: "0.85rem",
            fontWeight: 700,
            fontFamily: FONT,
            cursor: "pointer",
            boxShadow: "0 3px 12px rgba(40,41,44,0.18)",
          }}
        >
          + Create Team
        </button>
        <button
          onClick={onJoin}
          style={{
            padding: "0.72rem 1.5rem",
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
          Join with Code
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   JOIN WITH CODE PANEL
═══════════════════════════════════════════════════ */
function JoinPanel({
  onJoined,
  onCancel,
}: {
  onJoined: (team: Team) => void;
  onCancel: () => void;
}) {
  const [code, setCode] = useState("");
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const handleJoin = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setErr("");
    try {
      const res = await fetch(`${API}/api/teams/join/${code.trim()}`, {
        method: "POST",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to join team");
      onJoined(data.data ?? data.team ?? data);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="td-fadein"
      style={{
        background: B.card,
        border: `1px solid ${B.border}`,
        borderRadius: "1.25rem",
        padding: "1.75rem",
        boxShadow: B.shadowH,
        maxWidth: 400,
        margin: "0 auto",
      }}
    >
      <p
        style={{
          fontSize: "0.97rem",
          fontWeight: 800,
          color: B.dark,
          fontFamily: FONT,
          marginBottom: "0.35rem",
        }}
      >
        Join a Team
      </p>
      <p
        style={{
          fontSize: "0.78rem",
          color: B.muted,
          fontFamily: FONT,
          marginBottom: "1.25rem",
        }}
      >
        Enter the Team ID your team leader shared.
      </p>
      <input
        value={code}
        onChange={(e) => setCode(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Paste Team ID here…"
        style={{
          width: "100%",
          fontFamily: "monospace",
          padding: "0.8rem 1rem",
          borderRadius: "0.75rem",
          border: `1.5px solid ${focused ? B.dark : B.border}`,
          background: focused ? B.card : "rgba(40,41,44,0.02)",
          fontSize: "0.95rem",
          color: B.dark,
          letterSpacing: "0.04em",
          outline: "none",
          transition: "all 0.18s",
          boxSizing: "border-box",
          boxShadow: focused ? "0 0 0 3px rgba(40,41,44,0.05)" : "none",
        }}
      />
      {err && (
        <p
          style={{
            fontSize: "0.75rem",
            color: B.rose,
            fontFamily: FONT,
            marginTop: "0.4rem",
          }}
        >
          {err}
        </p>
      )}
      <div style={{ display: "flex", gap: "0.65rem", marginTop: "1rem" }}>
        <button
          onClick={handleJoin}
          disabled={code.length < 5 || loading}
          style={{
            flex: 1,
            padding: "0.72rem",
            borderRadius: "999px",
            border: "none",
            background:
              code.length >= 5 && !loading ? B.dark : "rgba(40,41,44,0.12)",
            color: code.length >= 5 && !loading ? "#fff" : B.muted,
            fontSize: "0.85rem",
            fontWeight: 700,
            fontFamily: FONT,
            cursor: code.length >= 5 && !loading ? "pointer" : "not-allowed",
            transition: "all 0.18s",
          }}
        >
          {loading ? "Joining…" : "Join Team"}
        </button>
        <button
          onClick={onCancel}
          style={{
            padding: "0.72rem 1.2rem",
            borderRadius: "999px",
            border: `1px solid ${B.border}`,
            background: "none",
            color: B.muted,
            fontSize: "0.85rem",
            fontFamily: FONT,
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   CREATE TEAM MODAL
═══════════════════════════════════════════════════ */
function CreateTeamModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (team: Team) => void;
}) {
  const [form, setForm] = useState({
    team_name: "",
    hackathon_name: "",
    max_team_size: 6,
    required_female_members: 1,
    required_skills: "",
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const set = (k: keyof typeof form, v: string | number) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleCreate = async () => {
    if (!form.team_name.trim() || !form.hackathon_name.trim()) {
      setErr("Team name and hackathon name are required.");
      return;
    }
    setLoading(true);
    setErr("");
    try {
      const body = {
        team_name: form.team_name.trim(),
        hackathon_name: form.hackathon_name.trim(),
        max_team_size: form.max_team_size,
        required_female_members: form.required_female_members,
        required_skills: form.required_skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };
      const res = await fetch(`${API}/api/teams/create`, {
        method: "POST",
        headers: { ...authHeaders(), "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create team");
      onCreated(data.data ?? data.team ?? data);
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (focused: boolean): React.CSSProperties => ({
    width: "100%",
    fontFamily: FONT,
    padding: "0.7rem 0.9rem",
    borderRadius: "0.65rem",
    border: `1.5px solid ${focused ? B.dark : B.border}`,
    background: B.card,
    fontSize: "0.88rem",
    color: B.dark,
    outline: "none",
    transition: "all 0.18s",
    boxSizing: "border-box",
  });

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
    >
      <div
        className="td-fadein"
        style={{
          background: B.card,
          borderRadius: "1.5rem",
          border: `1px solid ${B.border}`,
          boxShadow: B.shadowH,
          padding: "2rem",
          width: "100%",
          maxWidth: 460,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
          }}
        >
          <p
            style={{
              fontSize: "1rem",
              fontWeight: 900,
              color: B.dark,
              fontFamily: FONT,
              letterSpacing: "-0.03em",
            }}
          >
            Create New Team
          </p>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: B.muted,
              padding: "0.2rem",
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}
        >
          <FieldBlock label="Team Name" required>
            <FocusInput
              value={form.team_name}
              onChange={(v) => set("team_name", v)}
              placeholder="e.g. Code Ninjas"
              style={inputStyle}
            />
          </FieldBlock>
          <FieldBlock label="Hackathon Name" required>
            <FocusInput
              value={form.hackathon_name}
              onChange={(v) => set("hackathon_name", v)}
              placeholder="e.g. SIH 2025"
              style={inputStyle}
            />
          </FieldBlock>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <FieldBlock label="Max Team Size" style={{ flex: 1 }}>
              <select
                value={form.max_team_size}
                onChange={(e) => set("max_team_size", Number(e.target.value))}
                style={{ ...inputStyle(false), cursor: "pointer" }}
              >
                {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </FieldBlock>
            <FieldBlock label="Min Female Members" style={{ flex: 1 }}>
              <select
                value={form.required_female_members}
                onChange={(e) =>
                  set("required_female_members", Number(e.target.value))
                }
                style={{ ...inputStyle(false), cursor: "pointer" }}
              >
                {[0, 1, 2, 3].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </FieldBlock>
          </div>
          <FieldBlock label="Required Skills (comma-separated)">
            <FocusInput
              value={form.required_skills}
              onChange={(v) => set("required_skills", v)}
              placeholder="e.g. React, Node.js, ML"
              style={inputStyle}
            />
          </FieldBlock>
        </div>

        {err && (
          <p
            style={{
              fontSize: "0.75rem",
              color: B.rose,
              fontFamily: FONT,
              marginTop: "0.75rem",
            }}
          >
            {err}
          </p>
        )}

        <div style={{ display: "flex", gap: "0.65rem", marginTop: "1.5rem" }}>
          <button
            onClick={handleCreate}
            disabled={loading}
            style={{
              flex: 1,
              padding: "0.78rem",
              borderRadius: "999px",
              border: "none",
              background: loading ? "rgba(40,41,44,0.12)" : B.dark,
              color: loading ? B.muted : "#fff",
              fontSize: "0.88rem",
              fontWeight: 700,
              fontFamily: FONT,
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: loading ? "none" : "0 3px 12px rgba(40,41,44,0.2)",
            }}
          >
            {loading ? "Creating…" : "Create Team"}
          </button>
          <button
            onClick={onClose}
            style={{
              padding: "0.78rem 1.2rem",
              borderRadius: "999px",
              border: `1px solid ${B.border}`,
              background: "none",
              color: B.muted,
              fontSize: "0.88rem",
              fontFamily: FONT,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

/* tiny helpers used inside CreateTeamModal */
function FieldBlock({
  label,
  required,
  style,
  children,
}: {
  label: string;
  required?: boolean;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.3rem",
        ...style,
      }}
    >
      <label
        style={{
          fontSize: "0.72rem",
          fontWeight: 700,
          color: B.muted,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          fontFamily: FONT,
        }}
      >
        {label}
        {required && <span style={{ color: B.rose }}> *</span>}
      </label>
      {children}
    </div>
  );
}
function FocusInput({
  value,
  onChange,
  placeholder,
  style,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  style: (f: boolean) => React.CSSProperties;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={style(focused)}
    />
  );
}

/* ═══════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════ */
export default function TeamsPage() {
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const team = allTeams[selectedIdx] ?? null;
  const [loading, setLoading] = useState(true);
  const [pageErr, setPageErr] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");
  const [joinMode, setJoinMode] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [tab, setTab] = useState<"overview" | "chat">("overview");
  const [showSwitcher, setShowSwitcher] = useState(false);

  // Load team and current user on mount
  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const [teamsRes, meRes] = await Promise.all([
          fetch(`${API}/api/teams/user/my-teams`, { headers: authHeaders() }),
          fetch(`${API}/api/users/me`, { headers: authHeaders() }),
        ]);
        if (!alive) return;
        if (teamsRes.ok) {
          const d = await teamsRes.json();
          const list: Team[] = d.data ?? d.teams ?? d;
          if (Array.isArray(list)) setAllTeams(list);
        }
        if (meRes.ok) {
          const u = await meRes.json();
          setCurrentUserId((u.data ?? u)?._id ?? "");
        }
      } catch {
        if (alive) setPageErr("Failed to load team data.");
      } finally {
        if (alive) setLoading(false);
      }
    };
    load();
    return () => {
      alive = false;
    };
  }, []);

  const handleRemoveMember = async (memberId: string) => {
    if (!team) return;
    try {
      const res = await fetch(
        `${API}/api/teams/remove/${team._id}/${memberId}`,
        {
          method: "DELETE",
          headers: authHeaders(),
        },
      );
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.message);
      }
      setAllTeams((prev) =>
        prev.map((t, i) =>
          i === selectedIdx
            ? { ...t, members: t.members.filter((m) => m._id !== memberId) }
            : t,
        ),
      );
    } catch (e: any) {
      alert(e.message || "Could not remove member.");
    }
  };

  const handleJoined = (t: Team) => {
    setAllTeams((prev) => [t, ...prev.filter((x) => x._id !== t._id)]);
    setSelectedIdx(0);
    setJoinMode(false);
  };
  const handleCreated = (t: Team) => {
    setAllTeams((prev) => [t, ...prev.filter((x) => x._id !== t._id)]);
    setSelectedIdx(0);
    setShowCreate(false);
  };

  const handleDeleteTeam = async () => {
    if (!team) return;
    if (
      !window.confirm(`Delete team "${team.team_name}"? This cannot be undone.`)
    )
      return;
    try {
      const res = await fetch(`${API}/api/teams/${team._id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.message || "Failed to delete team");
      }
      setAllTeams((prev) => {
        const next = prev.filter((_, i) => i !== selectedIdx);
        setSelectedIdx(0);
        return next;
      });
    } catch (e: any) {
      alert(e.message || "Could not delete team.");
    }
  };

  const handleLeaveTeam = async () => {
    if (!team) return;
    if (!window.confirm(`Leave team "${team.team_name}"?`)) return;
    try {
      const res = await fetch(`${API}/api/teams/leave/${team._id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.message || "Failed to leave team");
      }
      setAllTeams((prev) => {
        const next = prev.filter((_, i) => i !== selectedIdx);
        setSelectedIdx(0);
        return next;
      });
    } catch (e: any) {
      alert(e.message || "Could not leave team.");
    }
  };

  // Covered skills set
  const teamSkills = new Set(
    team ? team.members.flatMap((m) => m.skills ?? []) : [],
  );
  const coveredSkills = new Set(
    team ? team.required_skills.filter((s) => teamSkills.has(s)) : [],
  );

  // ── Loading state ──
  if (loading) {
    return (
      <>
        <StyleInject />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 300,
          }}
        >
          <Loader2
            size={28}
            style={{ color: B.muted, animation: "spin 1s linear infinite" }}
          />
        </div>
      </>
    );
  }

  // ── No team state ──
  if (allTeams.length === 0) {
    return (
      <>
        <StyleInject />
        {showCreate && (
          <CreateTeamModal
            onClose={() => setShowCreate(false)}
            onCreated={handleCreated}
          />
        )}
        <div
          style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
        >
          <div>
            <h1
              style={{
                fontSize: "1.3rem",
                fontWeight: 900,
                color: B.dark,
                letterSpacing: "-0.04em",
                fontFamily: FONT,
              }}
            >
              Teams
            </h1>
            <p
              style={{
                fontSize: "0.82rem",
                color: B.muted,
                fontFamily: FONT,
                marginTop: "0.25rem",
              }}
            >
              Collaborate with teammates on hackathons.
            </p>
          </div>
          {pageErr && (
            <p style={{ fontSize: "0.8rem", color: B.rose, fontFamily: FONT }}>
              {pageErr}
            </p>
          )}
          <div
            style={{
              background: B.card,
              border: `1px solid ${B.border}`,
              borderRadius: "1.5rem",
              boxShadow: B.shadow,
            }}
          >
            {joinMode ? (
              <div style={{ padding: "2rem" }}>
                <JoinPanel
                  onJoined={handleJoined}
                  onCancel={() => setJoinMode(false)}
                />
              </div>
            ) : (
              <NoTeamState
                onCreate={() => setShowCreate(true)}
                onJoin={() => setJoinMode(true)}
              />
            )}
          </div>
        </div>
      </>
    );
  }

  const members = team.members;
  const slotsLeft = team.max_team_size - members.length;
  const isLeader =
    (typeof team.created_by === "object"
      ? team.created_by._id
      : team.created_by) === currentUserId;

  return (
    <>
      <StyleInject />
      {showCreate && (
        <CreateTeamModal
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
        />
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {/* ── Page breadcrumb + team switcher ── */}
        <div
          className="td-fadein"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{ fontSize: "0.8rem", color: B.muted, fontFamily: FONT }}
          >
            Teams
          </span>
          <ChevronRight size={13} style={{ color: B.muted }} />
          {/* Team name — clickable dropdown if multiple teams */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => allTeams.length > 1 && setShowSwitcher((v) => !v)}
              style={{
                fontSize: "0.8rem",
                fontWeight: 700,
                color: B.dark,
                fontFamily: FONT,
                background: allTeams.length > 1 ? B.active : "transparent",
                border: allTeams.length > 1 ? `1px solid ${B.border}` : "none",
                borderRadius: "0.5rem",
                padding: allTeams.length > 1 ? "0.25rem 0.6rem" : "0",
                cursor: allTeams.length > 1 ? "pointer" : "default",
                display: "flex",
                alignItems: "center",
                gap: "0.3rem",
              }}
            >
              {team.team_name}
              {allTeams.length > 1 && (
                <ChevronRight
                  size={12}
                  style={{
                    transform: showSwitcher ? "rotate(90deg)" : "rotate(0deg)",
                    transition: "transform 0.15s",
                  }}
                />
              )}
            </button>
            {showSwitcher && allTeams.length > 1 && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 6px)",
                  left: 0,
                  zIndex: 50,
                  background: B.card,
                  border: `1px solid ${B.border}`,
                  borderRadius: "0.85rem",
                  boxShadow: B.shadowH,
                  minWidth: 200,
                  overflow: "hidden",
                }}
              >
                {allTeams.map((t, i) => (
                  <button
                    key={t._id}
                    onClick={() => {
                      setSelectedIdx(i);
                      setShowSwitcher(false);
                      setTab("overview");
                    }}
                    style={{
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      padding: "0.65rem 1rem",
                      border: "none",
                      cursor: "pointer",
                      background: i === selectedIdx ? B.active : "transparent",
                      fontSize: "0.82rem",
                      fontWeight: i === selectedIdx ? 700 : 500,
                      color: B.dark,
                      fontFamily: FONT,
                    }}
                  >
                    {t.team_name}
                    <span
                      style={{
                        fontSize: "0.7rem",
                        color: B.muted,
                        marginLeft: "0.4rem",
                      }}
                    >
                      {t.hackathon_name}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Spacer */}
          <div style={{ flex: 1 }} />
          {/* Always-visible Create New Team button */}
          <button
            onClick={() => setShowCreate(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.35rem",
              padding: "0.45rem 1rem",
              borderRadius: "999px",
              border: `1.5px solid ${B.border}`,
              background: B.card,
              color: B.dark,
              fontSize: "0.78rem",
              fontWeight: 700,
              fontFamily: FONT,
              cursor: "pointer",
              boxShadow: B.shadow,
            }}
          >
            <Plus size={13} /> New Team
          </button>
        </div>

        {/* ── Overview / Chat tab switcher ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            background: B.card,
            border: `1px solid ${B.border}`,
            borderRadius: "999px",
            padding: "0.3rem",
            width: "fit-content",
            boxShadow: B.shadow,
          }}
        >
          {(
            [
              ["overview", "Overview", Users],
              ["chat", "Chat", MessageSquare],
            ] as const
          ).map(([v, label, Icon]) => {
            const active = tab === v;
            return (
              <button
                key={v}
                onClick={() => setTab(v)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  padding: "0.45rem 1.1rem",
                  borderRadius: "999px",
                  border: "none",
                  background: active ? B.dark : "transparent",
                  color: active ? "#fff" : B.muted,
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  fontFamily: FONT,
                  cursor: "pointer",
                  transition: "all 0.18s",
                }}
              >
                <Icon size={14} />
                {label}
              </button>
            );
          })}
        </div>

        {/* ── Chat tab ── */}
        {tab === "chat" && <TeamChatPage teamId={team._id} />}

        {/* ── Overview tab ── */}
        {tab === "overview" && (
          <>
            {/* ── Invite panel (conditional) ── */}
            {showInvite && (
              <InvitePanel
                code={team._id}
                onClose={() => setShowInvite(false)}
              />
            )}

            {/* ── BODY: Left content + Right sidebar ── */}
            <div
              style={{
                display: "flex",
                gap: "1.5rem",
                alignItems: "flex-start",
                flexWrap: "wrap",
              }}
            >
              {/* LEFT */}
              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.25rem",
                }}
              >
                {/* ── Team Header Card ── */}
                <div
                  className="td-card td-fadein"
                  style={{
                    background: B.dark,
                    borderRadius: "1.25rem",
                    boxShadow: "0 4px 20px rgba(40,41,44,0.18)",
                    padding: "1.75rem 2rem",
                    animationDelay: "0ms",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: "1rem",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.45rem",
                          marginBottom: "0.6rem",
                        }}
                      >
                        <Trophy
                          size={14}
                          style={{ color: "rgba(243,243,243,0.55)" }}
                        />
                        <span
                          style={{
                            fontSize: "0.75rem",
                            color: "rgba(243,243,243,0.55)",
                            fontFamily: FONT,
                            fontWeight: 600,
                          }}
                        >
                          {team.hackathon_name}
                        </span>
                      </div>
                      <h1
                        style={{
                          fontSize: "2rem",
                          fontWeight: 900,
                          color: "#F3F3F3",
                          letterSpacing: "-0.05em",
                          fontFamily: FONT,
                          lineHeight: 1.1,
                          marginBottom: "0.4rem",
                        }}
                      >
                        {team.team_name}
                      </h1>
                      <p
                        style={{
                          fontSize: "0.78rem",
                          color: "rgba(243,243,243,0.5)",
                          fontFamily: FONT,
                        }}
                      >
                        {members.length} member{members.length !== 1 ? "s" : ""}{" "}
                        ·{" "}
                        {slotsLeft > 0
                          ? `${slotsLeft} slot${slotsLeft > 1 ? "s" : ""} open`
                          : "Team full"}
                      </p>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        gap: "0.65rem",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          background: "rgba(243,243,243,0.10)",
                          borderRadius: "999px",
                          padding: "0.45rem 1rem",
                        }}
                      >
                        <Users
                          size={14}
                          style={{ color: "rgba(243,243,243,0.7)" }}
                        />
                        <span
                          style={{
                            fontSize: "0.85rem",
                            fontWeight: 800,
                            color: "#F3F3F3",
                            fontFamily: FONT,
                          }}
                        >
                          {members.length} / {team.max_team_size} Members
                        </span>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: "0.5rem",
                          flexWrap: "wrap",
                        }}
                      >
                        {slotsLeft > 0 && (
                          <button
                            onClick={() => setShowInvite((v) => !v)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.4rem",
                              padding: "0.55rem 1.1rem",
                              borderRadius: "999px",
                              background: "rgba(243,243,243,0.13)",
                              border: "1px solid rgba(243,243,243,0.18)",
                              color: "#F3F3F3",
                              cursor: "pointer",
                              fontSize: "0.8rem",
                              fontWeight: 700,
                              fontFamily: FONT,
                              transition: "background 0.15s",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.background =
                                "rgba(243,243,243,0.22)")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.background =
                                "rgba(243,243,243,0.13)")
                            }
                          >
                            <Share2 size={13} /> Invite
                          </button>
                        )}
                        {isLeader ? (
                          <button
                            onClick={handleDeleteTeam}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.4rem",
                              padding: "0.55rem 1.1rem",
                              borderRadius: "999px",
                              background: "rgba(229,62,106,0.18)",
                              border: "1px solid rgba(229,62,106,0.35)",
                              color: "#FFB3C1",
                              cursor: "pointer",
                              fontSize: "0.8rem",
                              fontWeight: 700,
                              fontFamily: FONT,
                              transition: "background 0.15s",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.background =
                                "rgba(229,62,106,0.30)")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.background =
                                "rgba(229,62,106,0.18)")
                            }
                          >
                            <Trash2 size={13} /> Delete Team
                          </button>
                        ) : (
                          <button
                            onClick={handleLeaveTeam}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.4rem",
                              padding: "0.55rem 1.1rem",
                              borderRadius: "999px",
                              background: "rgba(243,243,243,0.10)",
                              border: "1px solid rgba(243,243,243,0.18)",
                              color: "rgba(243,243,243,0.75)",
                              cursor: "pointer",
                              fontSize: "0.8rem",
                              fontWeight: 700,
                              fontFamily: FONT,
                              transition: "background 0.15s",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.background =
                                "rgba(243,243,243,0.20)")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.background =
                                "rgba(243,243,243,0.10)")
                            }
                          >
                            <LogOut size={13} /> Leave Team
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Members avatar row */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      marginTop: "1.5rem",
                    }}
                  >
                    <div style={{ display: "flex" }}>
                      {members.slice(0, 5).map((m, i) => {
                        const hue = namehue(m.name);
                        return (
                          <div
                            key={m._id}
                            title={m.name}
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: "50%",
                              background: m.avatar
                                ? "transparent"
                                : `hsl(${hue},12%,22%)`,
                              border: "2px solid rgba(243,243,243,0.25)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "0.65rem",
                              fontWeight: 800,
                              color: "#fff",
                              fontFamily: FONT,
                              marginLeft: i === 0 ? 0 : -8,
                              zIndex: members.length - i,
                              position: "relative",
                              overflow: "hidden",
                            }}
                          >
                            {m.avatar ? (
                              <img
                                src={m.avatar}
                                alt={m.name}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />
                            ) : (
                              initials(m.name)
                            )}
                          </div>
                        );
                      })}
                      {slotsLeft > 0 && (
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            background: "rgba(243,243,243,0.10)",
                            border: "2px dashed rgba(243,243,243,0.25)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.75rem",
                            color: "rgba(243,243,243,0.4)",
                            fontFamily: FONT,
                            marginLeft: -8,
                            cursor: "pointer",
                          }}
                          onClick={() => setShowInvite(true)}
                          title="Add member"
                        >
                          +
                        </div>
                      )}
                    </div>
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "rgba(243,243,243,0.5)",
                        fontFamily: FONT,
                        marginLeft: "0.5rem",
                      }}
                    >
                      {slotsLeft} slot{slotsLeft !== 1 ? "s" : ""} remaining
                    </span>
                  </div>
                </div>

                {/* ── Members Card ── */}
                <div
                  className="td-fadein"
                  style={{
                    background: B.card,
                    borderRadius: "1.25rem",
                    border: `1px solid ${B.border}`,
                    boxShadow: B.shadow,
                    overflow: "hidden",
                    animationDelay: "70ms",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "1.1rem 1.5rem",
                      borderBottom: `1px solid ${B.border}`,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <Users size={15} style={{ color: B.dark }} />
                      <span
                        style={{
                          fontSize: "0.9rem",
                          fontWeight: 800,
                          color: B.dark,
                          fontFamily: FONT,
                          letterSpacing: "-0.02em",
                        }}
                      >
                        Members
                      </span>
                      <span
                        style={{
                          padding: "0.15rem 0.55rem",
                          borderRadius: "999px",
                          background: B.active,
                          color: B.muted,
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          fontFamily: FONT,
                        }}
                      >
                        {members.length}
                      </span>
                    </div>
                    {slotsLeft > 0 && (
                      <button
                        className="td-invite-btn"
                        onClick={() => setShowInvite((v) => !v)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.4rem",
                          padding: "0.55rem 1.1rem",
                          borderRadius: "999px",
                          border: "none",
                          background: B.dark,
                          color: "#fff",
                          fontSize: "0.8rem",
                          fontWeight: 700,
                          fontFamily: FONT,
                          cursor: "pointer",
                          boxShadow: "0 3px 10px rgba(40,41,44,0.18)",
                        }}
                      >
                        <UserPlus size={14} /> Invite Member
                      </button>
                    )}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      padding: "0.65rem 1.5rem",
                      background: "rgba(40,41,44,0.02)",
                      borderBottom: `1px solid ${B.border}`,
                    }}
                  >
                    <div style={{ width: 40, flexShrink: 0 }} />
                    <p style={{ ...colLabel, flex: "0 0 180px" }}>Member</p>
                    <p style={{ ...colLabel, flex: "0 0 90px" }}>Gender</p>
                    <p style={{ ...colLabel, flex: 1 }}>Skills</p>
                    <p
                      style={{
                        ...colLabel,
                        flex: "0 0 100px",
                        textAlign: "right",
                      }}
                    >
                      Actions
                    </p>
                  </div>

                  {members.map((m) => (
                    <MemberRow
                      key={m._id}
                      member={m}
                      covered={coveredSkills}
                      isLeader={
                        m._id ===
                        (typeof team.created_by === "object"
                          ? team.created_by._id
                          : team.created_by)
                      }
                      isCurrentUser={m._id === currentUserId}
                      onRemove={isLeader ? handleRemoveMember : undefined}
                    />
                  ))}

                  {Array.from({ length: slotsLeft }).map((_, i) => (
                    <div
                      key={`slot-${i}`}
                      style={{
                        padding: "1rem 1.5rem",
                        borderBottom: `1px dashed ${B.border}`,
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        opacity: 0.5,
                      }}
                    >
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          border: `2px dashed rgba(40,41,44,0.12)`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <UserPlus size={14} style={{ color: B.muted }} />
                      </div>
                      <span
                        style={{
                          fontSize: "0.82rem",
                          color: B.muted,
                          fontFamily: FONT,
                          fontStyle: "italic",
                        }}
                      >
                        Open slot — invite a teammate
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT SIDEBAR */}
              <div
                style={{
                  width: 280,
                  flexShrink: 0,
                  position: "sticky",
                  top: "1rem",
                  alignSelf: "flex-start",
                }}
              >
                <StatsSidebar team={team} />
              </div>
            </div>

            <div style={{ height: "1.5rem" }} />
          </>
        )}
      </div>
    </>
  );
}

const colLabel: React.CSSProperties = {
  fontSize: "0.68rem",
  fontWeight: 700,
  color: B.muted,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  fontFamily: FONT,
};
