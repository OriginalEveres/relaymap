import { styled } from "styled-components";

export const Flex = styled("div")<{ $gap?: number; $align?: string; $justify?: string }>`
  display: flex;
  gap: ${(p) => p.$gap ?? 8}px;
  align-items: ${(p) => p.$align ?? "center"};
  ${(p) => p.$justify && `justify-content: ${p.$justify};`}
`;

export const PieWrap = styled("div")`
  display: flex;
  gap: 18px;
  align-items: center;
`;
