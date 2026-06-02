import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { fetchNetworkData } from "./shared/client.js";
import { useAsync } from "./shared/useAsync.js";
import { DashboardSkeleton } from "./shared/DashboardSkeleton.js";
import { TopShell } from "./shared/TopShell.js";
import { DashboardPage } from "./overview/DashboardPage.js";
import { PeersPage } from "./peers/PeersPage.js";
import { NodeDetailPage } from "./peers/NodeDetailPage.js";
import { FeesPage } from "./fees/FeesPage.js";
import { ApiPage } from "./meta/ApiPage.js";
import { FeedbackPage } from "./meta/FeedbackPage.js";
import { AboutPage } from "./meta/AboutPage.js";

export function App() {
	const { data, error, loading } = useAsync((signal) => fetchNetworkData(signal));

	if (error) {
		return (
			<div style={{ padding: 40, fontFamily: "var(--font-mono)", color: "var(--bad)" }}>
				Failed to load: {error.message}
			</div>
		);
	}

	if (loading || !data) {
		return <DashboardSkeleton />;
	}

	return (
		<HashRouter>
			<TopShell meta={data.meta}>
				<Routes>
					<Route path="/" element={<DashboardPage data={data} />} />
					<Route path="/peers" element={<PeersPage data={data} />} />
					<Route path="/node/:ip" element={<NodeDetailPage data={data} />} />
					<Route path="/fees" element={<FeesPage data={data} />} />
					<Route path="/api" element={<ApiPage />} />
					<Route path="/feedback" element={<FeedbackPage />} />
					<Route path="/about" element={<AboutPage />} />
					<Route path="*" element={<Navigate to="/" replace />} />
				</Routes>
			</TopShell>
		</HashRouter>
	);
}
