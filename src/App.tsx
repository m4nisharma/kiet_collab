import { useState, useEffect, Component, ReactNode } from "react";
import LandingPage from "./pages/LandingPage";
import { LoginPage, SignupPage, UserObj } from "./pages/AuthPages";
import StudentDashboard from "./pages/StudentDashboard";
import "./landing.css";

const TOKEN_KEY = "kiet_token";

type Page = "landing" | "login" | "signup";
type User = UserObj;

/* ═══════════════════════════════════════════════════
   ERROR BOUNDARY — prevents white screen on page crash
═══════════════════════════════════════════════════ */
class ErrorBoundary extends Component<
  { children: ReactNode },
  { error: Error | null }
> {
  state = { error: null };
  static getDerivedStateFromError(error: Error) {
    return { error };
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
          <div style={{ fontSize: "2rem" }}>⚠️</div>
          <p style={{ fontWeight: 700 }}>
            Something went wrong loading this page.
          </p>
          <p
            style={{
              color: "#96979A",
              fontSize: "0.85rem",
              maxWidth: 360,
              textAlign: "center",
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
            }}
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

/* ═══════════════════════════════════════════════════
   ROOT APP — clean, minimal routing via state
═══════════════════════════════════════════════════ */
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState<Page>("landing");

  /* Restore session */
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    const userData = localStorage.getItem("user");
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  const handleAuthSuccess = (u: User) => {
    setUser(u);
    setPage("landing");
  };

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("user");
    setUser(null);
    setPage("landing");
  };

  /* Loading screen */
  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#F3F3F3",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 38,
              height: 38,
              margin: "0 auto 1rem",
              border: "2.5px solid rgba(40,41,44,0.12)",
              borderTop: "2.5px solid #28292C",
              borderRadius: "50%",
              animation: "spin 0.9s linear infinite",
            }}
          />
          <p style={{ color: "#96979A", fontSize: "0.85rem" }}>
            Loading KIET Collab…
          </p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  /* ── Authenticated ── */
  if (user) {
    return (
      <ErrorBoundary>
        <StudentDashboard
          user={{
            ...user,
            branch: (user as UserObj & { branch?: string }).branch,
            year: (user as UserObj & { year?: number }).year,
          }}
          onLogout={handleLogout}
        />
      </ErrorBoundary>
    );
  }

  /* ── Auth pages ── */
  if (page === "login") {
    return (
      <LoginPage
        onSuccess={handleAuthSuccess}
        onGoSignup={() => setPage("signup")}
        onGoLanding={() => setPage("landing")}
      />
    );
  }

  if (page === "signup") {
    return (
      <SignupPage
        onSuccess={handleAuthSuccess}
        onGoLogin={() => setPage("login")}
        onGoLanding={() => setPage("landing")}
      />
    );
  }

  /* ── Landing (default) ── */
  return (
    <LandingPage
      setShowAuth={(show) => {
        if (show) setPage("login");
      }}
    />
  );
}
