import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";

const TMP = path.join("/tmp", `pyxis-eth-test-${process.pid}.db`);
process.env.SQLITE_PATH = TMP;

describe("data/sources/etherscan", () => {
  beforeEach(async () => {
    const { closeDb } = await import("../../../db");
    const { resetCacheStmts } = await import("../../cache");
    closeDb();
    resetCacheStmts();
    if (fs.existsSync(TMP)) fs.unlinkSync(TMP);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.ETHERSCAN_API_KEY;
  });

  it("returns null when ETHERSCAN_API_KEY not set", async () => {
    const fetchMock = vi.spyOn(global, "fetch");
    const { getContractMeta } = await import("../etherscan");
    const r = await getContractMeta("base", "0xabc");
    expect(r).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns null on unsupported chain", async () => {
    process.env.ETHERSCAN_API_KEY = "test-key";
    const { getContractMeta } = await import("../etherscan");
    const r = await getContractMeta("xyz-chain", "0xabc");
    expect(r).toBeNull();
  });

  it("detects verified contract + owner pattern", async () => {
    process.env.ETHERSCAN_API_KEY = "test-key";
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          status: "1",
          result: [
            {
              SourceCode:
                "pragma solidity ^0.8.0; contract X { address owner; modifier onlyOwner() { require(msg.sender == owner); _; } }",
              ContractName: "X",
              CompilerVersion: "v0.8.20+commit.a1b79de6",
              Proxy: "0",
            },
          ],
        }),
        { status: 200 },
      ),
    );
    const { getContractMeta } = await import("../etherscan");
    const r = await getContractMeta("base", "0xabc");
    expect(r?.data?.verified).toBe(true);
    expect(r?.data?.name).toBe("X");
    expect(r?.data?.hasOwner).toBe(true);
    expect(r?.data?.hasProxy).toBe(false);
  });

  it("detects unverified contract (empty SourceCode)", async () => {
    process.env.ETHERSCAN_API_KEY = "test-key";
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          status: "0",
          result: [{ SourceCode: "", ABI: "Contract source code not verified" }],
        }),
        { status: 200 },
      ),
    );
    const { getContractMeta } = await import("../etherscan");
    const r = await getContractMeta("ethereum", "0xdef");
    expect(r?.data?.verified).toBe(false);
    expect(r?.data?.hasOwner).toBe(false);
  });
});
