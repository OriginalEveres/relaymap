import { styled } from "styled-components";

export const Legend = styled("div")`
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 12px;
`;

export const Swatch = styled("span")<{ $color: string }>`
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 2px;
  margin-right: 5px;
  vertical-align: middle;
  background: ${(p) => p.$color};
`;
