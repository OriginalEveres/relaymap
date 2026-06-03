export type Ok<T> = { readonly ok: true; readonly value: T };
export type Fail<E> = { readonly ok: false; readonly error: E };
export type Result<T, E = string> = Ok<T> | Fail<E>;

export function ok<T>(value: T): Ok<T> {
	return { ok: true, value };
}

export function fail<E>(error: E): Fail<E> {
	return { ok: false, error };
}
