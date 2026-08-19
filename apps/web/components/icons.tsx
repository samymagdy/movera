export function Arrow({ direction = "right" }: { direction?: "left" | "right" }) {
  return <svg className={`icon-arrow ${direction === "left" ? "is-left" : ""}`} viewBox="0 0 20 20" aria-hidden="true"><path d="M3 10h13M11 4l6 6-6 6" /></svg>;
}

export function MenuIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" /></svg>; }
export function CloseIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg>; }
export function ChevronDownIcon() { return <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m5 7.5 5 5 5-5" /></svg>; }
export function SearchIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.8" cy="10.8" r="6.5" /><path d="m16 16 5 5" /></svg>; }
export function GlobeIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5" /><path d="M3.5 12h17M12 3.5c2.2 2.3 3.2 5.1 3.2 8.5s-1 6.2-3.2 8.5c-2.2-2.3-3.2-5.1-3.2-8.5s1-6.2 3.2-8.5Z" /></svg>; }
export function SparkIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.8 14 10l7.2 2-7.2 2-2 7.2-2-7.2-7.2-2 7.2-2 2-7.2Z" /></svg>; }
export function SuiteIcon({ kind }: { kind: number }) {
  const paths = [
    <><rect key="camera" x="4" y="7" width="16" height="11" rx="2" /><path d="m8 7 2-3h4l2 3M8 12h.01M12 12a2.5 2.5 0 1 0 0 .01" /></>,
    <><circle key="agent" cx="12" cy="9" r="4" /><path d="M5 20c.6-3.3 2.9-5 7-5s6.4 1.7 7 5M10 9h.01M14 9h.01M9 12c2 1.3 4 1.3 6 0" /></>,
    <><ellipse key="data" cx="12" cy="6" rx="7" ry="3" /><path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6" /></>,
    <><path key="predict" d="M4 18 9 13l3 2 7-8" /><path d="M15 7h4v4M4 20h16" /></>,
    <><circle key="network-a" cx="12" cy="5" r="2" /><circle cx="6" cy="17" r="2" /><circle cx="18" cy="17" r="2" /><path d="m10.8 6.7-3.6 8.6m6-8.6 3.6 8.6M8 17h8" /></>,
    <><path key="shield" d="m12 3 7 3v5c0 4.2-2.4 7.6-7 10-4.6-2.4-7-5.8-7-10V6l7-3Z" /><path d="m9 12 2 2 4-4" /></>,
  ];
  return <svg viewBox="0 0 24 24" aria-hidden="true">{paths[kind % paths.length]}</svg>;
}
export function StatIcon({ kind }: { kind: 0 | 1 | 2 | 3 }) { const paths = [<path key="a" d="m12 3 7 4v9l-7 5-7-5V7l7-4Z" />, <path key="b" d="M4 18v-5m5 5V8m5 10v-8m5 8V4M3 20h18" />, <path key="c" d="M12 3 4 7l8 4 8-4-8-4Zm-8 9 8 4 8-4m-16 5 8 4 8-4" />, <path key="d" d="M12 3v18m0-18 7 4v9l-7 5-7-5V7l7-4Z" />]; return <svg className="stat-icon" viewBox="0 0 24 24" aria-hidden="true">{paths[kind]}</svg>; }
export function SocialIcon({ name }: { name: "facebook" | "instagram" | "youtube" | "linkedin" }) {
  if (name === "facebook") return <svg className="social-icon social-icon--facebook" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path className="social-icon-glyph" d="M13.5 20.5v-7h2.35l.35-2.65h-2.7V9.16c0-.77.22-1.29 1.35-1.29h1.44V5.5c-.25-.03-1.1-.1-2.1-.1-2.08 0-3.5 1.27-3.5 3.6v1.85H8.6v2.65h2.34v7h2.56Z" /></svg>;
  if (name === "instagram") return <svg className="social-icon social-icon--instagram" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect className="social-icon-outline" x="3.2" y="3.2" width="17.6" height="17.6" rx="5" /><circle className="social-icon-outline" cx="12" cy="12" r="4.1" /><circle className="social-icon-dot" cx="17.3" cy="6.8" r="1.1" /></svg>;
  if (name === "youtube") return <svg className="social-icon social-icon--youtube" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path className="social-icon-glyph" d="M21.35 7.05a2.8 2.8 0 0 0-1.97-1.98C17.64 4.6 12 4.6 12 4.6s-5.64 0-7.38.47a2.8 2.8 0 0 0-1.97 1.98A29 29 0 0 0 2.18 12a29 29 0 0 0 .47 4.95 2.8 2.8 0 0 0 1.97 1.98c1.74.47 7.38.47 7.38.47s5.64 0 7.38-.47a2.8 2.8 0 0 0 1.97-1.98A29 29 0 0 0 21.82 12a29 29 0 0 0-.47-4.95Z" /><path className="social-icon-play" d="m10.2 9.15 5.3 2.85-5.3 2.85V9.15Z" /></svg>;
  return <svg className="social-icon social-icon--linkedin" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path className="social-icon-glyph" d="M7.25 9.35H4.05V20h3.2V9.35ZM5.65 4a1.85 1.85 0 1 0 0 3.7 1.85 1.85 0 0 0 0-3.7ZM9.15 9.35V20h3.2v-5.27c0-1.39.26-2.73 1.98-2.73 1.69 0 1.71 1.58 1.71 2.83V20h3.21v-5.84c0-2.87-.62-5.08-3.98-5.08-1.63 0-2.72.9-3.17 1.75h-.04V9.35H9.15Z" /></svg>;
}
