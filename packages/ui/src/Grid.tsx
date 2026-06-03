import { styled } from "styled-components";

export const Grid = styled("div")<{ $columns?: number }>`
  display: grid;
  grid-template-columns: repeat(${(p) => p.$columns ?? 12}, 1fr);
  gap: 14px;

  @media (max-width: 900px) {
    & > * {
      grid-column: span ${(p) => p.$columns ?? 12} !important;
    }
  }
`;

export const Col = styled("div")<{ $span: number }>`
  grid-column: span ${(p) => p.$span};
`;
