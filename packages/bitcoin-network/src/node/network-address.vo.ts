import { IpAddress } from "./ip-address.vo.js";
import { Port } from "./port.vo.js";

export class NetworkAddress {
	private constructor(
		public readonly ip: IpAddress,
		public readonly port: Port,
	) {}

	static create(ip: string, port: number): NetworkAddress {
		return new NetworkAddress(IpAddress.create(ip), Port.create(port));
	}

	equals(other: NetworkAddress): boolean {
		return this.ip.equals(other.ip) && this.port.equals(other.port);
	}

	toString(): string {
		return `${this.ip.value}:${this.port.value}`;
	}
}
