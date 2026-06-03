import { styled } from "styled-components";

export const RowList = styled("div")`
  display: flex;
  flex-direction: column;
`;

export const RowItem = styled("div")`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
  align-items: center;
  padding: 9px 0;
  border-bottom: 1px dashed var(--border);
  font-size: 12px;

  &:last-child {
    border-bottom: 0;
  }
`;

export const RowValue = styled("span")`
  font-family: var(--font-mono);
  color: var(--text);
`;

export const BarTrack = styled("span")`
  width: 100px;
  height: 6px;
  background: var(--surface-sunk);
  border-radius: 3px;
  overflow: hidden;
  display: inline-block;
  margin-right: 8px;
  vertical-align: middle;
`;

export const BarFill = styled("span")<{ $width: string; $color?: string }>`
  display: block;
  height: 100%;
  width: ${(p) => p.$width};
  background: ${(p) => p.$color ?? "var(--accent)"};
  border-radius: 3px;
`;
