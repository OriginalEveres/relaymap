export const DiscoverySource = {
	DNS: "DNS",
	MANUAL: "MANUAL",
	ADDR: "ADDR",
	RANDOM: "RANDOM",
	BOOTSTRAP: "BOOTSTRAP",
} as const;

export type DiscoverySource = (typeof DiscoverySource)[keyof typeof DiscoverySource];
