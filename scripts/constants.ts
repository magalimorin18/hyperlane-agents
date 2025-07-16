import { ethers } from "ethers";
import mailbox from "../abi/mailbox.json";
import hypnativepausable from "../abi/HypNativePausable.json";
import ism from "../abi/ism.json";
import dotenv from "dotenv";
dotenv.config();

export const MAILBOX_ABI = mailbox.abi;
export const HYP_NATIVE_PAUSABLE_ABI = hypnativepausable.abi;
export const ISM_ABI = ism;

export const CONFIG = {
  LUKSO_TESTNET: {
    rpc: "https://rpc.testnet.lukso.network",
    chainId: 4201,
    mailbox: "0x8312d74f7ab4100937158B772280278e79237A8A",
    name: "luksotestnet",
    merkleTreeHook: "0x6a78d1e52292664a92C62398D1Be59967dA4f9c8",
    provider: new ethers.JsonRpcProvider("https://rpc.testnet.lukso.network"),
    tokenRouter: "0x570c87Be0FffB4411ee17451B67245644258A2D8",
    ismAddress: "0xdFbc007B64D60B3B28fc0313F64a2373F092CD8f",
  },
  SEPOLIA: {
    rpc: "https://sepolia.gateway.tenderly.co/public",
    chainId: 11155111,
    mailbox: "0xfFAEF09B3cd11D9b20d1a19bECca54EEC2884766",
    name: "sepolia",
    provider: new ethers.JsonRpcProvider(
      "https://sepolia.gateway.tenderly.co/public"
    ),
    tokenRouter: "0x49262BaD56324003f01043e24DE36Cf804aA36c1",
    ismAddress: "0x4998C54633C45AC907F3465d8579ACB80E27AF1A",
  },
};

export const luksoProvider = new ethers.JsonRpcProvider(
  CONFIG.LUKSO_TESTNET.rpc
);

export const sepoliaProvider = new ethers.JsonRpcProvider(CONFIG.SEPOLIA.rpc);

export const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
