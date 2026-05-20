import {
  createPublicClient,
  http,
  parseUnits,
  getAddress,
  type Hex,
} from "viem";
import { base } from "viem/chains";
import { env } from "./env";
import { logger } from "./logger";

// USDC contract — Base mainnet only (the only asset x402 settles in here).
const USDC: Record<string, `0x${string}`> = {
  base: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
};

// keccak256("Transfer(address,address,uint256)")
const TRANSFER_TOPIC =
  "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef";

function topicToAddress(topic: Hex): string {
  // ABI-encoded address = 32-byte word, address in the low 20 bytes.
  return getAddress(`0x${topic.slice(-40)}`).toLowerCase();
}

/**
 * Verify that `txHash` is a confirmed on-chain USDC transfer of at least the
 * configured price to our pay-to address. Returns false on any doubt (fail
 * closed) — a claimed payment we can't confirm must NOT be trusted/stored.
 *
 * Only meaningful when free mode is OFF. Network + price + recipient all come
 * from server env, never the client.
 */
export async function verifyUsdcPayment(txHash: string): Promise<boolean> {
  if (!/^0x[0-9a-fA-F]{64}$/.test(txHash)) return false;

  const network = env.X402_NETWORK();
  const usdc = USDC[network];
  if (!usdc) {
    logger.warn("payment.verify_unknown_network", { network });
    return false;
  }
  const chain = base;
  const payTo = env.X402_PAY_TO().toLowerCase();
  const minAmount = parseUnits(env.X402_PRICE_USDC(), 6);

  try {
    const client = createPublicClient({
      chain,
      transport: http(process.env.BASE_RPC_URL),
    });
    const receipt = await client.getTransactionReceipt({
      hash: txHash as `0x${string}`,
    });
    if (receipt.status !== "success") return false;

    const usdcLower = usdc.toLowerCase();
    for (const log of receipt.logs) {
      if (log.address.toLowerCase() !== usdcLower) continue;
      if ((log.topics[0] ?? "").toLowerCase() !== TRANSFER_TOPIC) continue;
      const toTopic = log.topics[2];
      if (!toTopic) continue;
      if (topicToAddress(toTopic) !== payTo) continue;
      const value = BigInt(log.data);
      if (value >= minAmount) return true;
    }
    return false;
  } catch (err) {
    logger.warn("payment.verify_failed", { err: String(err) });
    return false;
  }
}
