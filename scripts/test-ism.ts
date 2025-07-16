import { ethers } from "ethers";
import { CONFIG, ISM_ABI, MAILBOX_ABI } from "./constants";

class ISMChecker {
  private luksoProvider: ethers.JsonRpcProvider;
  private sepoliaProvider: ethers.JsonRpcProvider;

  constructor() {
    this.luksoProvider = new ethers.JsonRpcProvider(CONFIG.LUKSO_TESTNET.rpc);
    this.sepoliaProvider = new ethers.JsonRpcProvider(CONFIG.SEPOLIA.rpc);
  }

  // Check ISM configuration for a specific route
  async checkISMConfiguration(): Promise<void> {
    console.log("🔒 Checking ISM Configuration...\n");

    try {
      // Check LUKSO -> Sepolia route
      await this.checkRouteISM(
        "LUKSO -> Sepolia",
        CONFIG.SEPOLIA.mailbox,
        this.sepoliaProvider,
        CONFIG.LUKSO_TESTNET.chainId
      );

      // Check Sepolia -> LUKSO route
      //   await this.checkRouteISM(
      //     "Sepolia -> LUKSO",
      //     CONFIG.LUKSO_TESTNET.mailbox,
      //     this.luksoProvider,
      //     CONFIG.SEPOLIA.chainId
      //   );
    } catch (error) {
      console.error("❌ Error checking ISM configuration:", error);
    }
  }

  // Check ISM for a specific route
  async checkRouteISM(
    routeName: string,
    mailboxAddress: string,
    provider: ethers.JsonRpcProvider,
    originDomain: number
  ): Promise<void> {
    console.log(`\n📋 Checking ${routeName}:`);

    try {
      // Get the mailbox contract
      const mailbox = new ethers.Contract(
        mailboxAddress,
        MAILBOX_ABI,
        provider
      );

      // Get default ISM
      const defaultIsmAddress = await mailbox.defaultIsm();
      console.log(`   Default ISM: ${defaultIsmAddress}`);

      // Check ISM type and configuration
      await this.analyzeISM(provider, defaultIsmAddress, originDomain);
    } catch (error) {
      console.error(`   ❌ Error checking ${routeName}:`, error);
    }
  }

  // Analyze ISM contract to determine type and settings
  async analyzeISM(
    provider: ethers.JsonRpcProvider,
    ismAddress: string,
    originDomain: number
  ): Promise<void> {
    try {
      //   const ismContract = new ethers.Contract(ismAddress, ISM_ABI, provider);
      //   console.log(ismContract);
      await this.analyzeISMSepolia(ismAddress);
    } catch (error) {
      console.error("   ❌ Error analyzing ISM:", error);
    }
  }

  async analyzeISMSepolia(ismAddress: string) {
    // Try common ISM functions to identify type
    const luksoOriginDomain = 4201;

    // Multisig ISM ABI
    const multisigAbi = [
      "function validators(uint32 domain) view returns (address[])",
      "function threshold(uint32 domain) view returns (uint8)",
      "function validatorsAndThreshold(uint32 domain) view returns (address[], uint8)",
    ];

    const ism = new ethers.Contract(
      ismAddress,
      multisigAbi,
      CONFIG.SEPOLIA.provider
    );

    const [validators, threshold] = await ism.validatorsAndThreshold(
      luksoOriginDomain
    );
    console.log(`📊 Threshold: ${threshold} ${validators.length}`);
    console.log("👥 Authorized Validators:");
    console.log(validators);
  }

  // Main diagnostic function
  async runFullCheck(): Promise<void> {
    console.log("🔒 HYPERLANE ISM CONFIGURATION CHECK\n");
    console.log("=====================================\n");

    await this.checkISMConfiguration();
  }
}

// Usage
async function main() {
  const checker = new ISMChecker();
  await checker.runFullCheck();
}

if (require.main === module) {
  main().catch(console.error);
}

export { ISMChecker };
