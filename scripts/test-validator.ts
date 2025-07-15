// npx ts-node test-validator.ts

import { ethers } from "ethers";
import mailbox from "../abi/mailbox.json";
import merkleTree from "../abi/merkle-tree.json";
import { CONFIG, PRIVATE_KEY } from "./constants";

const RPC_ENDPOINT = "https://rpc.testnet.lukso.network/";

const provider = new ethers.JsonRpcProvider(RPC_ENDPOINT);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
console.log(`✍️ Signer is ${wallet.address}`);

const MAILBOX_ABI = mailbox.abi;
const MERKLE_TREE_ABI = merkleTree.abi;

function addressToBytes32(address: string) {
  if (address.startsWith("0x")) {
    address = address.slice(2);
  }

  while (address.length < 64) {
    address = `0${address}`;
  }

  return `0x${address}`;
}

async function main() {
  const mailboxContract = new ethers.Contract(
    CONFIG.LUKSO_TESTNET.mailbox,
    MAILBOX_ABI,
    wallet
  );

  const merkleTreeHookContract = new ethers.Contract(
    CONFIG.LUKSO_TESTNET.merkleTreeHook,
    MERKLE_TREE_ABI,
    wallet
  );

  let hookMb = await merkleTreeHookContract.mailbox();
  console.log(`Hook Mailbox is ${hookMb}`);

  const recipient = addressToBytes32(wallet.address);
  console.log("recipient", recipient);
  const messageBody = ethers.toUtf8Bytes("Hello World");
  const destinationChainId = 11155111; //Sepolia

  const mailboxConnected: any = mailboxContract.connect(wallet);

  await mailboxConnected.dispatch(destinationChainId, recipient, messageBody);

  console.log("✅ Sent message");
}

main();
