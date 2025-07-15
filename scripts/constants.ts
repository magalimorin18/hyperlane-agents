import { ethers } from "ethers";
import mailbox from "../abi/mailbox.json";
import dotenv from "dotenv";
dotenv.config();

export const MAILBOX_ABI = mailbox.abi;

export const CONFIG = {
  LUKSO_TESTNET: {
    rpc: "https://rpc.testnet.lukso.network",
    chainId: 4201,
    mailbox: "0x8312d74f7ab4100937158B772280278e79237A8A",
    name: "luksotestnet",
    merkleTreeHook: "0x6a78d1e52292664a92C62398D1Be59967dA4f9c8",
    provider: new ethers.JsonRpcProvider("https://rpc.testnet.lukso.network"),
  },
  SEPOLIA: {
    rpc: "https://sepolia.gateway.tenderly.co/public",
    chainId: 11155111,
    mailbox: "0xfFAEF09B3cd11D9b20d1a19bECca54EEC2884766",
    name: "sepolia",
    provider: new ethers.JsonRpcProvider(
      "https://sepolia.gateway.tenderly.co/public"
    ),
  },
};

export const luksoProvider = new ethers.JsonRpcProvider(
  CONFIG.LUKSO_TESTNET.rpc
);

export const sepoliaProvider = new ethers.JsonRpcProvider(CONFIG.SEPOLIA.rpc);

export const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
