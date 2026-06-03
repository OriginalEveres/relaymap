import { styled } from "styled-components";

export const Prose = styled("div")`
  max-width: 720px;
  font-size: 14px;
  line-height: 1.65;

  h2 {
    font-size: 16px;
    margin: 28px 0 8px;
    font-weight: 600;
  }

  p {
    color: var(--text);
    margin: 0 0 10px;
  }

  ul { padding-left: 18px; }
  li { margin-bottom: 4px; }
`;

export const JsonDrawer = styled("pre")`
  background: var(--surface-sunk);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 14px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-muted);
  max-height: 280px;
  overflow: auto;
  white-space: pre;
`;

export const MapPlaceholder = styled("div")`
  position: relative;
  height: 180px;
  border-radius: var(--radius-sm);
  background: repeating-linear-gradient(
    135deg,
    var(--surface-sunk) 0,
    var(--surface-sunk) 6px,
    var(--surface) 6px,
    var(--surface) 12px
  );
  border: 1px dashed var(--border-strong);
  display: grid;
  place-items: center;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-muted);
`;

export const DropRate = styled("div")`
  background: var(--surface-sunk);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 14px;

  input[type="range"] {
    width: 100%;
    accent-color: var(--primary);
  }
`;

export const DropRateValue = styled("div")<{ $color?: string }>`
  font-family: var(--font-mono);
  font-size: 28px;
  letter-spacing: -0.02em;
  margin: 6px 0;
  font-variant-numeric: tabular-nums;
  color: ${(p) => p.$color ?? "var(--text)"};
`;
