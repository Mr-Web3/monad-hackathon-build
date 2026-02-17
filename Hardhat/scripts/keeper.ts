import "dotenv/config";
import { Contract, JsonRpcProvider, Wallet, formatUnits } from "ethers";

const ENGINE_ABI = [
  "event OrderCreated(uint256 indexed orderId,address indexed owner,address indexed recipient,address tokenIn,address tokenOut,uint256 totalAmountIn,uint8 numSlices,uint64 intervalSec)",
  "event OrderCancelled(uint256 indexed orderId,uint256 refundedAmount)",
  "event OrderCompleted(uint256 indexed orderId,uint256 totalAmountOut)",
  "function getOrder(uint256 orderId) view returns ((address owner,address recipient,address tokenIn,address tokenOut,uint256 totalAmountIn,uint256 remainingAmountIn,uint8 numSlices,uint8 executedSlices,uint16 maxSlippageBps,uint16 maxImpactBps,uint64 intervalSec,uint64 nextExecutionTime,uint64 deadline,bool active))",
  "function estimateNextSliceAmount(uint256 orderId) view returns (uint256)",
  "function executeSlice(uint256 orderId,uint256 keeperMinOut) returns (uint256)",
];

const AMM_ABI = [
  "function quoteOut(address tokenIn,uint256 amountIn) view returns (uint256)",
];

const ERC20_ABI = ["function decimals() view returns (uint8)", "function symbol() view returns (string)"];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}

async function main() {
  const rpcUrl = requireEnv("KEEPER_RPC_URL");
  const privateKey = requireEnv("KEEPER_PRIVATE_KEY");
  const vwapEngineAddress = requireEnv("VWAP_ENGINE_ADDRESS");
  const simpleAmmAddress = requireEnv("SIMPLE_AMM_ADDRESS");
  const pollIntervalMs = Number(process.env.KEEPER_POLL_INTERVAL_MS || "7000");
  const gasLimit = BigInt(process.env.KEEPER_TX_GAS_LIMIT || "700000");
  const minOutExtraBps = Number(process.env.MIN_OUT_EXTRA_BPS || "20");

  const provider = new JsonRpcProvider(rpcUrl);
  const wallet = new Wallet(privateKey, provider);
  const engine = new Contract(vwapEngineAddress, ENGINE_ABI, wallet);
  const amm = new Contract(simpleAmmAddress, AMM_ABI, provider);

  const activeOrderIds = new Set<string>();
  let lastScannedBlock = await provider.getBlockNumber();

  console.log(`Keeper started for ${vwapEngineAddress}`);
  console.log(`Keeper wallet: ${wallet.address}`);
  console.log(`Polling every ${pollIntervalMs}ms`);

  while (true) {
    try {
      const latestBlock = await provider.getBlockNumber();
      if (latestBlock > lastScannedBlock) {
        const fromBlock = lastScannedBlock + 1;
        const toBlock = latestBlock;

        const createdEvents = await engine.queryFilter(
          engine.filters.OrderCreated(),
          fromBlock,
          toBlock
        );
        for (const event of createdEvents) {
          const eventAny = event as any;
          activeOrderIds.add(eventAny.args.orderId.toString());
        }

        const cancelledEvents = await engine.queryFilter(
          engine.filters.OrderCancelled(),
          fromBlock,
          toBlock
        );
        for (const event of cancelledEvents) {
          const eventAny = event as any;
          activeOrderIds.delete(eventAny.args.orderId.toString());
        }

        const completedEvents = await engine.queryFilter(
          engine.filters.OrderCompleted(),
          fromBlock,
          toBlock
        );
        for (const event of completedEvents) {
          const eventAny = event as any;
          activeOrderIds.delete(eventAny.args.orderId.toString());
        }

        lastScannedBlock = latestBlock;
      }

      const now = Math.floor(Date.now() / 1000);
      for (const orderId of [...activeOrderIds]) {
        const order = await engine.getOrder(orderId);
        if (!order.active) {
          activeOrderIds.delete(orderId);
          continue;
        }
        if (order.nextExecutionTime > now) continue;
        if (order.remainingAmountIn === 0n) {
          activeOrderIds.delete(orderId);
          continue;
        }

        const amountIn: bigint = await engine.estimateNextSliceAmount(orderId);
        if (amountIn === 0n) continue;

        const quotedOut: bigint = await amm.quoteOut(order.tokenIn, amountIn);
        const effectiveSlippageBps = Math.min(
          Number(order.maxSlippageBps) + minOutExtraBps,
          9_000
        );
        const minOut =
          (quotedOut * BigInt(10_000 - effectiveSlippageBps)) / BigInt(10_000);

        const tokenIn = new Contract(order.tokenIn, ERC20_ABI, provider);
        const symbol = await tokenIn.symbol();
        const decimals = await tokenIn.decimals();

        console.log(
          `[keeper] execute order=${orderId} slice=${
            Number(order.executedSlices) + 1
          }/${Number(order.numSlices)} amountIn=${formatUnits(
            amountIn,
            decimals
          )} ${symbol}`
        );

        const tx = await engine.executeSlice(orderId, minOut, { gasLimit });
        const receipt = await tx.wait(1);
        console.log(
          `[keeper] tx=${tx.hash} status=${receipt?.status ?? "unknown"}`
        );
      }
    } catch (error: any) {
      console.error(`[keeper] loop error: ${error?.message || error}`);
    }
    await sleep(pollIntervalMs);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

