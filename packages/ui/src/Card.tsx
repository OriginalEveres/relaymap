import { styled } from "styled-components";
import type { ReactNode } from "react";

export const Card = styled("div")`
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 18px;
`;

const HeadWrapper = styled("div")`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
`;

const Title = styled("h3")`
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  margin: 0;
  font-weight: 500;
`;

const LinkStyled = styled("a")`
  font-size: 11px;
  color: var(--text-muted);
  text-decoration: none;
  &:hover {
    color: var(--primary);
  }
`;

export function CardHead({
  title,
  subtitle,
  children,
  linkText,
  onLinkClick,
}: {
  title: string;
  subtitle?: ReactNode;
  children?: ReactNode;
  linkText?: string;
  onLinkClick?: () => void;
}) {
  return (
    <HeadWrapper>
      <div>
        <Title>{title}</Title>
        {subtitle}
        {children}
      </div>
      {linkText && (
        <LinkStyled
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onLinkClick?.();
          }}
        >
          {linkText}
        </LinkStyled>
      )}
    </HeadWrapper>
  );
}
