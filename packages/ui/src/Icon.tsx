import type { CSSProperties, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & {
	width?: number | string;
	height?: number | string;
	style?: CSSProperties;
};

// An icon set is a vocabulary, not a collection of independent components —
// keep it in one file the same way a typeface lives in one font file.
export const Icon = {
	dash: (p: IconProps) => (
		<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}>
			<rect x="2" y="2" width="5" height="6" rx="1" />
			<rect x="9" y="2" width="5" height="3" rx="1" />
			<rect x="9" y="7" width="5" height="7" rx="1" />
			<rect x="2" y="10" width="5" height="4" rx="1" />
		</svg>
	),
	peers: (p: IconProps) => (
		<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}>
			<circle cx="4" cy="4.5" r="2" />
			<circle cx="12" cy="4.5" r="2" />
			<circle cx="8" cy="11.5" r="2" />
			<path d="M5.5 5.5l5 0M5 6l2 4M11 6l-2 4" />
		</svg>
	),
	fees: (p: IconProps) => (
		<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}>
			<path d="M2 13l3-3 2 2 4-5 3 2" />
			<path d="M2 14h12" />
		</svg>
	),
	api: (p: IconProps) => (
		<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}>
			<path d="M2 8l3-3M2 8l3 3M14 8l-3-3M14 8l-3 3M9 4l-2 8" />
		</svg>
	),
	feedback: (p: IconProps) => (
		<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}>
			<path d="M2 3h12v8H8l-3 3v-3H2z" />
		</svg>
	),
	about: (p: IconProps) => (
		<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}>
			<circle cx="8" cy="8" r="6" />
			<path d="M8 7v4M8 5v.01" />
		</svg>
	),
	sun: (p: IconProps) => (
		<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}>
			<circle cx="8" cy="8" r="3" />
			<path d="M8 1v2M8 13v2M1 8h2M13 8h2M3 3l1.5 1.5M11.5 11.5L13 13M3 13l1.5-1.5M11.5 4.5L13 3" />
		</svg>
	),
	moon: (p: IconProps) => (
		<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}>
			<path d="M13 9.5A5 5 0 016.5 3a5.5 5.5 0 106.5 6.5z" />
		</svg>
	),
	ext: (p: IconProps) => (
		<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" {...p}>
			<path d="M9 3h4v4M13 3l-7 7M7 4H4a1 1 0 00-1 1v7a1 1 0 001 1h7a1 1 0 001-1V9" />
		</svg>
	),
	search: (p: IconProps) => (
		<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}>
			<circle cx="7" cy="7" r="4.5" />
			<path d="M14 14l-3.5-3.5" />
		</svg>
	),
	arrow: (p: IconProps) => (
		<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}>
			<path d="M3 8h10M9 4l4 4-4 4" />
		</svg>
	),
	warn: (p: IconProps) => (
		<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" {...p}>
			<path d="M8 2L1.5 13.5h13zM8 6v4M8 12v.01" />
		</svg>
	),
	check: (p: IconProps) => (
		<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}>
			<path d="M3 8.5l3 3 7-7" />
		</svg>
	),
} as const;
