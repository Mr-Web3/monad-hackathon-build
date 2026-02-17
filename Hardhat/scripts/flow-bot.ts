import "dotenv/config";
import {
  Contract,
  JsonRpcProvider,
  MaxUint256,
  Wallet,
  formatUnits,
  parseEther,
  parseUnits,
} from "ethers";

const ERC20_ABI = [
  "function approve(address spender,uint256 amount) returns (bool)",
  "function faucet(address to,uint256 amount)",
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function allowance(address owner,address spender) view returns (uint256)",
];

const AMM_ABI = [
  "function quoteOut(address tokenIn,uint256 amountIn) view returns (uint256)",
  "function swapExactIn(address tokenIn,uint256 amountIn,uint256 minAmountOut,address recipient) returns (uint256)",
];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}

function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

async function main() {
  const rpcUrl = requireEnv("FLOW_BOT_RPC_URL");
  const privateKey = requireEnv("FLOW_BOT_PRIVATE_KEY");
  const simpleAmmAddress = requireEnv("SIMPLE_AMM_ADDRESS");
  const usdcAddress = requireEnv("MOCK_USDC_ADDRESS");
  const monAddress = requireEnv("MOCK_MON_ADDRESS");

  const flowIntervalMs = Number(process.env.FLOW_INTERVAL_MS || "15000");
  const minSizeUsdc = Number(process.env.FLOW_MIN_SIZE_USDC || "5");
  const maxSizeUsdc = Number(process.env.FLOW_MAX_SIZE_USDC || "75");

  const provider = new JsonRpcProvider(rpcUrl);
  const wallet = new Wallet(privateKey, provider);

  const usdc = new Contract(usdcAddress, ERC20_ABI, wallet);
  const mon = new Contract(monAddress, ERC20_ABI, wallet);
  const amm = new Contract(simpleAmmAddress, AMM_ABI, wallet);

  const usdcDecimals: number = await usdc.decimals();
  const monDecimals: number = await mon.decimals();

  const usdcAllowance: bigint = await usdc.allowance(wallet.address, simpleAmmAddress);
  if (usdcAllowance < MaxUint256 / 2n) {
    await (await usdc.approve(simpleAmmAddress, MaxUint256)).wait(1);
  }

  const monAllowance: bigint = await mon.allowance(wallet.address, simpleAmmAddress);
  if (monAllowance < MaxUint256 / 2n) {
    await (await mon.approve(simpleAmmAddress, MaxUint256)).wait(1);
  }

  console.log(`Flow bot started with wallet ${wallet.address}`);
  console.log(`Interval ${flowIntervalMs}ms`);

  while (true) {
    try {
      const buyMon = Math.random() > 0.5;
      const notionalUsdc = randomBetween(minSizeUsdc, maxSizeUsdc);

      let tokenIn: string;
      let amountIn: bigint;
      let decimals: number;
      let symbol: string;

      if (buyMon) {
        tokenIn = usdcAddress;
        amountIn = parseUnits(notionalUsdc.toFixed(4), usdcDecimals);
        decimals = usdcDecimals;
        symbol = await usdc.symbol();
      } else {
        tokenIn = monAddress;
        const monAmount = Math.max(0.001, notionalUsdc / 1500);
        amountIn = parseEther(monAmount.toFixed(6));
        decimals = monDecimals;
        symbol = await mon.symbol();
      }

      // Top up wallet with faucet tokens if needed.
      const token = tokenIn === usdcAddress ? usdc : mon;
      const balance: bigint = await token.balanceOf(wallet.address);
      if (balance < amountIn) {
        const topUp = amountIn * 20n;
        await (await token.faucet(wallet.address, topUp)).wait(1);
      }

      const quoteOut: bigint = await amm.quoteOut(tokenIn, amountIn);
      const minOut = (quoteOut * 96n) / 100n;

      const tx = await amm.swapExactIn(tokenIn, amountIn, minOut, wallet.address);
      await tx.wait(1);
      console.log(
        `[flow] swap ${formatUnits(amountIn, decimals)} ${symbol} tx=${tx.hash}`
      );
    } catch (error: any) {
      console.error(`[flow] loop error: ${error?.message || error}`);
    }

    await sleep(flowIntervalMs);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

