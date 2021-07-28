import { v1 as uuid } from "uuid";
import Block from "./Block";
import Blockchain from "./Blockchain";

export type Nonce = number;
export type Hash = string;
export type BlockData = Pick<Block, "transactions" | "index">;

export function isNodeInNetwork(blockchain: Blockchain, nodeUrl: string) {
  return nodeUrl !== blockchain.currentNodeUrl || blockchain.networkNodes.includes(nodeUrl);
}

export function generateUUID() {
  return uuid().replace(/-/g, "");
}
