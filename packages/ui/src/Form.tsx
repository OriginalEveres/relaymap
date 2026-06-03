import { styled } from "styled-components";

export const FilterBar = styled("div")`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 14px;
  padding: 12px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
`;

export const ChipGroup = styled("div")`
  display: inline-flex;
  gap: 0;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  overflow: hidden;

  button {
    background: var(--surface);
    border: 0;
    padding: 6px 10px;
    font-size: 11px;
    color: var(--text-muted);
    border-right: 1px solid var(--border);
    cursor: pointer;
    &:last-child { border-right: 0; }
    &.on { background: var(--primary); color: var(--primary-ink); }
  }
`;

export const Input = styled("input")`
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 6px 10px;
  font-family: inherit;
  font-size: 12px;
  color: var(--text);
  outline: none;
  &:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px color-mix(in oklab, var(--primary) 15%, transparent);
  }
`;

export const MonoInput = styled(Input)`
  font-family: var(--font-mono);
`;

export const FormField = styled("div")`
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-bottom: 12px;

  label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--text-muted);
  }

  input, textarea, select {
    background: var(--surface-sunk);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 8px 10px;
    font-family: inherit;
    font-size: 13px;
    color: var(--text);
    outline: none;
    resize: vertical;
    &:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px color-mix(in oklab, var(--primary) 15%, transparent);
      background: var(--surface);
    }
  }
`;
