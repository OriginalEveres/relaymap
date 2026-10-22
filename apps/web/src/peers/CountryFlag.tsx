import { Flag } from "@relaymap/ui";

function ccToEmoji(cc: string): string {
  if (cc.length !== 2) return "";
  const offset = 0x1f1e6 - 65;
  return String.fromCodePoint(
    cc.charCodeAt(0) + offset,
    cc.charCodeAt(1) + offset,
  );
}

export function CountryFlag({ cc, name }: { cc: string; name?: string }) {
  const emoji = ccToEmoji(cc.toUpperCase());
  return (
    <Flag title={name ?? cc}>
      {emoji && <span style={{ fontSize: 16, lineHeight: 1 }}>{emoji}</span>}
      {cc}
    </Flag>
  );
}
