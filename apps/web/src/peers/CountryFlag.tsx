import { Flag, FlagImg } from "@relaymap/ui";

export function CountryFlag({ cc, name }: { cc: string; name?: string }) {
	return (
		<Flag title={name}>
			<FlagImg />
			{cc}
		</Flag>
	);
}
