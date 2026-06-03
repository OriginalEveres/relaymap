import { styled } from "styled-components";
import type { ReactNode } from "react";

const Strip = styled("div")`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 18px;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const Wrapper = styled("div")`
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 14px 16px;
`;

const Label = styled("div")`
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  margin-bottom: 8px;
`;

const Value = styled("div")`
  font-family: var(--font-mono);
  font-size: 26px;
  font-weight: 500;
  letter-spacing: -0.02em;
  color: var(--text);
  display: flex;
  align-items: baseline;
  gap: 6px;
`;

const Unit = styled("span")`
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 400;
`;

const Foot = styled("div")`
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 6px;
  font-family: var(--font-mono);
`;

export function StatStrip({ children }: { children: ReactNode }) {
  return <Strip>{children}</Strip>;
}

export function Stat({
  label,
  value,
  unit,
  footer,
}: {
  label: string;
  value: ReactNode;
  unit?: string;
  footer?: ReactNode;
}) {
  return (
    <Wrapper>
      <Label>{label}</Label>
      <Value>
        {value}
        {unit && <Unit>{unit}</Unit>}
      </Value>
      {footer && <Foot>{footer}</Foot>}
    </Wrapper>
  );
}
