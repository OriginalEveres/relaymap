import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Icon } from "@relaymap/ui";
import { useTheme } from "./useTheme.js";
import type { NetworkMeta } from "./types.js";

interface NavLink {
	readonly to: string;
	readonly label: string;
	readonly match?: readonly string[];
	readonly badge?: string;
}

const LINKS: readonly NavLink[] = [
	{ to: "/", label: "Dashboard", match: ["/"] },
	{ to: "/peers", label: "Peers" },
	{ to: "/fees", label: "Fees" },
	{ to: "/api", label: "API", badge: "soon" },
	{ to: "/feedback", label: "Feedback" },
	{ to: "/about", label: "About" },
];

export function TopShell({ meta, children }: { meta: NetworkMeta; children: ReactNode }) {
	const { pathname } = useLocation();
	const [theme, setTheme] = useTheme();

	const isActive = (l: NavLink) =>
		l.match ? l.match.includes(pathname) : pathname.startsWith(l.to);

	return (
		<div className="app-v2">
			<header className="topbar">
				<div className="topbar-inner">
					<Link to="/" viewTransition className="brand">
						<span className="brand-mark">R</span>
						<span className="brand-name">
							RelayMap
							<span style={{ color: "var(--text-muted)", fontWeight: 400 }}>.com</span>
						</span>
					</Link>
					<nav className="topnav">
						{LINKS.map((l) => (
							<Link key={l.to} to={l.to} viewTransition className={isActive(l) ? "active" : ""}>
								{l.label}
								{l.badge && <span className="badge">{l.badge}</span>}
							</Link>
						))}
					</nav>
					<div className="topbar-right">
						<a
							href="https://github.com/OriginalEveres"
							target="_blank"
							rel="noreferrer"
							className="gh-link"
						>
							GitHub <Icon.ext width={11} height={11} />
						</a>
						<div className="theme-toggle" role="tablist">
							<button onClick={() => setTheme("light")} className={theme === "light" ? "on" : ""} aria-label="Light">
								<Icon.sun width={12} height={12} />
							</button>
							<button onClick={() => setTheme("dark")} className={theme === "dark" ? "on" : ""} aria-label="Dark">
								<Icon.moon width={12} height={12} />
							</button>
						</div>
					</div>
				</div>
			</header>

			<div className="status-strip">
				<div className="status-strip-inner">
					<span className="pulse" />
					<span>
						Last crawl <strong>{meta.lastCrawl}</strong>
					</span>
					<span className="sep">·</span>
					<span>
						<strong>{meta.total.toLocaleString()}</strong> reachable
					</span>
					<span className="sep">·</span>
					<span className="diff">
						<span className="plus">+{meta.delta.plus}</span>
						<span className="minus">−{meta.delta.minus}</span>
						<span style={{ color: "var(--text-faint)" }}>vs last</span>
					</span>
					<div className="right">
						<span>
							tip <strong>{meta.tipHeight.toLocaleString()}</strong>
						</span>
						<span className="sep">·</span>
						<span>{meta.lastCrawlAbs}</span>
					</div>
				</div>
			</div>

			<main className="main">{children}</main>

			<footer className="foot">
				<div className="foot-inner">
					<div>
						Built by{" "}
						<a href="https://matthewhusak.com" target="_blank" rel="noreferrer">
							Matthew Husak
						</a>
						<span style={{ margin: "0 10px", color: "var(--text-faint)" }}>·</span>
						<span style={{ color: "var(--text-faint)" }}>MIT licensed · open source</span>
					</div>
					<div className="foot-links">
						<Link to="/feedback" viewTransition>Feedback</Link>
						<Link to="/api" viewTransition>API</Link>
						<a href="https://github.com/OriginalEveres" target="_blank" rel="noreferrer">
							GitHub
						</a>
						<Link to="/about" viewTransition>About</Link>
					</div>
					<div className="foot-right">
						Last crawl <strong>{meta.lastCrawl}</strong> · {meta.total.toLocaleString()} nodes
					</div>
				</div>
			</footer>
		</div>
	);
}
