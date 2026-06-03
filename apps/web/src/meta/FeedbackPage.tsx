import { useState } from "react";
import { styled } from "styled-components";
import {
	Page,
	PageHead,
	Grid,
	Col,
	Card,
	CardHead,
	Callout,
	Button,
	FormField,
	RowList,
	RowItem,
	Flex,
	Icon,
} from "@relaymap/ui";

const Label = styled("div")`
	font-size: 12px;
	font-weight: 500;
`;

const LabelSub = styled("div")<{ $mono?: boolean }>`
	font-size: 11px;
	color: var(--text-muted);
	${(p) => p.$mono && "font-family: var(--font-mono);"}
`;

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
		<Page>
			<PageHead
				title="Feedback"
				subtitle="Spotted a bug? Have a feature request? Want to challenge a number? All welcome."
				actions={
					<Button as="a" href="#">
						Open a GitHub issue <Icon.ext width={12} height={12} />
					</Button>
				}
			/>

			<Grid>
				<Col $span={7}>
					<Card>
						{done ? (
							<Callout $variant="ok" style={{ padding: 20 }}>
								<Icon.check width={20} height={20} style={{ color: "var(--ok)", flexShrink: 0 }} />
								<div>
									<div style={{ fontSize: 15, fontWeight: 500, marginBottom: 4 }}>Sent. Thanks!</div>
									<div style={{ fontSize: 12, color: "var(--text-muted)" }}>
										If you left an email I'll reply within a few days. Otherwise the feedback lands in the inbox and
										gets triaged into GitHub.
									</div>
									<Button
										as="button"
										style={{ marginTop: 12 }}
										onClick={() => {
											setDone(false);
											setForm({ name: "", email: "", subject: "general", message: "" });
										}}
									>
										Send another
									</Button>
								</div>
							</Callout>
						) : (
							<form
								onSubmit={(e) => {
									e.preventDefault();
									if (form.message.trim()) setDone(true);
								}}
							>
								<Grid>
									<Col $span={6}>
										<FormField>
											<label>
												Name{" "}
												<span style={{ color: "var(--text-faint)", textTransform: "none" }}>(optional)</span>
											</label>
											<input
												value={form.name}
												onChange={(e) => setForm({ ...form, name: e.target.value })}
											/>
										</FormField>
									</Col>
									<Col $span={6}>
										<FormField>
											<label>
												Email{" "}
												<span style={{ color: "var(--text-faint)", textTransform: "none" }}>(optional)</span>
											</label>
											<input
												type="email"
												value={form.email}
												onChange={(e) => setForm({ ...form, email: e.target.value })}
											/>
										</FormField>
									</Col>
									<Col $span={12}>
										<FormField>
											<label>Topic</label>
											<select
												value={form.subject}
												onChange={(e) =>
													setForm({ ...form, subject: e.target.value as FormState["subject"] })
												}
											>
												<option value="general">General feedback</option>
												<option value="bug">Bug report</option>
												<option value="data">Data accuracy / methodology</option>
												<option value="feature">Feature request</option>
												<option value="api">API request</option>
											</select>
										</FormField>
									</Col>
									<Col $span={12}>
										<FormField>
											<label>Message</label>
											<textarea
												rows={6}
												required
												placeholder="What's on your mind? Code blocks render fine — markdown supported."
												value={form.message}
												onChange={(e) => setForm({ ...form, message: e.target.value })}
											/>
										</FormField>
									</Col>
								</Grid>
								<Flex $justify="space-between" style={{ marginTop: 12 }}>
									<span style={{ fontSize: 11, color: "var(--text-muted)" }}>
										Routed to <strong>GitHub Issues</strong> if topic is bug/feature, else inbox.
									</span>
									<Button as="button" type="submit" $variant="primary">
										Send feedback
									</Button>
								</Flex>
							</form>
						)}
					</Card>
				</Col>

				<Col $span={5}>
					<Card>
						<CardHead title="Other ways to reach me" />
						<RowList>
							<RowItem>
								<div>
									<Label>GitHub repository</Label>
									<LabelSub>Issues, PRs, discussions</LabelSub>
								</div>
								<Button as="a" href="#">
									Open <Icon.ext width={11} height={11} />
								</Button>
							</RowItem>
							<RowItem>
								<div>
									<Label>Email</Label>
									<LabelSub $mono>hello@relaymap.com</LabelSub>
								</div>
								<Button as="a" href="#">
									Copy
								</Button>
							</RowItem>
							<RowItem>
								<div>
									<Label>Personal site</Label>
									<LabelSub>matthewhusak.com</LabelSub>
								</div>
								<Button as="a" href="https://matthewhusak.com" target="_blank" rel="noreferrer">
									Visit <Icon.ext width={11} height={11} />
								</Button>
							</RowItem>
						</RowList>
						<Callout style={{ marginTop: 18 }}>
							<div>
								<strong>Contributors welcome.</strong> The crawler, API, and this site are all MIT-licensed. Good first
								issues are tagged on GitHub.
							</div>
						</Callout>
					</Card>
				</Col>
			</Grid>
		</Page>
	);
}
