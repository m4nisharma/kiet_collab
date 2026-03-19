import React, { useState, useEffect, useRef } from 'react';
import {
    Rocket, Shield, Users, MessageSquare, Trophy, Code2,
    Star, ChevronDown, ChevronUp, Check, Github, Figma, ArrowRight,
    Zap, Globe, Award, TrendingUp, Target, Cpu, BookOpen,
    MonitorSmartphone, Mail
} from 'lucide-react';
import ShowcaseScroll from '../components/ShowcaseScroll';

interface LandingPageProps {
    setShowAuth: (v: boolean) => void;
}

/* ─────────────── Scroll fade-in hook ─────────────── */
function useFadeIn() {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);
    useEffect(() => {
        const obs = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setVisible(true); },
            { threshold: 0.12 }
        );
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, []);
    return { ref, visible };
}

/* ─────────────── Animated Counter ─────────────── */
function Counter({ end, suffix = '' }: { end: number; suffix?: string }) {
    const [count, setCount] = useState(0);
    const { ref, visible } = useFadeIn();
    useEffect(() => {
        if (!visible) return;
        let start = 0;
        const duration = 1600;
        const step = Math.ceil(end / (duration / 16));
        const timer = setInterval(() => {
            start = Math.min(start + step, end);
            setCount(start);
            if (start >= end) clearInterval(timer);
        }, 16);
        return () => clearInterval(timer);
    }, [visible, end]);
    return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

/* ─────────────── FAQ Item ─────────────── */
function FAQItem({ q, a }: { q: string; a: string }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="lp-faq-item" onClick={() => setOpen(!open)}>
            <div className="lp-faq-header">
                <span className="lp-faq-q">{q}</span>
                {open ? <ChevronUp size={18} className="lp-faq-icon" /> : <ChevronDown size={18} className="lp-faq-icon" />}
            </div>
            {open && <p className="lp-faq-a">{a}</p>}
        </div>
    );
}

/* ─────────────── Section wrapper with fade-in ─────────────── */
function Section({ children, className = '', id }: { children: React.ReactNode; className?: string; id?: string }) {
    const { ref, visible } = useFadeIn();
    return (
        <section id={id} ref={ref} className={`lp-section ${visible ? 'lp-visible' : 'lp-hidden'} ${className}`}>
            {children}
        </section>
    );
}

/* ═══════════════════════════════════════════════════
   LANDING PAGE
═══════════════════════════════════════════════════ */
export default function LandingPage({ setShowAuth }: LandingPageProps) {
    const [scrollY, setScrollY] = useState(0);
    useEffect(() => {
        const handler = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handler, { passive: true });
        return () => window.removeEventListener('scroll', handler);
    }, []);

    return (
        <div className="lp-root">

            {/* ── Blob Background ── */}
            <div className="lp-blobs" aria-hidden>
                <div className="lp-blob lp-blob-1" style={{ transform: `translateY(${scrollY * 0.08}px)` }} />
                <div className="lp-blob lp-blob-2" style={{ transform: `translateY(${-scrollY * 0.05}px)` }} />
                <div className="lp-blob lp-blob-3" style={{ transform: `translateY(${scrollY * 0.04}px)` }} />
            </div>

            {/* ═══════════════════════════════════════════
          NAV
      ═══════════════════════════════════════════ */}
            <nav className="lp-nav">
                <div className="lp-nav-inner">
                    <a href="#" className="lp-logo">
                        <div className="lp-logo-icon">
                            <Rocket size={20} />
                        </div>
                        <span>KIET Collab</span>
                    </a>
                    <div className="lp-nav-links">
                        <a href="#features">Features</a>
                        <a href="#how">How It Works</a>
                        <a href="#pricing">Pricing</a>
                        <a href="#faq">FAQ</a>
                    </div>
                    <button className="lp-btn-primary" onClick={() => setShowAuth(true)}>
                        Sign In <ArrowRight size={16} />
                    </button>
                </div>
            </nav>

            {/* ═══════════════════════════════════════════
          1. HERO
      ═══════════════════════════════════════════ */}
            <section className="lp-hero">
                <div className="lp-hero-badge">
                    <Zap size={12} /> Exclusively for KIET Students
                </div>
                <h1 className="lp-hero-heading">
                    The New Era of<br />
                    <span className="lp-accent-text">Campus Collaboration</span>
                </h1>
                <p className="lp-hero-sub">
                    KIET Collab brings hackathons, team discovery, and innovation management into
                    one intelligent platform built exclusively for KIET students.
                </p>
                <div className="lp-hero-ctas">
                    <button className="lp-btn-primary lp-btn-lg" onClick={() => setShowAuth(true)}>
                        Get Started with @kiet.edu <ArrowRight size={18} />
                    </button>
                    <a href="#features" className="lp-btn-ghost lp-btn-lg">
                        Explore Features
                    </a>
                </div>

                {/* ── Dashboard Preview ── */}
                <div className="lp-hero-preview" style={{ transform: `translateY(${scrollY * -0.06}px)` }}>
                    <div className="lp-preview-glow" />
                    <div className="lp-preview-card">
                        {/* Fake dashboard UI */}
                        <div className="lp-preview-topbar">
                            <div className="lp-preview-dots">
                                <span /><span /><span />
                            </div>
                            <div className="lp-preview-topbar-title">KIET Collab — Dashboard</div>
                            <div className="lp-preview-avatar">AK</div>
                        </div>
                        <div className="lp-preview-body">
                            <div className="lp-preview-sidebar">
                                {['Dashboard', 'Teams', 'Projects', 'Discover', 'Chat', 'Leaderboard'].map(t => (
                                    <div key={t} className={`lp-preview-nav-item ${t === 'Dashboard' ? 'active' : ''}`}>{t}</div>
                                ))}
                            </div>
                            <div className="lp-preview-main">
                                <div className="lp-preview-stats">
                                    {[['4,000+', 'Students'], ['120+', 'Active Teams'], ['58+', 'Projects']].map(([v, l]) => (
                                        <div key={l} className="lp-preview-stat">
                                            <div className="lp-preview-stat-val">{v}</div>
                                            <div className="lp-preview-stat-label">{l}</div>
                                        </div>
                                    ))}
                                </div>
                                <div className="lp-preview-cards-row">
                                    <div className="lp-preview-mini-card">
                                        <div className="lp-preview-mini-label">Upcoming Hackathon</div>
                                        <div className="lp-preview-mini-val">Smart India 2025</div>
                                        <div className="lp-preview-mini-tag">Register Now</div>
                                    </div>
                                    <div className="lp-preview-mini-card">
                                        <div className="lp-preview-mini-label">Your Team</div>
                                        <div className="lp-preview-mini-val">InnovateBots</div>
                                        <div className="lp-preview-mini-tag green">Active</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════
          2. PROBLEM
      ═══════════════════════════════════════════ */}
            <Section>
                <div className="lp-container">
                    <div className="lp-section-label">The Challenge</div>
                    <h2 className="lp-section-heading">Why Students Struggle<br />Before Every Hackathon</h2>
                    <div className="lp-cards-3">
                        {[
                            {
                                icon: <MessageSquare size={24} />,
                                title: 'Scattered Communication',
                                desc: 'Teams rely on fragmented WhatsApp groups and email chains that disappear after every event. Nothing stays organized or searchable.'
                            },
                            {
                                icon: <Users size={24} />,
                                title: 'Finding the Right Teammates',
                                desc: 'Discovering skilled collaborators — especially meeting diversity requirements for female participation — is still done by word of mouth.'
                            },
                            {
                                icon: <Globe size={24} />,
                                title: 'No Central Visibility',
                                desc: 'Brilliant projects vanish after the hackathon ends. There is no shared campus space to celebrate wins or build on past work.'
                            }
                        ].map(({ icon, title, desc }) => (
                            <div key={title} className="lp-problem-card">
                                <div className="lp-problem-icon">{icon}</div>
                                <h3>{title}</h3>
                                <p>{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </Section>

            {/* ═══════════════════════════════════════════
          3. FEATURES
      ═══════════════════════════════════════════ */}
            <Section id="features">
                <div className="lp-container">
                    <div className="lp-section-label">Platform Capabilities</div>
                    <h2 className="lp-section-heading">Smart Features Built<br />for Innovation</h2>
                    <div className="lp-cards-6">
                        {[
                            { icon: <Shield size={22} />, title: 'KIET Email Verified Login', desc: 'Only authentic @kiet.edu accounts can join — keeping the community trusted and secure.' },
                            { icon: <Cpu size={22} />, title: 'Skill-Based Team Matching', desc: 'Intelligent matching surfaces teammates by tech stack, domain expertise, and availability.' },
                            { icon: <Users size={22} />, title: 'Diversity-Aware Team Builder', desc: 'Built-in support for female-participation requirements and cross-branch collaboration.' },
                            { icon: <MessageSquare size={22} />, title: 'Real-Time Team Chat', desc: 'Persistent threaded conversations that outlive the event — your team\'s knowledge base.' },
                            { icon: <Trophy size={22} />, title: 'Hackathon Submission Portal', desc: 'Submit deliverables, link repositories, and track judging status all in one place.' },
                            { icon: <Code2 size={22} />, title: 'Public Project Gallery', desc: 'Showcase all your projects in a campus-wide gallery that grows with every event.' },
                        ].map(({ icon, title, desc }) => (
                            <div key={title} className="lp-feature-card">
                                <div className="lp-feature-icon">{icon}</div>
                                <h3>{title}</h3>
                                <p>{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </Section>

            {/* ═══════════════════════════════════════════
          3b. HORIZONTAL SHOWCASE SCROLL
      ═══════════════════════════════════════════ */}
            <ShowcaseScroll />

            {/* ═══════════════════════════════════════════
          4. RADAR
      ═══════════════════════════════════════════ */}
            <Section>
                <div className="lp-container lp-center">
                    <div className="lp-section-label">Discovery Layer</div>
                    <h2 className="lp-section-heading">Discover Collaborators<br />in a New Dimension</h2>
                    <p className="lp-section-sub">
                        A live radar-style interface that maps skill compatibility and student availability across the campus in real time.
                    </p>
                    <div className="lp-radar-wrap">
                        <div className="lp-radar-card">
                            {/* Radar rings */}
                            <div className="lp-radar-ring lp-radar-ring-1" />
                            <div className="lp-radar-ring lp-radar-ring-2" />
                            <div className="lp-radar-ring lp-radar-ring-3" />
                            <div className="lp-radar-sweep" />
                            {/* Dots */}
                            {[
                                { top: '22%', left: '60%', label: 'Priya · UI/UX' },
                                { top: '55%', left: '25%', label: 'Rahul · ML' },
                                { top: '35%', left: '72%', label: 'Sneha · Backend' },
                                { top: '68%', left: '58%', label: 'Arjun · DevOps' },
                                { top: '78%', left: '38%', label: 'Divya · Data' },
                            ].map(({ top, left, label }) => (
                                <div key={label} className="lp-radar-dot" style={{ top, left }}>
                                    <span className="lp-radar-dot-label">{label}</span>
                                </div>
                            ))}
                            <div className="lp-radar-center">
                                <Target size={20} />
                            </div>
                            <div className="lp-radar-you">You</div>
                        </div>
                    </div>
                </div>
            </Section>

            {/* ═══════════════════════════════════════════
          5. HOW IT WORKS
      ═══════════════════════════════════════════ */}
            <Section id="how">
                <div className="lp-container lp-center">
                    <div className="lp-section-label">Process</div>
                    <h2 className="lp-section-heading">Your Innovation Journey<br />in 4 Steps</h2>
                    <div className="lp-steps">
                        {[
                            { num: '01', icon: <Mail size={24} />, title: 'Sign in with KIET Email', desc: 'One-click authentication with your @kiet.edu address. Verified, secure, instant.' },
                            { num: '02', icon: <BookOpen size={24} />, title: 'Build Your Skill Profile', desc: 'List your tech stack, domains, and availability so smart matching can surface you to the right teams.' },
                            { num: '03', icon: <Users size={24} />, title: 'Form or Join a Team', desc: 'Browse open hackathon slots, send invites, accept join requests — all in one flow.' },
                            { num: '04', icon: <Trophy size={24} />, title: 'Submit & Compete', desc: 'Deliver your project, link repositories, and let your work live on in the public gallery.' },
                        ].map(({ num, icon, title, desc }, i) => (
                            <div key={num} className="lp-step">
                                <div className="lp-step-num">{num}</div>
                                <div className="lp-step-icon">{icon}</div>
                                <h3>{title}</h3>
                                <p>{desc}</p>
                                {i < 3 && <div className="lp-step-connector" />}
                            </div>
                        ))}
                    </div>
                </div>
            </Section>

            {/* ═══════════════════════════════════════════
          6. GROWTH & GAMIFICATION
      ═══════════════════════════════════════════ */}
            <Section>
                <div className="lp-container">
                    <div className="lp-section-label">Engagement</div>
                    <h2 className="lp-section-heading">Built to Reward Participation</h2>
                    <div className="lp-stats-row">
                        {[
                            { val: 4000, suffix: '+', label: 'Students' },
                            { val: 100, suffix: '+', label: 'Teams Formed' },
                            { val: 50, suffix: '+', label: 'Hackathon Projects' },
                        ].map(({ val, suffix, label }) => (
                            <div key={label} className="lp-stat-box">
                                <div className="lp-stat-val"><Counter end={val} suffix={suffix} /></div>
                                <div className="lp-stat-label">{label}</div>
                            </div>
                        ))}
                    </div>
                    <div className="lp-cards-3 lp-mt-6">
                        {[
                            { icon: <Zap size={24} />, title: 'Points System', desc: 'Earn points for profile completeness, team formations, submissions, and mentor ratings.' },
                            { icon: <Award size={24} />, title: 'Badges & Achievements', desc: 'Unlock milestone badges — from First Hackathon to Campus Legend — visible on your profile.' },
                            { icon: <TrendingUp size={24} />, title: 'Leaderboard Rankings', desc: 'See where you stand campus-wide and branch-wise. Healthy competition drives excellence.' },
                        ].map(({ icon, title, desc }) => (
                            <div key={title} className="lp-feature-card lp-gamify-card">
                                <div className="lp-feature-icon">{icon}</div>
                                <h3>{title}</h3>
                                <p>{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </Section>

            {/* ═══════════════════════════════════════════
          7. INTEGRATIONS
      ═══════════════════════════════════════════ */}
            <Section>
                <div className="lp-container lp-center">
                    <div className="lp-section-label">Ecosystem</div>
                    <h2 className="lp-section-heading">Works Seamlessly with<br />Tools You Already Use</h2>
                    <div className="lp-integrations">
                        {[
                            { icon: <Github size={28} />, name: 'GitHub' },
                            { icon: <MonitorSmartphone size={28} />, name: 'Google Meet' },
                            { icon: <BookOpen size={28} />, name: 'Notion' },
                            { icon: <Code2 size={28} />, name: 'VS Code' },
                            { icon: <Figma size={28} />, name: 'Figma' },
                        ].map(({ icon, name }) => (
                            <div key={name} className="lp-integration-chip">
                                {icon}
                                <span>{name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </Section>

            {/* ═══════════════════════════════════════════
          8. MOBILE PREVIEW
      ═══════════════════════════════════════════ */}
            <Section>
                <div className="lp-container lp-center">
                    <div className="lp-section-label">Mobile First</div>
                    <h2 className="lp-section-heading">Innovation, Anywhere</h2>
                    <p className="lp-section-sub">
                        Whether you're between classes or at 2 AM coding — KIET Collab keeps your team connected.
                    </p>
                    <div className="lp-phones">
                        <div className="lp-phone lp-phone-left">
                            <div className="lp-phone-screen">
                                <div className="lp-phone-status-bar" />
                                <div className="lp-phone-content">
                                    <div className="lp-phone-header">Team Chat</div>
                                    {['Priya: Just pushed the UI changes 🎨', 'Rahul: Running tests now', 'You: Let\'s submit tonight!'].map(m => (
                                        <div key={m} className={`lp-phone-msg ${m.startsWith('You') ? 'mine' : ''}`}>{m}</div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="lp-phone lp-phone-right">
                            <div className="lp-phone-screen">
                                <div className="lp-phone-status-bar" />
                                <div className="lp-phone-content">
                                    <div className="lp-phone-header">Discover Tab</div>
                                    {[
                                        { name: 'Ananya S.', skill: 'ML Engineer', tag: 'Available' },
                                        { name: 'Kartik M.', skill: 'Full Stack Dev', tag: 'Open to Teams' },
                                    ].map(({ name, skill, tag }) => (
                                        <div key={name} className="lp-phone-profile-card">
                                            <div className="lp-phone-avatar">{name[0]}</div>
                                            <div>
                                                <div className="lp-phone-profile-name">{name}</div>
                                                <div className="lp-phone-profile-skill">{skill}</div>
                                            </div>
                                            <div className="lp-phone-profile-tag">{tag}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Section>

            {/* ═══════════════════════════════════════════
          9. TESTIMONIALS
      ═══════════════════════════════════════════ */}
            <Section>
                <div className="lp-container lp-center">
                    <div className="lp-section-label">Student Voice</div>
                    <h2 className="lp-section-heading">What KIET Students Are Saying</h2>
                    <div className="lp-cards-3">
                        {[
                            { name: 'Priya Sharma', branch: 'CSE — 3rd Year', quote: 'Found my SIH team in less than 20 minutes. The skill matching is genuinely smart — not just a list of names.', stars: 5 },
                            { name: 'Rahul Verma', branch: 'IT — 2nd Year', quote: 'Finally a platform that understands campus life. The project gallery showed me what second-years built — incredibly motivating.', stars: 5 },
                            { name: 'Sneha Agarwal', branch: 'ECE — 4th Year', quote: 'The diversity-aware team builder helped me find a balanced team without the awkward "we need a girl" conversations. Respectful and smart.', stars: 5 },
                        ].map(({ name, branch, quote, stars }) => (
                            <div key={name} className="lp-testimonial-card">
                                <div className="lp-stars">{Array.from({ length: stars }).map((_, i) => <Star key={i} size={14} fill="#4F6DF5" stroke="none" />)}</div>
                                <p className="lp-testimonial-quote">"{quote}"</p>
                                <div className="lp-testimonial-author">
                                    <div className="lp-testimonial-avatar">{name[0]}</div>
                                    <div>
                                        <div className="lp-testimonial-name">{name}</div>
                                        <div className="lp-testimonial-branch">{branch}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Section>

            {/* ═══════════════════════════════════════════
          10. PRICING
      ═══════════════════════════════════════════ */}
            <Section id="pricing">
                <div className="lp-container lp-center">
                    <div className="lp-section-label">Pricing</div>
                    <h2 className="lp-section-heading">Made for KIET.<br />Always Free.</h2>
                    <div className="lp-pricing-card">
                        <div className="lp-pricing-badge">Free for All KIET Students</div>
                        <div className="lp-pricing-price">₹0<span>/forever</span></div>
                        <ul className="lp-pricing-features">
                            {[
                                'Unlimited team formation',
                                'Unlimited hackathon participation',
                                'Real-time team chat',
                                'Public project showcase',
                                'Skill-based matching',
                                'Badges & leaderboard access',
                            ].map(f => (
                                <li key={f}><Check size={16} className="lp-check-icon" />{f}</li>
                            ))}
                        </ul>
                        <button className="lp-btn-primary lp-btn-lg lp-btn-full" onClick={() => setShowAuth(true)}>
                            Sign in with KIET Email <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            </Section>

            {/* ═══════════════════════════════════════════
          11. FAQ
      ═══════════════════════════════════════════ */}
            <Section id="faq">
                <div className="lp-container lp-faq-container">
                    <div className="lp-section-label lp-center">FAQ</div>
                    <h2 className="lp-section-heading lp-center">Frequently Asked</h2>
                    <div className="lp-faq-list">
                        {[
                            { q: 'Who can join KIET Collab?', a: 'Any student or faculty member with a valid @kiet.edu email address can create an account. The platform is exclusively for the KIET campus community.' },
                            { q: 'Is it only for hackathons?', a: 'Hackathons are the core feature, but KIET Collab also supports project showcasing, student discovery, cross-branch collaboration, and general campus networking.' },
                            { q: 'How is female participation supported?', a: 'Our diversity-aware team builder highlights availability of collaborators across genders and provides tools to meet hackathon diversity mandates without any awkward conversations.' },
                            { q: 'Can faculty monitor events and teams?', a: 'Yes. Faculty accounts have a dedicated dashboard to view event registrations, team compositions, and project submissions in a read-only, non-intrusive way.' },
                            { q: 'Is my data secure?', a: 'All accounts are verified via institutional email, data is encrypted at rest and in transit, and we never sell or share your information with third parties.' },
                        ].map(({ q, a }) => (
                            <FAQItem key={q} q={q} a={a} />
                        ))}
                    </div>
                </div>
            </Section>

            {/* ═══════════════════════════════════════════
          12. FOOTER
      ═══════════════════════════════════════════ */}
            <footer className="lp-footer">
                <div className="lp-footer-inner">
                    <div className="lp-footer-brand">
                        <div className="lp-logo">
                            <div className="lp-logo-icon"><Rocket size={16} /></div>
                            <span>KIET Collab</span>
                        </div>
                        <p>The Innovation Command Center for KIET Students.</p>
                    </div>
                    <div className="lp-footer-cols">
                        <div>
                            <div className="lp-footer-col-title">Product</div>
                            <a href="#">Dashboard</a>
                            <a href="#features">Features</a>
                            <a href="#pricing">Pricing</a>
                        </div>
                        <div>
                            <div className="lp-footer-col-title">Community</div>
                            <a href="#">Hackathons</a>
                            <a href="#">Leaderboard</a>
                            <a href="#">Project Gallery</a>
                        </div>
                        <div>
                            <div className="lp-footer-col-title">Support</div>
                            <a href="#faq">FAQ</a>
                            <a href="#">Documentation</a>
                            <a href="#">Report an Issue</a>
                        </div>
                        <div>
                            <div className="lp-footer-col-title">Contact</div>
                            <a href="mailto:hello@kietcollab.app">hello@kietcollab.app</a>
                            <a href="#">Campus Portal</a>
                        </div>
                    </div>
                </div>
                <div className="lp-footer-bottom">
                    <span>© 2026 KIET Collab. Built for KIET Students.</span>
                </div>
            </footer>
        </div>
    );
}
