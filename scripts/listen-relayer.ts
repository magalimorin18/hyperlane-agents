// npx ts-node scripts/listen-relayer.ts

import { ethers } from "ethers";
import {
  CONFIG,
  luksoProvider,
  MAILBOX_ABI,
  sepoliaProvider,
} from "./constants";

async function main(durationMs: number = 30000): Promise<void> {
  console.log(
    `\n👀 Monitoring cross-chain messages for ${durationMs / 1000} seconds...`
  );

  try {
    // Monitor LUKSO for outgoing messages
    const luksoMailbox = new ethers.Contract(
      CONFIG.LUKSO_TESTNET.mailbox,
      MAILBOX_ABI,
      luksoProvider
    );

    // Monitor Sepolia for incoming/outgoing messages
    const sepoliaMailbox = new ethers.Contract(
      CONFIG.SEPOLIA.mailbox,
      MAILBOX_ABI,
      sepoliaProvider
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

main(120000);
