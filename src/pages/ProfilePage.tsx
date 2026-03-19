import React, { useState, useRef, useEffect } from "react";
import {
  Camera,
  Github,
  Linkedin,
  Globe,
  X,
  Check,
  Edit3,
  MapPin,
  BookOpen,
  Briefcase,
  ChevronDown,
  Save,
  Loader2,
} from "lucide-react";

const API = (import.meta as any).env?.VITE_API_URL || "http://localhost:3000";
const TOKEN_KEY = "kiet_token";

/* ═══════════════════════════════════════════════════
   BRAND (mirrors StudentDashboard.tsx)
═══════════════════════════════════════════════════ */
const B = {
  bg: "#F3F3F3",
  card: "#FFFFFF",
  dark: "#28292C",
  muted: "#96979A",
  border: "rgba(40,41,44,0.07)",
  active: "rgba(40,41,44,0.06)",
  shadow: "0 2px 12px rgba(40,41,44,0.06)",
  tag: "rgba(40,41,44,0.08)",
  green: "#38A169",
  err: "#E53E3E",
} as const;

const FONT = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif";

const CSS = `
.pp-fadein { animation: ppFadeIn 0.42s cubic-bezier(.4,0,.2,1) both; }
@keyframes ppFadeIn {
  from { opacity:0; transform:translateY(16px); }
  to   { opacity:1; transform:translateY(0); }
}
.pp-card-lift {
  transition: box-shadow 0.22s ease, border-color 0.22s ease;
}
.pp-card-lift:hover {
  box-shadow: 0 10px 32px rgba(40,41,44,0.10) !important;
}
.pp-tag { display:inline-flex; align-items:center; gap:0.35rem;
  padding:0.28rem 0.7rem 0.28rem 0.85rem; border-radius:999px;
  background:rgba(40,41,44,0.08); color:#28292C;
  font-size:0.78rem; font-weight:600; font-family:Inter,sans-serif;
  transition: background 0.15s;
}
.pp-tag:hover { background:rgba(40,41,44,0.13); }
.pp-tag-del { background:none; border:none; cursor:pointer; 
  color:#96979A; display:flex; align-items:center; padding:0;
  transition:color 0.15s; }
.pp-tag-del:hover { color:#28292C; }
.pp-input:focus { outline:none; }
.pp-toggle-knob { transition: transform 0.22s cubic-bezier(.4,0,.2,1); }
.pp-textarea { resize:vertical; min-height:96px; }
.pp-field:focus-within label { color:#28292C; }
`;

function StyleInject() {
  useEffect(() => {
    if (document.getElementById("pp-style")) return;
    const el = document.createElement("style");
    el.id = "pp-style";
    el.textContent = CSS;
    document.head.appendChild(el);
    return () => el.remove();
  }, []);
  return null;
}

/* ═══════════════════════════════════════════════════
   TYPES
═══════════════════════════════════════════════════ */
export interface ProfileUser {
  id: string;
  name: string;
  email: string;
  branch?: string;
  passout_year?: number;
  academicYear?: number; // virtual from backend, read-only
  avatar?: string;
  bio?: string;
  skills?: string[];
  interests?: string[];
  availability_status?: string;
  github_url?: string;
  linkedin_url?: string;
  website_url?: string;
}

interface ProfileData {
  bio: string;
  skills: string[];
  interests: string[];
  github: string;
  linkedin: string;
  website: string;
  available: boolean;
}

/* ═══════════════════════════════════════════════════
   SECTION WRAPPER
═══════════════════════════════════════════════════ */
function Section({
  title,
  subtitle,
  children,
  delay = 0,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <div
      className="pp-card-lift pp-fadein"
      style={{
        background: B.card,
        borderRadius: "1.25rem",
        border: `1px solid ${B.border}`,
        boxShadow: B.shadow,
        padding: "1.75rem 2rem",
        animationDelay: `${delay}ms`,
      }}
    >
      <div style={{ marginBottom: subtitle ? "0.3rem" : "1.5rem" }}>
        <h2
          style={{
            fontSize: "0.97rem",
            fontWeight: 800,
            color: B.dark,
            letterSpacing: "-0.02em",
            fontFamily: FONT,
          }}
        >
          {title}
        </h2>
        {subtitle && (
          <p
            style={{
              fontSize: "0.78rem",
              color: B.muted,
              fontFamily: FONT,
              marginTop: "0.2rem",
              marginBottom: "1.5rem",
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   FORM FIELD
═══════════════════════════════════════════════════ */
interface FieldProps {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}
function FormField({ label, icon, children }: FieldProps) {
  return (
    <div
      className="pp-field"
      style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}
    >
      <label
        style={{
          fontSize: "0.75rem",
          fontWeight: 700,
          color: B.muted,
          letterSpacing: "0.02em",
          display: "flex",
          alignItems: "center",
          gap: "0.35rem",
          fontFamily: FONT,
          transition: "color 0.15s",
          textTransform: "uppercase",
        }}
      >
        {icon && <span style={{ display: "flex", opacity: 0.7 }}>{icon}</span>}
        {label}
      </label>
      {children}
    </div>
  );
}

function StyledInput({
  value,
  onChange,
  placeholder,
  type = "text",
  prefix,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  prefix?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        background: focused ? B.card : "rgba(40,41,44,0.02)",
        border: `1.5px solid ${focused ? B.dark : B.border}`,
        borderRadius: "0.75rem",
        overflow: "hidden",
        transition: "border-color 0.2s, background 0.2s, box-shadow 0.2s",
        boxShadow: focused ? "0 0 0 3px rgba(40,41,44,0.05)" : "none",
      }}
    >
      {prefix && (
        <span
          style={{
            padding: "0 0.6rem 0 0.9rem",
            fontSize: "0.83rem",
            color: B.muted,
            fontFamily: FONT,
            userSelect: "none",
            flexShrink: 0,
          }}
        >
          {prefix}
        </span>
      )}
      <input
        type={type}
        value={value}
        className="pp-input"
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          flex: 1,
          border: "none",
          outline: "none",
          background: "transparent",
          padding: prefix ? "0.72rem 0.9rem 0.72rem 0" : "0.72rem 1rem",
          fontSize: "0.875rem",
          color: B.dark,
          fontFamily: FONT,
        }}
      />
    </div>
  );
}

function StyledTextarea({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="pp-input pp-textarea"
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        width: "100%",
        fontFamily: FONT,
        background: focused ? B.card : "rgba(40,41,44,0.02)",
        border: `1.5px solid ${focused ? B.dark : B.border}`,
        borderRadius: "0.75rem",
        padding: "0.8rem 1rem",
        fontSize: "0.875rem",
        color: B.dark,
        transition: "all 0.2s",
        lineHeight: 1.65,
        boxShadow: focused ? "0 0 0 3px rgba(40,41,44,0.05)" : "none",
      }}
    />
  );
}

/* ═══════════════════════════════════════════════════
   TAG INPUT
═══════════════════════════════════════════════════ */
interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  suggestions?: string[];
}
function TagInput({
  tags,
  onChange,
  placeholder = "Type & press Enter",
  maxTags = 20,
  suggestions = [],
}: TagInputProps) {
  const [input, setInput] = useState("");
  const [focused, setFocused] = useState(false);
  const [showSug, setShowSug] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = suggestions.filter(
    (s) => s.toLowerCase().includes(input.toLowerCase()) && !tags.includes(s),
  );

  const add = (val: string) => {
    const trimmed = val.trim();
    if (!trimmed || tags.includes(trimmed) || tags.length >= maxTags) return;
    onChange([...tags, trimmed]);
    setInput("");
    setShowSug(false);
  };

  const remove = (tag: string) => onChange(tags.filter((t) => t !== tag));

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      add(input);
    } else if (e.key === "Backspace" && !input && tags.length) {
      onChange(tags.slice(0, -1));
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <div
        onClick={() => inputRef.current?.focus()}
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.45rem",
          alignItems: "center",
          background: focused ? B.card : "rgba(40,41,44,0.02)",
          border: `1.5px solid ${focused ? B.dark : B.border}`,
          borderRadius: "0.75rem",
          padding: "0.6rem 0.75rem",
          cursor: "text",
          transition: "all 0.2s",
          boxShadow: focused ? "0 0 0 3px rgba(40,41,44,0.05)" : "none",
          minHeight: "48px",
        }}
      >
        {tags.map((tag) => (
          <span key={tag} className="pp-tag">
            {tag}
            <button
              className="pp-tag-del"
              onClick={(e) => {
                e.stopPropagation();
                remove(tag);
              }}
            >
              <X size={11} strokeWidth={2.5} />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setShowSug(true);
          }}
          onKeyDown={onKey}
          onFocus={() => {
            setFocused(true);
            setShowSug(true);
          }}
          onBlur={() => {
            setFocused(false);
            setTimeout(() => setShowSug(false), 150);
          }}
          placeholder={tags.length === 0 ? placeholder : "+ Add more"}
          className="pp-input"
          style={{
            border: "none",
            outline: "none",
            background: "transparent",
            fontSize: "0.83rem",
            color: B.dark,
            fontFamily: FONT,
            minWidth: 120,
            flex: 1,
          }}
        />
      </div>

      {/* Suggestions dropdown */}
      {showSug && filtered.length > 0 && input.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            zIndex: 20,
            background: B.card,
            border: `1px solid ${B.border}`,
            borderRadius: "0.75rem",
            boxShadow: "0 8px 24px rgba(40,41,44,0.10)",
            overflow: "hidden",
          }}
        >
          {filtered.slice(0, 6).map((s) => (
            <div
              key={s}
              onMouseDown={() => add(s)}
              style={{
                padding: "0.65rem 1rem",
                fontSize: "0.83rem",
                color: B.dark,
                fontFamily: FONT,
                cursor: "pointer",
                transition: "background 0.12s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = B.active)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              {s}
            </div>
          ))}
        </div>
      )}

      <p
        style={{
          fontSize: "0.7rem",
          color: B.muted,
          fontFamily: FONT,
          marginTop: "0.4rem",
        }}
      >
        Press{" "}
        <kbd
          style={{
            background: B.active,
            borderRadius: "0.3rem",
            padding: "0 0.35rem",
            fontSize: "0.7rem",
            fontFamily: "monospace",
          }}
        >
          Enter
        </kbd>{" "}
        or{" "}
        <kbd
          style={{
            background: B.active,
            borderRadius: "0.3rem",
            padding: "0 0.35rem",
            fontSize: "0.7rem",
            fontFamily: "monospace",
          }}
        >
          ,
        </kbd>{" "}
        to add · Backspace to remove
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   AVAILABILITY TOGGLE
═══════════════════════════════════════════════════ */
function AvailabilityToggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        flexWrap: "wrap",
      }}
    >
      {/* Toggle */}
      <button
        onClick={() => onChange(!value)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
        }}
      >
        <div
          style={{
            width: 46,
            height: 26,
            borderRadius: "999px",
            background: value ? B.dark : "rgba(40,41,44,0.15)",
            position: "relative",
            transition: "background 0.25s",
            boxShadow: value ? "0 2px 8px rgba(40,41,44,0.25)" : "none",
          }}
        >
          <div
            className="pp-toggle-knob"
            style={{
              position: "absolute",
              top: 3,
              left: 3,
              width: 20,
              height: 20,
              borderRadius: "50%",
              background: "#fff",
              boxShadow: "0 1px 4px rgba(40,41,44,0.2)",
              transform: value ? "translateX(20px)" : "translateX(0)",
            }}
          />
        </div>
      </button>

      {/* Label */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            padding: "0.3rem 0.85rem",
            borderRadius: "999px",
            background: value ? "rgba(56,161,105,0.09)" : "rgba(40,41,44,0.07)",
            fontSize: "0.78rem",
            fontWeight: 700,
            fontFamily: FONT,
            color: value ? B.green : B.muted,
            transition: "all 0.25s",
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: value ? B.green : B.muted,
              display: "inline-block",
              ...(value ? { animation: "pulse 2s ease-in-out infinite" } : {}),
            }}
          />
          {value ? "Looking for Team" : "In a Team"}
        </span>
        <span style={{ fontSize: "0.75rem", color: B.muted, fontFamily: FONT }}>
          {value
            ? "Visible to recruiters & teammates"
            : "Not accepting teammate requests"}
        </span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   AVATAR UPLOAD (UI only — file state managed here)
═══════════════════════════════════════════════════ */
function AvatarUpload({
  name,
  avatarUrl,
  onFile,
}: {
  name: string;
  avatarUrl?: string;
  onFile: (f: File) => void;
}) {
  const [preview, setPreview] = useState(avatarUrl);
  const [hovered, setHovered] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    onFile(file);
  };

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        style={{ display: "none" }}
      />
      <div
        onClick={() => fileRef.current?.click()}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: 96,
          height: 96,
          borderRadius: "50%",
          background: preview ? "transparent" : B.dark,
          color: "#fff",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "2rem",
          fontWeight: 800,
          fontFamily: FONT,
          position: "relative",
          overflow: "hidden",
          border: `3px solid ${B.card}`,
          boxShadow: "0 4px 16px rgba(40,41,44,0.18)",
          transition: "transform 0.2s",
          transform: hovered ? "scale(1.04)" : "scale(1)",
        }}
      >
        {preview ? (
          <img
            src={preview}
            alt={name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          initials
        )}
        {/* Overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(40,41,44,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.2s",
          }}
        >
          <Camera size={22} color="#fff" />
        </div>
      </div>

      {/* Camera badge */}
      <div
        onClick={() => fileRef.current?.click()}
        style={{
          position: "absolute",
          bottom: 2,
          right: 2,
          width: 26,
          height: 26,
          borderRadius: "50%",
          background: B.dark,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          boxShadow: "0 2px 6px rgba(40,41,44,0.25)",
          border: `2px solid ${B.card}`,
        }}
      >
        <Edit3 size={12} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   SAVE BUTTON
═══════════════════════════════════════════════════ */
function SaveBtn({
  loading,
  saved,
  onClick,
}: {
  loading: boolean;
  saved: boolean;
  onClick: () => void;
}) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      disabled={loading}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.75rem 2rem",
        borderRadius: "999px",
        border: "none",
        background: saved ? B.green : hov ? "#3a3b3f" : B.dark,
        color: "#fff",
        cursor: loading ? "not-allowed" : "pointer",
        fontSize: "0.9rem",
        fontWeight: 700,
        fontFamily: FONT,
        boxShadow: "0 4px 14px rgba(40,41,44,0.2)",
        transition: "all 0.2s",
        transform: hov && !loading ? "translateY(-1px)" : "none",
      }}
    >
      {loading ? (
        <>
          <Loader2
            size={16}
            style={{ animation: "spin 0.8s linear infinite" }}
          />{" "}
          Saving…
        </>
      ) : saved ? (
        <>
          <Check size={16} /> Saved!
        </>
      ) : (
        <>
          <Save size={16} /> Save Profile
        </>
      )}
    </button>
  );
}

/* ═══════════════════════════════════════════════════
   SKILL / INTEREST SUGGESTIONS
═══════════════════════════════════════════════════ */
const SKILL_SUGGESTIONS = [
  "React",
  "TypeScript",
  "Python",
  "Node.js",
  "Java",
  "C++",
  "Machine Learning",
  "Data Structures",
  "Flutter",
  "Django",
  "FastAPI",
  "MongoDB",
  "PostgreSQL",
  "Docker",
  "Kubernetes",
  "AWS",
  "TensorFlow",
  "OpenCV",
  "Next.js",
  "Express.js",
  "Go",
  "Rust",
  "GraphQL",
  "Redis",
  "Figma",
  "UI/UX",
  "Android",
  "iOS",
  "Swift",
];
const INTEREST_SUGGESTIONS = [
  "Web Development",
  "AI/ML",
  "Cybersecurity",
  "Blockchain",
  "IoT",
  "Robotics",
  "Data Science",
  "Game Development",
  "Open Source",
  "Cloud Computing",
  "Competitive Programming",
  "AR/VR",
  "DevOps",
  "App Development",
  "Research",
  "Design",
  "Entrepreneurship",
  "Hackathons",
  "Photography",
  "Music",
];
const BRANCH_OPTIONS = [
  "CSE",
  "CS",
  "CSIT",
  "CSE-AI",
  "CSE(AI)",
  "CSE-DS",
  "CSE(AIML)",
  "IT",
  "ECE",
  "EEE",
  "ME",
  "CE",
  "MBA",
  "MCA",
  "Other",
];

const _CAL = new Date().getFullYear();

/** Compute academic year (1-4) from passout year. Session starts July. */
function _academicYear(passoutYear: number): number {
  const now = new Date();
  const sessionStart =
    now.getMonth() + 1 >= 7 ? now.getFullYear() : now.getFullYear() - 1;
  return 5 - (passoutYear - sessionStart);
}

const _ORD = ["", "1st", "2nd", "3rd", "4th"] as const;

/** Exactly 4 passout years mapped to academic years */
const PASSOUT_YEAR_OPTIONS = Array.from({ length: 4 }, (_, i) => {
  const yr = _CAL + i;
  const ay = _academicYear(yr);
  return ay >= 1 && ay <= 4 ? `${yr}  —  ${_ORD[ay]} Year` : String(yr);
});

/* ═══════════════════════════════════════════════════
   SELECT FIELD
═══════════════════════════════════════════════════ */
function SelectField({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        background: focused ? B.card : "rgba(40,41,44,0.02)",
        border: `1.5px solid ${focused ? B.dark : B.border}`,
        borderRadius: "0.75rem",
        overflow: "hidden",
        transition: "all 0.2s",
        position: "relative",
      }}
    >
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          flex: 1,
          border: "none",
          outline: "none",
          background: "transparent",
          appearance: "none",
          padding: "0.72rem 2.5rem 0.72rem 1rem",
          fontSize: "0.875rem",
          color: value ? B.dark : B.muted,
          fontFamily: FONT,
          cursor: "pointer",
        }}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <ChevronDown
        size={15}
        style={{
          position: "absolute",
          right: "0.85rem",
          color: B.muted,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   PROFILE PAGE — MAIN EXPORT
═══════════════════════════════════════════════════ */
export default function ProfilePage({ user }: { user: ProfileUser }) {
  /* ── Form state ── */
  const [data, setData] = useState<ProfileData>({
    bio: user.bio ?? "",
    skills: user.skills ?? [],
    interests: user.interests ?? [],
    github: user.github_url ?? "",
    linkedin: user.linkedin_url ?? "",
    website: user.website_url ?? "",
    available: (user.availability_status ?? "available") === "available",
  });

  const [branch, setBranch] = useState(user.branch ?? "CSE");
  // Reconstruct the full label string matching PASSOUT_YEAR_OPTIONS format
  const [passoutYearLabel, setPassoutYearLabel] = useState(() => {
    const yr = user.passout_year ?? _CAL + 2;
    const ay = _academicYear(yr);
    return ay >= 1 && ay <= 4 ? `${yr}  \u2014  ${_ORD[ay]} Year` : String(yr);
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [_avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loadError, setLoadError] = useState("");

  /* ── Load full profile from API on mount ── */
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY) || "";
    if (!token) return;
    fetch(`${API}/api/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((res) => {
        const u = res.data;
        if (!u) return;
        setData({
          bio: u.bio ?? "",
          skills: u.skills ?? [],
          interests: u.interests ?? [],
          github: u.github_url ?? "",
          linkedin: u.linkedin_url ?? "",
          website: u.website_url ?? "",
          available: (u.availability_status ?? "available") === "available",
        });
        if (u.branch) setBranch(u.branch);
        if (u.passout_year) {
          const yr = u.passout_year;
          const ay = _academicYear(yr);
          setPassoutYearLabel(
            ay >= 1 && ay <= 4 ? `${yr}  \u2014  ${_ORD[ay]} Year` : String(yr),
          );
        }
      })
      .catch(() =>
        setLoadError("Could not load profile — showing cached data."),
      );
  }, []);

  const set =
    <K extends keyof ProfileData>(k: K) =>
    (v: ProfileData[K]) => {
      setData((p) => ({ ...p, [k]: v }));
      setSaved(false);
    };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const token = localStorage.getItem(TOKEN_KEY) || "";
      const passoutYear = parseInt(passoutYearLabel.split(/\s+/)[0], 10);

      if (_avatarFile) {
        // Multipart form data when avatar is being changed
        const form = new FormData();
        form.append("bio", data.bio);
        form.append("branch", branch);
        form.append("passout_year", String(passoutYear));
        form.append(
          "availability_status",
          data.available ? "available" : "away",
        );
        form.append("github_url", data.github);
        form.append("linkedin_url", data.linkedin);
        form.append("website_url", data.website);
        data.skills.forEach((s) => form.append("skills[]", s));
        data.interests.forEach((i) => form.append("interests[]", i));
        form.append("avatar", _avatarFile);

        const res = await fetch(`${API}/api/users/me`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: form,
        });
        if (!res.ok) throw new Error("Save failed");
        setAvatarFile(null);
      } else {
        // Plain JSON when no avatar change
        const res = await fetch(`${API}/api/users/me`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            bio: data.bio,
            branch,
            passout_year: passoutYear,
            availability_status: data.available ? "available" : "away",
            github_url: data.github,
            linkedin_url: data.linkedin,
            website_url: data.website,
            skills: data.skills,
            interests: data.interests,
          }),
        });
        if (!res.ok) throw new Error("Save failed");
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("[ProfilePage] save error:", err);
      // Show error state briefly
      setTimeout(() => setSaving(false), 300);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <StyleInject />
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:.55; } }
      `}</style>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
          maxWidth: 780,
        }}
      >
        {/* ── Page Title ── */}
        <div className="pp-fadein" style={{ marginBottom: "0.25rem" }}>
          <h1
            style={{
              fontSize: "1.3rem",
              fontWeight: 900,
              color: B.dark,
              letterSpacing: "-0.04em",
              fontFamily: FONT,
            }}
          >
            Your Profile
          </h1>
          <p
            style={{
              fontSize: "0.82rem",
              color: B.muted,
              fontFamily: FONT,
              marginTop: "0.25rem",
            }}
          >
            This is how other students see you on KIET Collab.
          </p>
        </div>

        {/* ── Load error notice ── */}
        {loadError && (
          <div
            style={{
              background: "rgba(229,62,106,0.06)",
              border: "1px solid rgba(229,62,106,0.2)",
              borderRadius: "0.75rem",
              padding: "0.75rem 1rem",
              fontSize: "0.8rem",
              color: "#C0385A",
              fontFamily: FONT,
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            ⚠️ {loadError}
          </div>
        )}

        {/* ══════════════════════════════════
            1. PROFILE HEADER CARD
        ══════════════════════════════════ */}
        <Section
          title="Profile Overview"
          subtitle="Your public-facing identity"
          delay={0}
        >
          <div
            style={{
              display: "flex",
              gap: "2rem",
              alignItems: "flex-start",
              flexWrap: "wrap",
            }}
          >
            {/* Avatar */}
            <AvatarUpload
              name={user.name}
              avatarUrl={user.avatar}
              onFile={(f) => {
                setAvatarFile(f);
                setSaved(false);
              }}
            />

            {/* Info */}
            <div
              style={{
                flex: 1,
                minWidth: 220,
                display: "flex",
                flexDirection: "column",
                gap: "1.1rem",
              }}
            >
              {/* Name (read-only display + editable below) */}
              <div>
                <p
                  style={{
                    fontSize: "1.35rem",
                    fontWeight: 900,
                    color: B.dark,
                    letterSpacing: "-0.04em",
                    fontFamily: FONT,
                    marginBottom: "0.15rem",
                  }}
                >
                  {user.name}
                </p>
                <p
                  style={{
                    fontSize: "0.82rem",
                    color: B.muted,
                    fontFamily: FONT,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem",
                  }}
                >
                  <MapPin size={12} /> {user.email}
                </p>
              </div>

              {/* Branch + Passout Year */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0.75rem",
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      color: B.muted,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      fontFamily: FONT,
                      marginBottom: "0.35rem",
                    }}
                  >
                    Branch
                  </p>
                  <SelectField
                    value={branch}
                    onChange={(v) => {
                      setBranch(v);
                      setSaved(false);
                    }}
                    options={BRANCH_OPTIONS}
                  />
                </div>
                <div>
                  <p
                    style={{
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      color: B.muted,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      fontFamily: FONT,
                      marginBottom: "0.35rem",
                    }}
                  >
                    Passout Year
                  </p>
                  <SelectField
                    value={passoutYearLabel}
                    onChange={(v) => {
                      setPassoutYearLabel(v);
                      setSaved(false);
                    }}
                    options={PASSOUT_YEAR_OPTIONS}
                  />
                </div>
              </div>

              {/* Availability Toggle */}
              <div>
                <p
                  style={{
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    color: B.muted,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    fontFamily: FONT,
                    marginBottom: "0.6rem",
                  }}
                >
                  Status
                </p>
                <AvailabilityToggle
                  value={data.available}
                  onChange={set("available")}
                />
              </div>
            </div>
          </div>
        </Section>

        {/* ══════════════════════════════════
            2. BIO
        ══════════════════════════════════ */}
        <Section
          title="About Me"
          subtitle="Write a short bio that showcases who you are"
          delay={60}
        >
          <FormField label="Bio" icon={<BookOpen size={12} />}>
            <StyledTextarea
              value={data.bio}
              onChange={set("bio")}
              placeholder="e.g. 3rd year CSE student passionate about building impactful products. Love hackathons, open-source, and AI. Looking for teammates for SIH 2025!"
            />
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <span
                style={{
                  fontSize: "0.7rem",
                  color: data.bio.length > 300 ? B.err : B.muted,
                  fontFamily: FONT,
                }}
              >
                {data.bio.length}/320
              </span>
            </div>
          </FormField>
        </Section>

        {/* ══════════════════════════════════
            3. SKILLS + INTERESTS
        ══════════════════════════════════ */}
        <Section
          title="Skills & Interests"
          subtitle="Help teammates discover you based on your expertise"
          delay={120}
        >
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}
          >
            <FormField label="Technical Skills" icon={<Briefcase size={12} />}>
              <TagInput
                tags={data.skills}
                onChange={set("skills")}
                placeholder="e.g. React, Python, Machine Learning…"
                suggestions={SKILL_SUGGESTIONS}
              />
            </FormField>

            <div style={{ height: "1px", background: B.border }} />

            <FormField label="Interests & Domains" icon={<Globe size={12} />}>
              <TagInput
                tags={data.interests}
                onChange={set("interests")}
                placeholder="e.g. Hackathons, AI/ML, Open Source…"
                suggestions={INTEREST_SUGGESTIONS}
              />
            </FormField>
          </div>
        </Section>

        {/* ══════════════════════════════════
            4. SOCIAL LINKS
        ══════════════════════════════════ */}
        <Section
          title="Social Links"
          subtitle="Connect your profiles so teammates can find you"
          delay={180}
        >
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
          >
            <FormField label="GitHub" icon={<Github size={12} />}>
              <StyledInput
                value={data.github}
                onChange={set("github")}
                placeholder="yourusername"
                prefix="github.com/"
              />
            </FormField>

            <FormField label="LinkedIn" icon={<Linkedin size={12} />}>
              <StyledInput
                value={data.linkedin}
                onChange={set("linkedin")}
                placeholder="yourprofile"
                prefix="linkedin.com/in/"
              />
            </FormField>

            <FormField label="Portfolio / Website" icon={<Globe size={12} />}>
              <StyledInput
                value={data.website}
                onChange={set("website")}
                placeholder="https://yoursite.com"
                type="url"
              />
            </FormField>
          </div>
        </Section>

        {/* ══════════════════════════════════
            SAVE BAR (sticky bottom)
        ══════════════════════════════════ */}
        <div
          className="pp-fadein"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1rem",
            background: B.card,
            border: `1px solid ${B.border}`,
            borderRadius: "1.25rem",
            boxShadow: "0 4px 20px rgba(40,41,44,0.08)",
            padding: "1.25rem 1.75rem",
            position: "sticky",
            bottom: "1rem",
            animationDelay: "220ms",
          }}
        >
          <div>
            <p
              style={{
                fontSize: "0.85rem",
                fontWeight: 700,
                color: B.dark,
                fontFamily: FONT,
              }}
            >
              {saved ? "✓ Profile updated!" : "Ready to publish?"}
            </p>
            <p
              style={{
                fontSize: "0.75rem",
                color: B.muted,
                fontFamily: FONT,
                marginTop: "1px",
              }}
            >
              {saved
                ? "Your changes are live on your profile."
                : "Your changes will be visible to other students."}
            </p>
          </div>
          <div
            style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}
          >
            <button
              onClick={() => setSaved(false)}
              style={{
                background: "none",
                border: "none",
                color: B.muted,
                cursor: "pointer",
                fontSize: "0.82rem",
                fontWeight: 600,
                fontFamily: FONT,
                padding: "0.5rem 0",
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = B.dark)}
              onMouseLeave={(e) => (e.currentTarget.style.color = B.muted)}
            >
              Discard
            </button>
            <SaveBtn loading={saving} saved={saved} onClick={handleSave} />
          </div>
        </div>

        {/* Bottom breathing room */}
        <div style={{ height: "2rem" }} />
      </div>
    </>
  );
}
