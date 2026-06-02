import { useState } from "react";
import { Icon } from "@relaymap/ui";

interface FormState {
	name: string;
	email: string;
	subject: "general" | "bug" | "data" | "feature" | "api";
	message: string;
}

export function FeedbackPage() {
	const [form, setForm] = useState<FormState>({ name: "", email: "", subject: "general", message: "" });
	const [done, setDone] = useState(false);

	return (
		<div className="page">
			<div className="page-head">
				<div>
					<h1>Feedback</h1>
					<p className="subtitle">Spotted a bug? Have a feature request? Want to challenge a number? All welcome.</p>
				</div>
				<a href="#" className="btn">
					Open a GitHub issue <Icon.ext width={12} height={12} />
				</a>
			</div>

			<div className="grid grid-12">
				<div className="card col-7">
					{done ? (
						<div className="callout ok" style={{ padding: 20 }}>
							<Icon.check width={20} height={20} style={{ color: "var(--ok)", flexShrink: 0 }} />
							<div>
								<div style={{ fontSize: 15, fontWeight: 500, marginBottom: 4 }}>Sent. Thanks!</div>
								<div style={{ fontSize: 12, color: "var(--text-muted)" }}>
									If you left an email I'll reply within a few days. Otherwise the feedback lands in the inbox and gets
									triaged into GitHub.
								</div>
								<button
									className="btn mt-12"
									onClick={() => {
										setDone(false);
										setForm({ name: "", email: "", subject: "general", message: "" });
									}}
								>
									Send another
								</button>
							</div>
						</div>
					) : (
						<form
							onSubmit={(e) => {
								e.preventDefault();
								if (form.message.trim()) setDone(true);
							}}
						>
							<div className="grid grid-12">
								<div className="form-field col-6">
									<label>
										Name <span style={{ color: "var(--text-faint)", textTransform: "none" }}>(optional)</span>
									</label>
									<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
								</div>
								<div className="form-field col-6">
									<label>
										Email <span style={{ color: "var(--text-faint)", textTransform: "none" }}>(optional)</span>
									</label>
									<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
								</div>
								<div className="form-field col-12">
									<label>Topic</label>
									<select
										className="input"
										value={form.subject}
										onChange={(e) => setForm({ ...form, subject: e.target.value as FormState["subject"] })}
									>
										<option value="general">General feedback</option>
										<option value="bug">Bug report</option>
										<option value="data">Data accuracy / methodology</option>
										<option value="feature">Feature request</option>
										<option value="api">API request</option>
									</select>
								</div>
								<div className="form-field col-12">
									<label>Message</label>
									<textarea
										rows={6}
										required
										placeholder="What's on your mind? Code blocks render fine — markdown supported."
										value={form.message}
										onChange={(e) => setForm({ ...form, message: e.target.value })}
									/>
								</div>
							</div>
							<div className="flex-between mt-12">
								<span style={{ fontSize: 11, color: "var(--text-muted)" }}>
									Routed to <strong>GitHub Issues</strong> if topic is bug/feature, else inbox.
								</span>
								<button className="btn primary" type="submit">
									Send feedback
								</button>
							</div>
						</form>
					)}
				</div>

				<div className="card col-5">
					<h3 className="card-title">Other ways to reach me</h3>
					<div className="row-list mt-12">
						<div className="row-item">
							<div>
								<div className="label">GitHub repository</div>
								<div className="label-sub">Issues, PRs, discussions</div>
							</div>
							<a href="#" className="btn">
								Open <Icon.ext width={11} height={11} />
							</a>
						</div>
						<div className="row-item">
							<div>
								<div className="label">Email</div>
								<div className="label-sub mono">hello@relaymap.com</div>
							</div>
							<a href="#" className="btn">
								Copy
							</a>
						</div>
						<div className="row-item">
							<div>
								<div className="label">Personal site</div>
								<div className="label-sub">matthewhusak.com</div>
							</div>
							<a href="https://matthewhusak.com" target="_blank" rel="noreferrer" className="btn">
								Visit <Icon.ext width={11} height={11} />
							</a>
						</div>
					</div>
					<div className="callout mt-18">
						<div>
							<strong>Contributors welcome.</strong> The crawler, API, and this site are all MIT-licensed. Good first
							issues are tagged on GitHub.
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
