import { describe, expect, it } from "vitest";
import { NODE_REPOSITORY } from "./node.repository.js";
import { NODE_SCAN_REPOSITORY } from "./node-scan.repository.js";

describe("repository tokens", () => {
	it("NODE_REPOSITORY is a unique symbol", () => {
		expect(typeof NODE_REPOSITORY).toBe("symbol");
		expect(NODE_REPOSITORY.description).toBe("NodeRepository");
	});

	it("NODE_SCAN_REPOSITORY is a unique symbol", () => {
		expect(typeof NODE_SCAN_REPOSITORY).toBe("symbol");
		expect(NODE_SCAN_REPOSITORY.description).toBe("NodeScanRepository");
	});

	it("repository tokens are distinct", () => {
		expect(NODE_REPOSITORY).not.toBe(NODE_SCAN_REPOSITORY);
	});
});
