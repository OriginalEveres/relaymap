import { styled, css } from "styled-components";

export const Button = styled("button")<{ $variant?: "primary" | "ghost" }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--surface);
  border: 1px solid var(--border);
  color: var(--text);
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  text-decoration: none;

  &:hover {
    background: var(--surface-sunk);
  }

  ${(p) =>
    p.$variant === "primary" &&
    css`
      background: var(--primary);
      color: var(--primary-ink);
      border-color: var(--primary);
      &:hover {
        filter: brightness(0.95);
        background: var(--primary);
      }
    `}

  ${(p) =>
    p.$variant === "ghost" &&
    css`
      background: transparent;
    `}
`;
