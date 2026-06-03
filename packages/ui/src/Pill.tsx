import { styled } from "styled-components";

export const Pill = styled("span")<{ $variant?: string }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-family: var(--font-mono);
  background: var(--surface-sunk);
  color: var(--text-muted);
  border: 1px solid var(--border);
  white-space: nowrap;

  ${(p) => {
    const v = p.$variant;
    if (!v) return "";
    const cssVar = `var(--${v})`;
    return `
      background: color-mix(in oklab, ${cssVar} 14%, transparent);
      color: ${cssVar};
      border-color: color-mix(in oklab, ${cssVar} 30%, transparent);
    `;
  }}
`;

export const SvcBadges = styled("span")`
  display: inline-flex;
  gap: 4px;
  flex-wrap: wrap;
`;

export const SvcBadge = styled("span")<{ $on?: boolean }>`
  font-family: var(--font-mono);
  font-size: 10px;
  padding: 1px 5px;
  border-radius: 3px;
  background: ${(p) => p.$on ? "color-mix(in oklab, var(--info) 12%, transparent)" : "var(--surface-sunk)"};
  color: ${(p) => p.$on ? "var(--info)" : "var(--text-muted)"};
  border: 1px solid ${(p) => p.$on ? "color-mix(in oklab, var(--info) 28%, transparent)" : "var(--border)"};
`;
