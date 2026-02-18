import hre from "hardhat";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

dotenv.config();

function getExplorerUrl(networkName: string, address: string): string {
  const urls: Record<string, string> = {
    baseSepolia: "https://sepolia.basescan.org",
    base: "https://basescan.org",
    arbitrum: "https://arbiscan.io",
    arbitrumSepolia: "https://sepolia.arbiscan.io",
    optimism: "https://optimistic.etherscan.io",
    optimismSepolia: "https://sepolia-optimism.etherscan.io",
    polygon: "https://polygonscan.com",
    mainnet: "https://etherscan.io",
    sepolia: "https://sepolia.etherscan.io",
    monadTestnet: "https://testnet.monadscan.com",
    monadMainnet: "https://monadscan.com",
  };
  const base = urls[networkName] || "https://etherscan.io";
  return `${base}/address/${address}`;
}

async function verifyContract(
  name: string,
  address: string,
  constructorArgs: any[] = [],
  log: (msg: string) => void = console.log
): Promise<boolean> {
  try {
    log(`\n🚀 Verifying ${name}...`);
    await hre.run("verify:verify", {
      address,
      constructorArguments: constructorArgs,
    });
    log(`✅ ${name} verified successfully!`);
    log(`🔗 ${getExplorerUrl(hre.network.name, address)}`);
    return true;
  } catch (error: any) {
    if (error.message?.includes("Already Verified")) {
      log(`✅ ${name} is already verified!`);
      log(`🔗 ${getExplorerUrl(hre.network.name, address)}`);
      return true;
    }
    log(`❌ ${name} verification failed: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log("\n=== 🔍 VWAPDemo Contract Verification ===\n");

  const networkName = hre.network.name;
  console.log(`Network: ${networkName}`);

  if (!process.env.ETHERSCAN_API_KEY) {
    console.error("❌ ETHERSCAN_API_KEY not found in .env");
    console.error("Get your API key from: https://etherscan.io/apis");
    process.exit(1);
  }

  const deploymentsDir = path.join(__dirname, "..", "deployments", networkName);
  const vwapDemoPath = path.join(deploymentsDir, "VWAPDemo.json");

  if (!fs.existsSync(vwapDemoPath)) {
    console.error(`❌ No VWAPDemo deployment found for ${networkName}`);
    console.error("Run: npx hardhat deploy --network " + networkName);
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(vwapDemoPath, "utf8"));
  const address = data.address;
  if (!address) {
    console.error("❌ VWAPDemo.json missing address");
    process.exit(1);
  }

  await verifyContract("VWAPDemo", address, []);

  console.log("\n" + "=".repeat(60));
  console.log("🎉 Verification completed.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
