import React, { useState, useEffect } from "react";
import {
  Rocket,
  Eye,
  EyeOff,
  ArrowLeft,
  User,
  Mail,
  Lock,
  ChevronDown,
} from "lucide-react";

/* ═══════════════════════════════════════════════════
   BRAND TOKENS
═══════════════════════════════════════════════════ */
const B = {
  bg: "#F3F3F3",
  dark: "#28292C",
  muted: "#96979A",
  card: "#FFFFFF",
  border: "rgba(40,41,44,0.09)",
  shadow: "0 10px 30px rgba(0,0,0,0.06)",
  shadowH: "0 20px 50px rgba(0,0,0,0.10)",
  err: "#E53E3E",
  errBg: "rgba(229,62,62,0.05)",
  errBr: "rgba(229,62,62,0.2)",
  success: "#38A169",
} as const;

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

/* ─── Helpers ─── */
// Strict KIET institutional email: firstname.YYYYbranchNNNN@kiet.edu
const KIET_EMAIL_RE = /^[a-zA-Z]+\.([0-9]{4})([a-zA-Z]+)([0-9]{4})@kiet\.edu$/i;
const isKietEmail = (e: string) => KIET_EMAIL_RE.test(e.trim().toLowerCase());
const isStrongPwd = (p: string) => p.length >= 8;

/**
 * Live-parse the email so the form can show derived info to the user.
 * Returns null if the format is not yet complete / valid.
 */
function tryParseKietEmail(
  email: string,
): { branch: string; batch: string } | null {
  const m = email.trim().toLowerCase().match(KIET_EMAIL_RE);
  if (!m) return null;
  const [, prefix, branch] = m;
  const startYY = parseInt(prefix.slice(0, 2), 10);
  const endYY = parseInt(prefix.slice(2, 4), 10);
  if (!startYY || !endYY) return null;
  return {
    branch: branch.toUpperCase(),
    batch: `${2000 + startYY} – ${2000 + endYY}`,
  };
}

/* ═══════════════════════════════════════════════════
   SHARED FORM ELEMENTS (inline-styled, brand-strict)
═══════════════════════════════════════════════════ */

interface FieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
  required?: boolean;
}
function Field({ label, error, children, required }: FieldProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
      <label
        style={{
          fontSize: "0.78rem",
          fontWeight: 650,
          color: error ? B.err : B.dark,
          letterSpacing: "0.01em",
          display: "flex",
          alignItems: "center",
          gap: "0.25rem",
        }}
      >
        {label}
        {required && <span style={{ color: B.muted, fontWeight: 400 }}>*</span>}
      </label>
      {children}
      {error && (
        <span
          style={{
            fontSize: "0.75rem",
            color: B.err,
            borderBottom: `1.5px solid ${B.err}`,
            paddingBottom: "2px",
            display: "inline-block",
            width: "fit-content",
          }}
        >
          {error}
        </span>
      )}
    </div>
  );
}

interface TextInputProps {
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: boolean;
  icon?: React.ReactNode;
  rightEl?: React.ReactNode;
  autoComplete?: string;
}
function TextInput({
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  icon,
  rightEl,
  autoComplete,
}: TextInputProps) {
  const [focused, setFocused] = useState(false);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.6rem",
        background: error ? B.errBg : focused ? "#fff" : "rgba(40,41,44,0.02)",
        border: `1.5px solid ${error ? B.err : focused ? B.dark : B.border}`,
        borderRadius: "0.75rem",
        padding: "0 0.9rem",
        transition: "all 0.2s",
        boxShadow: focused ? "0 0 0 3px rgba(40,41,44,0.05)" : "none",
      }}
    >
      {icon && (
        <span
          style={{
            color: error ? B.err : focused ? B.dark : B.muted,
            flexShrink: 0,
            display: "flex",
          }}
        >
          {icon}
        </span>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          flex: 1,
          border: "none",
          outline: "none",
          background: "transparent",
          padding: "0.72rem 0",
          fontSize: "0.9rem",
          color: B.dark,
          fontFamily: "Inter, sans-serif",
        }}
      />
      {rightEl}
    </div>
  );
}

interface SelectInputProps {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  error?: boolean;
  icon?: React.ReactNode;
}
function SelectInput({
  value,
  onChange,
  options,
  placeholder,
  error,
  icon,
}: SelectInputProps) {
  const [focused, setFocused] = useState(false);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.6rem",
        background: error ? B.errBg : focused ? "#fff" : "rgba(40,41,44,0.02)",
        border: `1.5px solid ${error ? B.err : focused ? B.dark : B.border}`,
        borderRadius: "0.75rem",
        padding: "0 0.9rem",
        transition: "all 0.2s",
        position: "relative",
      }}
    >
      {icon && (
        <span
          style={{
            color: error ? B.err : focused ? B.dark : B.muted,
            flexShrink: 0,
            display: "flex",
          }}
        >
          {icon}
        </span>
      )}
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
          padding: "0.72rem 0",
          fontSize: "0.9rem",
          color: value ? B.dark : B.muted,
          fontFamily: "Inter, sans-serif",
          appearance: "none",
          cursor: "pointer",
        }}
      >
        {placeholder && (
          <option value="" disabled hidden>
            {placeholder}
          </option>
        )}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={16}
        style={{ color: B.muted, flexShrink: 0, pointerEvents: "none" }}
      />
    </div>
  );
}

/* ─── Page shell: logo + card + fade-in ─── */
interface PageShellProps {
  children: React.ReactNode;
}
function PageShell({ children }: PageShellProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 40);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: B.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Inter, sans-serif",
        padding: "2rem 1rem",
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0)" : "translateY(16px)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
      }}
    >
      {/* Logo */}
      <a
        href="/"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          textDecoration: "none",
          marginBottom: "2rem",
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: B.dark,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 12px rgba(40,41,44,0.22)",
          }}
        >
          <Rocket size={18} />
        </div>
        <span
          style={{
            fontSize: "1rem",
            fontWeight: 700,
            color: B.dark,
            letterSpacing: "-0.02em",
          }}
        >
          KIET Collab
        </span>
      </a>

      {/* Card */}
      <div
        style={{
          width: "100%",
          maxWidth: 460,
          background: B.card,
          border: `1px solid ${B.border}`,
          borderRadius: "1.5rem",
          boxShadow: B.shadow,
          padding: "2.5rem",
        }}
      >
        {children}
      </div>

      {/* Bottom note */}
      <p
        style={{
          marginTop: "1.5rem",
          fontSize: "0.75rem",
          color: B.muted,
          textAlign: "center",
        }}
      >
        Exclusively for KIET students &amp; faculty · @kiet.edu required
      </p>
    </div>
  );
}

/* ─── Primary Button ─── */
interface PrimaryBtnProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  loading?: boolean;
  disabled?: boolean;
}
function PrimaryBtn({
  children,
  onClick,
  type = "button",
  loading,
  disabled,
}: PrimaryBtnProps) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading || disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: "100%",
        padding: "0.85rem",
        background: disabled ? B.muted : hovered ? "#3a3b3f" : B.dark,
        color: "#fff",
        border: "none",
        borderRadius: "9999px",
        cursor: disabled ? "not-allowed" : "pointer",
        fontSize: "0.95rem",
        fontWeight: 700,
        fontFamily: "Inter, sans-serif",
        boxShadow: disabled ? "none" : "0 4px 14px rgba(40,41,44,0.2)",
        transition: "background 0.2s, transform 0.15s, box-shadow 0.2s",
        transform: hovered && !disabled ? "translateY(-1px)" : "none",
        letterSpacing: "-0.01em",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5rem",
      }}
    >
      {loading ? (
        <>
          <span
            style={{
              width: 16,
              height: 16,
              border: "2px solid rgba(255,255,255,0.35)",
              borderTop: "2px solid #fff",
              borderRadius: "50%",
              animation: "authSpin 0.8s linear infinite",
              display: "inline-block",
            }}
          />
          Please wait…
        </>
      ) : (
        children
      )}
    </button>
  );
}

/* ═══════════════════════════════════════════════════
   GLOBAL KEYFRAME (injected once)
═══════════════════════════════════════════════════ */
const AUTH_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  @keyframes authSpin { to { transform: rotate(360deg); } }
`;
function AuthStyleInject() {
  useEffect(() => {
    if (document.getElementById("auth-style")) return;
    const el = document.createElement("style");
    el.id = "auth-style";
    el.textContent = AUTH_STYLE;
    document.head.appendChild(el);
    return () => el.remove();
  }, []);
  return null;
}

/* ═══════════════════════════════════════════════════
   LOGIN PAGE
═══════════════════════════════════════════════════ */
interface LoginPageProps {
  onSuccess: (user: UserObj) => void;
  onGoSignup: () => void;
  onGoLanding: () => void;
}

export interface UserObj {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "student" | "faculty" | "judge" | "admin";
  branch?: string;
  passout_year?: number;
  academicYear?: number;
}

export function LoginPage({
  onSuccess,
  onGoSignup,
  onGoLanding,
}: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiErr, setApiErr] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!email) e.email = "Email is required";
    else if (!isKietEmail(email)) e.email = "Must be a valid @kiet.edu email";
    if (!password) e.password = "Password is required";
    return e;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    setLoading(true);
    setApiErr("");
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      localStorage.setItem("kiet_token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      onSuccess(data.user);
    } catch (err) {
      setApiErr(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AuthStyleInject />
      <PageShell>
        {/* Back link */}
        <button
          onClick={onGoLanding}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.35rem",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: B.muted,
            fontSize: "0.82rem",
            fontFamily: "Inter,sans-serif",
            marginBottom: "1.5rem",
            padding: 0,
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = B.dark)}
          onMouseLeave={(e) => (e.currentTarget.style.color = B.muted)}
        >
          <ArrowLeft size={14} /> Back to home
        </button>

        {/* Heading */}
        <h1
          style={{
            fontSize: "1.7rem",
            fontWeight: 800,
            color: B.dark,
            letterSpacing: "-0.04em",
            margin: "0 0 0.35rem",
          }}
        >
          Welcome back
        </h1>
        <p style={{ fontSize: "0.875rem", color: B.muted, margin: "0 0 2rem" }}>
          Sign in to your KIET Collab account
        </p>

        <form
          onSubmit={handleSubmit}
          noValidate
          style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}
        >
          <Field label="KIET Email" error={errors.email} required>
            <TextInput
              type="email"
              value={email}
              onChange={(v) => {
                setEmail(v);
                setErrors((p) => ({ ...p, email: "" }));
              }}
              placeholder="yourname@kiet.edu"
              error={!!errors.email}
              icon={<Mail size={16} />}
              autoComplete="email"
            />
          </Field>

          <Field label="Password" error={errors.password} required>
            <TextInput
              type={showPwd ? "text" : "password"}
              value={password}
              onChange={(v) => {
                setPassword(v);
                setErrors((p) => ({ ...p, password: "" }));
              }}
              placeholder="Enter your password"
              error={!!errors.password}
              icon={<Lock size={16} />}
              autoComplete="current-password"
              rightEl={
                <button
                  type="button"
                  onClick={() => setShowPwd((p) => !p)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: B.muted,
                    display: "flex",
                    padding: "0 0.25rem",
                    flexShrink: 0,
                  }}
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />
          </Field>

          {apiErr && (
            <div
              style={{
                padding: "0.8rem 1rem",
                background: B.errBg,
                border: `1px solid ${B.errBr}`,
                borderRadius: "0.75rem",
              }}
            >
              <p style={{ margin: 0, fontSize: "0.83rem", color: B.err }}>
                {apiErr}
              </p>
            </div>
          )}

          <div style={{ height: "0.25rem" }} />
          <PrimaryBtn type="submit" loading={loading}>
            Sign In
          </PrimaryBtn>
        </form>

        <div
          style={{
            marginTop: "1.75rem",
            paddingTop: "1.5rem",
            borderTop: `1px solid ${B.border}`,
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: "0.85rem", color: B.muted, margin: 0 }}>
            Don't have an account?{" "}
            <button
              onClick={onGoSignup}
              style={{
                background: "none",
                border: "none",
                color: B.dark,
                fontWeight: 700,
                cursor: "pointer",
                fontSize: "0.85rem",
                fontFamily: "Inter,sans-serif",
                textDecoration: "underline",
                textDecorationColor: "rgba(40,41,44,0.25)",
                textUnderlineOffset: "2px",
              }}
            >
              Create account
            </button>
          </p>
        </div>
      </PageShell>
    </>
  );
}

/* ═══════════════════════════════════════════════════
   SIGNUP PAGE
═══════════════════════════════════════════════════ */
interface SignupPageProps {
  onSuccess: (user: UserObj) => void;
  onGoLogin: () => void;
  onGoLanding: () => void;
}

interface SignupForm {
  name: string;
  email: string;
  password: string;
  confirm: string;
}

export function SignupPage({
  onSuccess,
  onGoLogin,
  onGoLanding,
}: SignupPageProps) {
  const [form, setForm] = useState<SignupForm>({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [showPwd, setShowPwd] = useState(false);
  const [showCfm, setShowCfm] = useState(false);
  const [errors, setErrors] = useState<
    Partial<SignupForm & { confirm: string }>
  >({});
  const [apiErr, setApiErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [pwdStrength, setPwdStrength] = useState(0); // 0-3

  const parsedEmail = tryParseKietEmail(form.email);

  const set = (k: keyof SignupForm) => (v: string) => {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: "" }));
    if (k === "password") {
      let s = 0;
      if (v.length >= 8) s++;
      if (/[A-Z]/.test(v)) s++;
      if (/[0-9!@#$%^&*]/.test(v)) s++;
      setPwdStrength(s);
    }
  };

  const validate = () => {
    const e: Partial<SignupForm & { confirm: string }> = {};
    if (!form.name.trim()) e.name = "Full name is required";
    if (!form.email) e.email = "Email is required";
    else if (!isKietEmail(form.email))
      e.email = "Format: yourname.2327csit1113@kiet.edu";
    if (!form.password) e.password = "Password is required";
    else if (!isStrongPwd(form.password)) e.password = "Minimum 8 characters";
    if (!form.confirm) e.confirm = "Please confirm your password";
    else if (form.confirm !== form.password)
      e.confirm = "Passwords do not match";
    return e;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    setLoading(true);
    setApiErr("");
    try {
      const res = await fetch(`${API}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      localStorage.setItem("kiet_token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      onSuccess(data.user);
    } catch (err) {
      setApiErr(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const strengthColors = ["#E53E3E", "#E6A817", "#38A169"];
  const strengthLabels = ["Weak", "Fair", "Strong"];

  return (
    <>
      <AuthStyleInject />
      <PageShell>
        {/* Back */}
        <button
          onClick={onGoLanding}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.35rem",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: B.muted,
            fontSize: "0.82rem",
            fontFamily: "Inter,sans-serif",
            marginBottom: "1.5rem",
            padding: 0,
            transition: "color 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = B.dark)}
          onMouseLeave={(e) => (e.currentTarget.style.color = B.muted)}
        >
          <ArrowLeft size={14} /> Back to home
        </button>

        {/* Heading */}
        <h1
          style={{
            fontSize: "1.7rem",
            fontWeight: 800,
            color: B.dark,
            letterSpacing: "-0.04em",
            margin: "0 0 0.35rem",
          }}
        >
          Create your account
        </h1>
        <p style={{ fontSize: "0.875rem", color: B.muted, margin: "0 0 2rem" }}>
          Join 4,000+ KIET students on the collab platform
        </p>

        <form
          onSubmit={handleSubmit}
          noValidate
          style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          {/* Name */}
          <Field label="Full Name" error={errors.name} required>
            <TextInput
              value={form.name}
              onChange={set("name")}
              placeholder="e.g. Priya Sharma"
              error={!!errors.name}
              icon={<User size={16} />}
              autoComplete="name"
            />
          </Field>

          {/* KIET Email */}
          <Field label="KIET Email" error={errors.email} required>
            <TextInput
              type="email"
              value={form.email}
              onChange={set("email")}
              placeholder="yourname.2327csit1113@kiet.edu"
              error={!!errors.email}
              icon={<Mail size={16} />}
              autoComplete="email"
              rightEl={
                form.email && isKietEmail(form.email) ? (
                  <span
                    style={{
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      color: B.success,
                      background: "rgba(56,161,105,0.09)",
                      padding: "0.15rem 0.5rem",
                      borderRadius: "999px",
                      flexShrink: 0,
                    }}
                  >
                    ✓ valid
                  </span>
                ) : undefined
              }
            />
          </Field>

          {/* Auto-detected info from email */}
          {parsedEmail && (
            <div
              style={{
                padding: "0.65rem 1rem",
                background: "rgba(56,161,105,0.06)",
                border: "1px solid rgba(56,161,105,0.2)",
                borderRadius: "0.75rem",
                display: "flex",
                gap: "1.5rem",
                fontSize: "0.78rem",
                color: B.dark,
              }}
            >
              <span>
                <span style={{ color: B.muted }}>Branch </span>
                <strong>{parsedEmail.branch}</strong>
              </span>
              <span>
                <span style={{ color: B.muted }}>Batch </span>
                <strong>{parsedEmail.batch}</strong>
              </span>
            </div>
          )}

          {/* Password */}
          <Field label="Password" error={errors.password} required>
            <TextInput
              type={showPwd ? "text" : "password"}
              value={form.password}
              onChange={set("password")}
              placeholder="Minimum 8 characters"
              error={!!errors.password}
              icon={<Lock size={16} />}
              autoComplete="new-password"
              rightEl={
                <button
                  type="button"
                  onClick={() => setShowPwd((p) => !p)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: B.muted,
                    display: "flex",
                    padding: "0 0.25rem",
                    flexShrink: 0,
                  }}
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />
            {/* Strength bar */}
            {form.password.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.3rem",
                }}
              >
                <div style={{ display: "flex", gap: "4px", height: 3 }}>
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      style={{
                        flex: 1,
                        borderRadius: "99px",
                        background:
                          i < pwdStrength
                            ? strengthColors[pwdStrength - 1]
                            : "rgba(40,41,44,0.1)",
                        transition: "background 0.3s",
                      }}
                    />
                  ))}
                </div>
                <span
                  style={{
                    fontSize: "0.72rem",
                    color:
                      pwdStrength > 0
                        ? strengthColors[pwdStrength - 1]
                        : B.muted,
                  }}
                >
                  {pwdStrength > 0 ? strengthLabels[pwdStrength - 1] : ""}
                </span>
              </div>
            )}
          </Field>

          {/* Confirm Password */}
          <Field label="Confirm Password" error={errors.confirm} required>
            <TextInput
              type={showCfm ? "text" : "password"}
              value={form.confirm}
              onChange={set("confirm")}
              placeholder="Re-enter your password"
              error={!!errors.confirm}
              icon={<Lock size={16} />}
              autoComplete="new-password"
              rightEl={
                <button
                  type="button"
                  onClick={() => setShowCfm((p) => !p)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: B.muted,
                    display: "flex",
                    padding: "0 0.25rem",
                    flexShrink: 0,
                  }}
                >
                  {showCfm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />
          </Field>

          {/* API error */}
          {apiErr && (
            <div
              style={{
                padding: "0.8rem 1rem",
                background: B.errBg,
                border: `1px solid ${B.errBr}`,
                borderRadius: "0.75rem",
              }}
            >
              <p style={{ margin: 0, fontSize: "0.83rem", color: B.err }}>
                {apiErr}
              </p>
            </div>
          )}

          <div style={{ height: "0.25rem" }} />
          <PrimaryBtn type="submit" loading={loading}>
            Create Account
          </PrimaryBtn>

          {/* Terms note */}
          <p
            style={{
              textAlign: "center",
              fontSize: "0.72rem",
              color: B.muted,
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            By creating an account you agree to our{" "}
            <span
              style={{
                color: B.dark,
                fontWeight: 600,
                cursor: "pointer",
                textDecoration: "underline",
                textDecorationColor: "rgba(40,41,44,0.22)",
              }}
            >
              Terms of Service
            </span>
          </p>
        </form>

        <div
          style={{
            marginTop: "1.75rem",
            paddingTop: "1.5rem",
            borderTop: `1px solid ${B.border}`,
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: "0.85rem", color: B.muted, margin: 0 }}>
            Already have an account?{" "}
            <button
              onClick={onGoLogin}
              style={{
                background: "none",
                border: "none",
                color: B.dark,
                fontWeight: 700,
                cursor: "pointer",
                fontSize: "0.85rem",
                fontFamily: "Inter,sans-serif",
                textDecoration: "underline",
                textDecorationColor: "rgba(40,41,44,0.25)",
                textUnderlineOffset: "2px",
              }}
            >
              Sign in
            </button>
          </p>
        </div>
      </PageShell>
    </>
  );
}
