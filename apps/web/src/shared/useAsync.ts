import { useEffect, useState } from "react";

export interface AsyncState<T> {
	readonly data: T | null;
	readonly error: Error | null;
	readonly loading: boolean;
}

export function useAsync<T>(
	load: (signal: AbortSignal) => Promise<T>,
	deps: unknown[] = [],
): AsyncState<T> {
	const [data, setData] = useState<T | null>(null);
	const [error, setError] = useState<Error | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const controller = new AbortController();
		setLoading(true);
		setError(null);
		load(controller.signal)
			.then((value) => {
				if (!controller.signal.aborted) setData(value);
			})
			.catch((err: unknown) => {
				if (controller.signal.aborted) return;
				setError(err instanceof Error ? err : new Error(String(err)));
			})
			.finally(() => {
				if (!controller.signal.aborted) setLoading(false);
			});
		return () => controller.abort();
	}, deps);

	return { data, error, loading };
}
