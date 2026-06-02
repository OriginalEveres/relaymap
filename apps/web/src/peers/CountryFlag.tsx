export function CountryFlag({ cc, name }: { cc: string; name?: string }) {
	return (
		<span className="flag" title={name}>
			<span className="cc" />
			{cc}
		</span>
	);
}
