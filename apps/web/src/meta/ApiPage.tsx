import { useState } from "react";
import { Icon } from "@relaymap/ui";

export function ApiPage() {
	const [email, setEmail] = useState("");
	const [submitted, setSubmitted] = useState(false);

	return (
		<div className="page api-soon">
			<div className="api-hero">
				<div className="api-eyebrow">/v1 · public HTTP API</div>
				<h1 className="api-huge">
					Coming
					<br />
					soon.
				</h1>
				<p className="api-sub">
					A free, open, rate-limited HTTP API to every dataset behind RelayMap. Drop your email and we'll ping you the
					day it ships.
				</p>

				{submitted ? (
					<div className="api-form-done">
						<Icon.check width={18} height={18} style={{ color: "var(--ok)" }} />
						<span>
							You're on the list — <strong>{email}</strong>
						</span>
					</div>
				) : (
					<form
						className="api-form"
						onSubmit={(e) => {
							e.preventDefault();
							if (email) setSubmitted(true);
						}}
					>
						<input
							className="input"
							type="email"
							placeholder="you@example.com"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
						/>
						<button type="submit" className="btn primary">
							Notify me
						</button>
					</form>
				)}

				<div className="api-meta">
					<span>No marketing.</span>
					<span className="sep">·</span>
					<span>One email at launch.</span>
					<span className="sep">·</span>
					<a href="#">RSS</a>
				</div>
			</div>
		</div>
	);
}
