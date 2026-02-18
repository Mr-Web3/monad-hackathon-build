import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import * as dotenv from "dotenv";

dotenv.config();

async function waitForPendingTransactions(
  provider: any,
  deployerAddress: string,
  log: (message: string) => void
): Promise<void> {
  const pendingNonce = await provider.getTransactionCount(
    deployerAddress,
    "pending"
  );
  const confirmedNonce = await provider.getTransactionCount(
    deployerAddress,
    "latest"
  );

  if (pendingNonce > confirmedNonce) {
    log(
      `Waiting for ${pendingNonce - confirmedNonce} pending transaction(s) to be mined...`
    );
    let attempts = 0;
    const maxAttempts = 30;
    while (attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const newPendingNonce = await provider.getTransactionCount(
        deployerAddress,
        "pending"
      );
      const newConfirmedNonce = await provider.getTransactionCount(
        deployerAddress,
        "latest"
      );
      if (newPendingNonce === newConfirmedNonce) {
        log("All pending transactions have been mined.");
        break;
      }
      attempts++;
    }
  }
}

async function waitForConfirmation(
  txHash: string,
  provider: any,
  confirmations: number,
  log: (message: string) => void
): Promise<void> {
  log(
    `Waiting for transaction ${txHash} to be confirmed (${confirmations} confirmations)...`
  );
  try {
    let receipt = await provider.getTransactionReceipt(txHash);
    if (!receipt) {
      let attempts = 0;
      const maxAttempts = 60;
      while (!receipt && attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        receipt = await provider.getTransactionReceipt(txHash);
        attempts++;
      }
      if (!receipt) {
        throw new Error(`Transaction ${txHash} not found after waiting`);
      }
    }
    if (confirmations > 0 && receipt.blockNumber) {
      const currentBlock = await provider.getBlockNumber();
      const blocksNeeded =
        receipt.blockNumber + confirmations - currentBlock;
      if (blocksNeeded > 0) {
        let attempts = 0;
        const maxAttempts = 60;
        while (attempts < maxAttempts) {
          const newBlock = await provider.getBlockNumber();
          if (newBlock >= receipt.blockNumber + confirmations) break;
          await new Promise((resolve) => setTimeout(resolve, 2000));
          attempts++;
        }
      }
      log(
        `Transaction ${txHash} confirmed at block ${receipt.blockNumber}.`
      );
    }
  } catch (error: any) {
    log(
      `Warning: Transaction confirmation check failed: ${error?.message || error}`
    );
  }
}

const deployContracts: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy, log } = hre.deployments;
  const { ethers } = hre;

  const provider = ethers.provider;
  const feeData = await provider.getFeeData();
  const currentGasPrice = feeData.gasPrice || BigInt("1000000000");
  const gasPriceWithBuffer =
    (currentGasPrice * BigInt(120)) / BigInt(100);
  log(
    `Using gas price: ${gasPriceWithBuffer.toString()} wei (${(
      Number(gasPriceWithBuffer) / 1e9
    ).toFixed(2)} gwei) with 20% buffer`
  );

  log("Checking for pending transactions...");
  await waitForPendingTransactions(provider, deployer, log);

  // Deploy VWAPDemo (no constructor args)
  log("Deploying VWAPDemo...");
  const vwapDemo = await deploy("VWAPDemo", {
    from: deployer,
    args: [],
    gasPrice: gasPriceWithBuffer.toString(),
    log: true,
    waitConfirmations: 2,
  });
  if (vwapDemo.receipt?.transactionHash) {
    await waitForConfirmation(
      vwapDemo.receipt.transactionHash,
      provider,
      2,
      log
    );
  }
  await waitForPendingTransactions(provider, deployer, log);
  log(`VWAPDemo deployed at ${vwapDemo.address}`);

  log("=== Deployment Summary ===");
  log(`VWAPDemo: ${vwapDemo.address}`);
  log("=========================");
};

export default deployContracts;
deployContracts.tags = ["VWAPDemo"];
