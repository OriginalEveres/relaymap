import { styled, css } from "styled-components";

export const Callout = styled("div")<{ $variant?: "warn" | "ok" }>`
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  border: 1px solid var(--border);
  background: var(--surface-sunk);
  display: flex;
  gap: 10px;
  align-items: flex-start;

  ${(p) =>
    p.$variant === "warn" &&
    css`
      background: color-mix(in oklab, var(--bad) 10%, transparent);
      border-color: color-mix(in oklab, var(--bad) 30%, transparent);
      color: var(--text);
    `}

  ${(p) =>
    p.$variant === "ok" &&
    css`
      background: color-mix(in oklab, var(--ok) 10%, transparent);
      border-color: color-mix(in oklab, var(--ok) 30%, transparent);
    `}
`;
