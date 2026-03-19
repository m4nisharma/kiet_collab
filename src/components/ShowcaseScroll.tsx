import { useRef, useEffect, useState, useCallback } from 'react';
import { Cpu, Trophy, Rocket, Globe, Zap, Code2 } from 'lucide-react';

/* ─────────────── Card data — brand palette only ─────────────── */
const CARDS = [
  {
    tag: 'AI Tool',
    title: 'NeuroMatch',
    desc: 'AI-powered teammate discovery that understands your skill graph and recommends the most compatible collaborators — instantly.',
    icon: <Cpu size={20} />,
  },
  {
    tag: 'Hackathon',
    title: 'Smart India 2025',
    desc: 'Campus finalist project that automated government tenders using NLP — built in 36 hours with a four-person KIET team.',
    icon: <Trophy size={20} />,
  },
  {
    tag: 'Project',
    title: 'GreenRoute',
    desc: 'Real-time carbon footprint tracker for urban commuters, integrating live traffic, transit APIs, and ML-based predictions.',
    icon: <Globe size={20} />,
  },
  {
    tag: 'Innovation',
    title: 'LaunchPad Studio',
    desc: 'An end-to-end idea validation tool — pitch deck generator, competitor analysis, and investor simulation, all in-browser.',
    icon: <Rocket size={20} />,
  },
  {
    tag: 'AI Tool',
    title: 'CodePulse',
    desc: 'Intelligent code review assistant trained on KIET repositories — flags bugs, suggests patterns, and measures complexity.',
    icon: <Code2 size={20} />,
  },
  {
    tag: 'Hackathon',
    title: 'IEEE WIE Summit',
    desc: 'A diversity-first hackathon platform celebrating women in engineering — live leaderboards and real-time mentorship queues.',
    icon: <Zap size={20} />,
  },
];

/* ════════════════════════════════════════════════════════════════
   ShowcaseScroll
   • Desktop: vertical scroll → horizontal pan via sticky + transform
   • Mobile : native horizontal swipe with CSS scroll-snap
════════════════════════════════════════════════════════════════ */
export default function ShowcaseScroll() {
  const outerRef    = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null); // the clipping box
  const trackRef    = useRef<HTMLDivElement>(null); // the moving strip
  const rafRef      = useRef<number>(0);

  const [progress, setProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  /* ── Responsive check ── */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  /* ── Scroll handler (desktop only) ── */
  const handleScroll = useCallback(() => {
    const outer    = outerRef.current;
    const viewport = viewportRef.current;
    const track    = trackRef.current;
    if (!outer || !viewport || !track) return;

    // Distance from top of page to top of outer element
    const outerTop    = outer.offsetTop;
    const outerHeight = outer.offsetHeight;
    const viewH       = window.innerHeight;

    /*
      The sticky pane occupies exactly `viewH` px.
      Scrollable range = outerHeight − viewH
      (the extra height we gave the outer div beyond 100vh)
    */
    const totalScroll = outerHeight - viewH;
    const scrolled    = window.scrollY - outerTop;
    const raw         = Math.min(Math.max(scrolled / totalScroll, 0), 1);

    /*
      maxTranslate = total card strip width minus the visible window width.
      We use viewport.offsetWidth (the clipping container) vs track.scrollWidth.
    */
    const maxTranslate = track.scrollWidth - viewport.offsetWidth;
    const tx           = -raw * Math.max(maxTranslate, 0);

    track.style.transform = `translateX(${tx}px)`;
    setProgress(raw);
  }, []);

  useEffect(() => {
    if (isMobile) return;

    const onScroll = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(handleScroll);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    // Run once immediately so initial state is correct
    handleScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, [isMobile, handleScroll]);

  return (
    <div
      id="showcase"
      ref={outerRef}
      className="sc-outer"
      /*
        200vh = 100vh sticky pane + 100vh scroll travel for the horizontal pan.
        marginBottom: -100vh pulls the next section flush against the end of
        the sticky pane, eliminating the blank gap entirely.
      */
      style={{
        height:       isMobile ? 'auto' : '200vh',
        marginBottom: isMobile ? 0       : '-100vh',
      }}
    >
      {/* ── Sticky pane ── */}
      <div className={`sc-sticky${isMobile ? ' sc-sticky--mobile' : ''}`}>

        {/* Section header */}
        <div className="sc-header">
          <div className="lp-section-label">Innovation Showcase</div>
          <h2 className="lp-section-heading sc-heading">
            Ideas Born at<br />
            <span className="lp-accent-text">KIET Campus</span>
          </h2>
          <p className="sc-sub">
            Student projects, AI tools, and hackathon wins — the real output
            of every late-night, high-caffeine collaboration session.
          </p>
        </div>

        {/* Progress bar + hint — desktop only */}
        {!isMobile && (
          <div className="sc-controls">
            <span className="sc-hint-text" style={{ opacity: progress < 0.05 ? 1 : 0 }}>
              <span className="sc-hint-dot" />
              Scroll to explore
            </span>
            <div className="sc-progress-wrap">
              <div className="sc-progress-fill" style={{ width: `${progress * 100}%` }} />
            </div>
          </div>
        )}

        {/* Clipping viewport */}
        <div ref={viewportRef} className="sc-viewport">
          {/* Left fade */}
          <div className="sc-edge sc-edge--left" />

          {/* Horizontal card track */}
          <div
            ref={trackRef}
            className={`sc-track${isMobile ? ' sc-track--mobile' : ''}`}
          >
            {CARDS.map((card) => (
              <ShowcaseCard key={card.title} card={card} />
            ))}
          </div>

          {/* Right fade */}
          <div className="sc-edge sc-edge--right" />
        </div>

        {/* Mobile dots */}
        {isMobile && (
          <div className="sc-dots" aria-hidden>
            {CARDS.map((c) => <span key={c.title} className="sc-dot" />)}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────── Single card — brand colors only ─────────────── */
function ShowcaseCard({ card }: { card: typeof CARDS[number] }) {
  return (
    <div className="sc-card">
      {/* Top: icon + tag */}
      <div className="sc-card-top">
        <div className="sc-card-icon">{card.icon}</div>
        <span className="sc-card-tag">{card.tag}</span>
      </div>

      <h3 className="sc-card-title">{card.title}</h3>
      <p  className="sc-card-desc">{card.desc}</p>

      {/* Bottom accent line */}
      <div className="sc-card-bar" />
    </div>
  );
}
