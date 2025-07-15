// npx ts-node scripts/test-relayer.ts

import { ethers } from "ethers";
import { CONFIG, MAILBOX_ABI, PRIVATE_KEY } from "./constants";

// Helper function to convert address to bytes32
function addressToBytes32(address: string): string {
  return ethers.zeroPadValue(ethers.getBytes(ethers.getAddress(address)), 32);
}

class HyperlaneRelayerTest {
  private luksoProvider: ethers.JsonRpcProvider;
  private sepoliaProvider: ethers.JsonRpcProvider;

  constructor() {
    this.luksoProvider = new ethers.JsonRpcProvider(CONFIG.LUKSO_TESTNET.rpc);
    this.sepoliaProvider = new ethers.JsonRpcProvider(CONFIG.SEPOLIA.rpc);
  }

  // Test 1: Basic connectivity
  async testConnectivity(): Promise<void> {
    console.log("🔗 Testing connectivity to both chains...");

    try {
      const [luksoBlock, sepoliaBlock] = await Promise.all([
        this.luksoProvider.getBlockNumber(),
        this.sepoliaProvider.getBlockNumber(),
      ]);

      console.log(`✅ LUKSO Testnet: Block ${luksoBlock}`);
      console.log(`✅ Sepolia: Block ${sepoliaBlock}`);
    } catch (error) {
      console.error("❌ Connectivity test failed:", error);
      throw error;
    }
  }

  // Test 2: Check mailbox contracts
  async testMailboxContracts(): Promise<void> {
    console.log("\n📮 Testing Hyperlane Mailbox contracts...");

    try {
      // Test LUKSO mailbox
      const luksoMailbox = new ethers.Contract(
        CONFIG.LUKSO_TESTNET.mailbox,
        MAILBOX_ABI,
        this.luksoProvider
      );

      const [luksoDomain, luksoCount] = await Promise.all([
        luksoMailbox.localDomain(),
        luksoMailbox.nonce(),
      ]);

      console.log(
        `✅ LUKSO Mailbox - Domain: ${luksoDomain}, Message Count: ${luksoCount}`
      );

      // Test Sepolia mailbox
      const sepoliaMailbox = new ethers.Contract(
        CONFIG.SEPOLIA.mailbox,
        MAILBOX_ABI,
        this.sepoliaProvider
      );

      const [sepoliaDomain, sepoliaCount] = await Promise.all([
        sepoliaMailbox.localDomain(),
        sepoliaMailbox.nonce(),
      ]);

      console.log(
        `✅ Sepolia Mailbox - Domain: ${sepoliaDomain}, Message Count: ${sepoliaCount}`
      );
    } catch (error) {
      console.error("❌ Mailbox contract test failed:", error);
      throw error;
    }
  }

  // Test 3: Monitor message events
  async monitorMessages(
    durationMs: number = 30000,
    privateKey?: string
  ): Promise<void> {
    console.log(
      `\n👀 Monitoring cross-chain messages for ${durationMs / 1000} seconds...`
    );

    try {
      // Monitor LUKSO for outgoing messages
      const luksoMailbox = new ethers.Contract(
        CONFIG.LUKSO_TESTNET.mailbox,
        MAILBOX_ABI,
        this.luksoProvider
      );

      // Monitor Sepolia for incoming/outgoing messages
      const sepoliaMailbox = new ethers.Contract(
        CONFIG.SEPOLIA.mailbox,
        MAILBOX_ABI,
        this.sepoliaProvider
      );

      let messageCountDispatched = 0;
      let messageCountReceived = 0;

      // Listen for dispatch events
      luksoMailbox.on(
        "Dispatch",
        (sender, destination, recipient, message, event) => {
          messageCountDispatched++;
          console.log(
            `📤 Message ${messageCountDispatched} dispatched from LUKSO:`
          );
          console.log(`   Sender: ${sender}`);
          console.log(`   Destination: ${destination}`);
          console.log(`   Recipient: ${recipient}`);
          console.log(`   Block: ${event.log.blockNumber}`);
          console.log(`   Tx: ${event.log.transactionHash}`);
        }
      );

      sepoliaMailbox.on(
        "Dispatch",
        (sender, destination, recipient, message, event) => {
          messageCountDispatched++;
          console.log(
            `📤 Message ${messageCountDispatched} dispatched from Sepolia:`
          );
          console.log(`   Sender: ${sender}`);
          console.log(`   Destination: ${destination}`);
          console.log(`   Recipient: ${recipient}`);
          console.log(`   Block: ${event.log.blockNumber}`);
          console.log(`   Tx: ${event.log.transactionHash}`);
        }
      );

      sepoliaMailbox.on("Process", (messageId, event) => {
        console.log(`🚀 Message delivered on Sepolia:`);
        console.log(event);
        console.log(`   Message ID: ${messageId}`);
        console.log(`   Block: ${event.blockNumber}`);
        console.log(`   Tx: ${event.transactionHash}`);
      });

      await this.sendTestMessage(privateKey);

      // Wait for specified duration
      await new Promise((resolve) => setTimeout(resolve, durationMs));

      // Clean up listeners
      luksoMailbox.removeAllListeners();
      sepoliaMailbox.removeAllListeners();

      console.log(
        `\n📊 Monitoring complete. Observed ${messageCountDispatched} dispatched messages and ${messageCountReceived} received messages..`
      );
    } catch (error) {
      console.error("❌ Message monitoring failed:", error);
      throw error;
    }
  }

  // Test 4: Check recent message activity
  async checkRecentActivity(): Promise<void> {
    console.log("\n📈 Checking recent message activity...");
    const blockRange = 100000;

    const eventFilter = {
      topics: [ethers.id("Dispatch(address,uint32,bytes32,bytes)")],
    };

    try {
      const currentBlock = await this.luksoProvider.getBlockNumber();
      const fromBlock = Math.max(0, currentBlock - blockRange);

      const logs = await this.luksoProvider.getLogs({
        address: CONFIG.LUKSO_TESTNET.mailbox,
        ...eventFilter,
        fromBlock,
        toBlock: currentBlock,
      });

      console.log(
        `✅ Found ${logs.length} messages in last ${blockRange} blocks on LUKSO`
      );

      if (logs.length > 0) {
        const latestLog = logs[logs.length - 1];
        console.log(`   Latest message at block: ${latestLog.blockNumber}`);
        console.log(`   Transaction: ${latestLog.transactionHash}`);
      }

      // Check Sepolia too
      const sepoliaCurrentBlock = await this.sepoliaProvider.getBlockNumber();
      const sepoliaFromBlock = Math.max(0, sepoliaCurrentBlock - blockRange);

      const sepoliaLogs = await this.sepoliaProvider.getLogs({
        address: CONFIG.SEPOLIA.mailbox,
        ...eventFilter,
        fromBlock: sepoliaFromBlock,
        toBlock: sepoliaCurrentBlock,
      });

      console.log(
        `✅ Found ${sepoliaLogs.length} messages in last ${blockRange} blocks on Sepolia`
      );
    } catch (error) {
      console.error("❌ Recent activity check failed:", error);
      throw error;
    }
  }

  // Test 5: Send a test message (requires wallet with funds)
  async sendTestMessage(privateKey?: string): Promise<void> {
    if (!privateKey) {
      console.log("\n⚠️  Skipping test message send (no private key provided)");
      return;
    }

    console.log("\n📝 Sending test message...");

    try {
      const wallet = new ethers.Wallet(privateKey, this.luksoProvider);
      console.log("You wallet address is", wallet.address);
      const balance = await wallet.provider?.getBalance(wallet.address);

      if (!balance || balance < ethers.parseEther("0.001")) {
        console.log("❌ Insufficient balance for test message");
        return;
      }

      const mailbox = new ethers.Contract(
        CONFIG.LUKSO_TESTNET.mailbox,
        MAILBOX_ABI,
        wallet
      );

      const recipient = addressToBytes32(wallet.address); // Send to self
      const messageBody = ethers.toUtf8Bytes(
        `Test message from relayer test at ${new Date().toISOString()}`
      );

      console.log(
        `📤 Sending message to Sepolia (${CONFIG.SEPOLIA.chainId})...`
      );
      const mailboxConnected: any = mailbox.connect(wallet);

      const tx = await mailboxConnected.dispatch(
        CONFIG.SEPOLIA.chainId,
        recipient,
        messageBody
      );

      console.log(`✅ Message sent! Transaction: ${tx.hash}`);
      console.log(`   Waiting for confirmation...`);

      const receipt = await tx.wait();
      console.log(`✅ Confirmed in block: ${receipt?.blockNumber}`);
      console.log(`   ⏳ Your relayer should process this message shortly!`);
    } catch (error) {
      console.error("❌ Test message send failed:", error);
      throw error;
    }
  }

  // Run all tests
  async runAllTests(privateKey?: string): Promise<void> {
    console.log("🧪 Starting Hyperlane Relayer Test Suite...\n");

    try {
      await this.testConnectivity();
      await this.testMailboxContracts();
      await this.checkRecentActivity();

      // Send test message if private key provided
      // await this.sendTestMessage(privateKey);

      // Monitor for messages
      await this.monitorMessages(50000, privateKey); // 30 seconds

      console.log("\n🎉 All tests completed successfully!");
      console.log("✅ Your Hyperlane relayer appears to be working correctly.");
    } catch (error) {
      console.error("\n💥 Test suite failed:", error);
      process.exit(1);
    }
  }
}

// Usage example
async function main() {
  const tester = new HyperlaneRelayerTest();
  const privateKey = PRIVATE_KEY;

  if (privateKey) {
    console.log("🔑 Private key provided - will send test message");
  } else {
    console.log("ℹ️  No private key provided - skipping message send test");
    console.log(
      "   Set PRIVATE_KEY environment variable to test message sending"
    );
  }

  await tester.runAllTests(privateKey);
}

// Run if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}

export { HyperlaneRelayerTest, CONFIG };
