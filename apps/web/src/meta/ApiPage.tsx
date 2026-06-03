import { useState } from "react";
import { styled } from "styled-components";
import { Page, Button, Input, Icon } from "@relaymap/ui";

const ApiHero = styled("div")`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 60vh;
  padding: 48px 0;
`;

const ApiEyebrow = styled("div")`
  font-family: var(--font-mono);
  font-size: 12px;
  color: var(--text-muted);
  letter-spacing: 0.06em;
  margin-bottom: 18px;
`;

const ApiTitle = styled("h1")`
  font-size: 72px;
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 0.95;
  margin: 0 0 20px;
`;

const ApiSub = styled("p")`
  max-width: 420px;
  font-size: 14px;
  color: var(--text-muted);
  line-height: 1.6;
  margin: 0 0 28px;
`;

const ApiForm = styled("form")`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const ApiFormDone = styled("div")`
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 13px;
`;

const ApiMeta = styled("div")`
  margin-top: 18px;
  font-size: 11px;
  color: var(--text-faint);
  display: flex;
  gap: 8px;
  align-items: center;

  a {
    color: var(--text-muted);
    text-decoration: none;
    &:hover {
      color: var(--primary);
    }
  }
`;

export function ApiPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <Page>
      <ApiHero>
        <ApiEyebrow>/v1 · public HTTP API</ApiEyebrow>
        <ApiTitle>
          Coming
          <br />
          soon.
        </ApiTitle>
        <ApiSub>
          A free, open, rate-limited HTTP API to every dataset behind RelayMap.
          Drop your email and we'll ping you the day it ships.
        </ApiSub>

        {submitted ? (
          <ApiFormDone>
            <Icon.check width={18} height={18} style={{ color: "var(--ok)" }} />
            <span>
              You're on the list — <strong>{email}</strong>
            </span>
          </ApiFormDone>
        ) : (
          <ApiForm
            onSubmit={(e) => {
              e.preventDefault();
              if (email) setSubmitted(true);
            }}
          >
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button as="button" type="submit" $variant="primary">
              Notify me
            </Button>
          </ApiForm>
        )}

        <ApiMeta>
          <span>No marketing.</span>
          <span>·</span>
          <span>One email at launch.</span>
          <span>·</span>
          <a href="#">RSS</a>
        </ApiMeta>
      </ApiHero>
    </Page>
  );
}
