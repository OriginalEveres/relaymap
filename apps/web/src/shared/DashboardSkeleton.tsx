// Layout-mirroring skeleton for the dashboard loading state. Uses the same
// .grid / .stat-strip scaffolding as the real page so when the data lands the
// view transition feels like content slotting into place rather than a snap.

export function DashboardSkeleton() {
	return (
		<div className="app-v2" aria-busy="true" aria-label="Loading dashboard">
			<header className="topbar">
				<div className="topbar-inner">
					<div className="skel" style={{ width: 140, height: 22 }} />
					<nav className="topnav" style={{ gap: 8 }}>
						{Array.from({ length: 6 }).map((_, i) => (
							<div key={i} className="skel" style={{ width: 64, height: 16 }} />
						))}
					</nav>
					<div className="topbar-right" style={{ gap: 10 }}>
						<div className="skel" style={{ width: 70, height: 24 }} />
						<div className="skel" style={{ width: 56, height: 24 }} />
					</div>
				</div>
			</header>

			<div className="status-strip">
				<div className="status-strip-inner">
					<div className="skel" style={{ width: 220, height: 12 }} />
					<div className="skel" style={{ width: 160, height: 12 }} />
					<div className="skel" style={{ width: 140, height: 12, marginLeft: "auto" }} />
				</div>
			</div>

			<main className="main">
				<div className="page">
					<div className="page-head">
						<div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
							<div className="skel skel-line lg" style={{ width: 260 }} />
							<div className="skel skel-line sm" style={{ width: 420 }} />
						</div>
						<div className="flex gap-8">
							<div className="skel" style={{ width: 130, height: 30 }} />
							<div className="skel" style={{ width: 130, height: 30 }} />
						</div>
					</div>

					<div className="stat-strip">
						{Array.from({ length: 4 }).map((_, i) => (
							<div key={i} className="skel-card">
								<div className="skel skel-line sm" style={{ width: "55%" }} />
								<div className="skel" style={{ width: "70%", height: 28 }} />
								<div className="skel skel-line sm" style={{ width: "80%" }} />
							</div>
						))}
					</div>

					<div className="grid grid-12">
						{[8, 4, 7, 5, 7, 5].map((span, i) => (
							<div key={i} className={`skel-card col-${span}`} style={{ minHeight: span >= 7 ? 240 : 200 }}>
								<div className="skel skel-line sm" style={{ width: 140 }} />
								<div className="skel" style={{ width: "100%", height: span >= 7 ? 160 : 120, marginTop: 8 }} />
							</div>
						))}
					</div>
				</div>
			</main>
		</div>
	);
}
