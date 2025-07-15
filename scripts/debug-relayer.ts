// npx ts-node scripts/debug-relayer.ts

import { ethers } from "ethers";
import { CONFIG, MAILBOX_ABI } from "./constants";

async function testMailboxContracts(configs: any): Promise<void> {
  console.log(
    `\n📮 Testing mailbox contract: ${configs.mailbox} on network ${configs.name}`
  );

  try {
    const mailbox = new ethers.Contract(
      configs.mailbox,
      MAILBOX_ABI,
      configs.provider
    );

    const [domain, nonce] = await Promise.all([
      mailbox.localDomain(),
      mailbox.nonce(),
    ]);

    console.log(`   ✅ Mailbox contract is accessible`);
    console.log(`   🆔 Local domain: ${domain}`);
    console.log(`   📊 Message count (nonce): ${nonce}`);
  } catch (error) {
    console.log("   ❌ Mailbox contract test failed:", error);
    console.log("   This could mean:");
    console.log("     - Wrong contract address");
    console.log("     - Contract not deployed");
    console.log("     - RPC issues");
  }
}

// testMailboxContracts(CONFIG.LUKSO_TESTNET.mailbox);
testMailboxContracts(CONFIG.SEPOLIA);
