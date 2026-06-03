import { styled } from "styled-components";

export const KvGrid = styled("div")`
  display: grid;
  grid-template-columns: 140px 1fr;
  row-gap: 8px;
  column-gap: 16px;
  font-size: 12px;
`;

export const KvKey = styled("div")`
  color: var(--text-muted);
`;

export const KvVal = styled("div")`
  font-family: var(--font-mono);
  color: var(--text);
`;
