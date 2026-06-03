import { styled } from "styled-components";

export const Mono = styled("span")`
  font-family: var(--font-mono);
  font-feature-settings: "tnum", "ss01";
`;

export const Muted = styled("span")`
  color: var(--text-muted);
`;

export const Faint = styled("span")`
  color: var(--text-faint);
`;

export const Flag = styled("span")`
  font-family: var(--font-mono);
  font-size: 11px;
  display: inline-flex;
  gap: 5px;
  align-items: center;
`;

export const FlagImg = styled("span")`
  display: inline-block;
  width: 18px;
  height: 12px;
  border-radius: 1px;
  vertical-align: middle;
  background: var(--surface-sunk);
  border: 1px solid var(--border);
`;
