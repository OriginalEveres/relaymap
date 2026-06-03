import { styled } from "styled-components";
import type { ReactNode } from "react";

const Wrapper = styled("div")`
  padding: 28px 28px 48px;
  max-width: 1280px;
  width: 100%;
  margin: 0 auto;
`;

const Head = styled("div")`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 22px;
`;

const Title = styled("h1")`
  font-size: 24px;
  font-weight: 600;
  letter-spacing: -0.015em;
  margin: 0 0 4px;
`;

const Subtitle = styled("p")`
  color: var(--text-muted);
  font-size: 13px;
  margin: 0;
`;

export function Page({ children }: { children: ReactNode }) {
  return <Wrapper>{children}</Wrapper>;
}

export function PageHead({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <Head>
      <div>
        <Title>{title}</Title>
        {subtitle && <Subtitle>{subtitle}</Subtitle>}
      </div>
      {actions}
    </Head>
  );
}
