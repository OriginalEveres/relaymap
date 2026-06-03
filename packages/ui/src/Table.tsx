import { styled } from "styled-components";

export const TableWrap = styled("div")`
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
`;

export const Table = styled("table")`
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;

  th, td {
    text-align: left;
    padding: 9px 12px;
    border-bottom: 1px solid var(--border);
  }

  thead th {
    background: var(--surface-sunk);
    font-weight: 500;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-muted);
    cursor: pointer;
    user-select: none;
    white-space: nowrap;
    &:hover { color: var(--text); }
  }

  tbody tr {
    cursor: pointer;
    transition: background 0.1s;
    &:hover { background: var(--surface-sunk); }
    &:last-child td { border-bottom: 0; }
  }

  td.num {
    font-family: var(--font-mono);
  }

  td.mono {
    font-family: var(--font-mono);
  }
`;

export const SortIndicator = styled("span")`
  color: var(--primary);
  margin-left: 4px;
`;

export const Pagination = styled("div")`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background: var(--surface-sunk);
  border-top: 1px solid var(--border);
  font-size: 11px;
  color: var(--text-muted);
  font-family: var(--font-mono);

  button {
    background: transparent;
    border: 1px solid var(--border);
    border-radius: 3px;
    color: var(--text);
    padding: 4px 9px;
    font-size: 11px;
    font-family: inherit;
    cursor: pointer;
    &:disabled { opacity: 0.4; cursor: not-allowed; }
    &:not(:disabled):hover { background: var(--surface); }
  }
`;
