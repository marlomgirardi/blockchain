import Transaction from "./Transaction";
import { Nonce, Hash } from "./utils";

interface Block {
  index: number;
  timestamp: number;
  transactions: Transaction[];
  nonce: Nonce;
  hash: Hash;
  previousBlockHash: Hash;
}

export default Block;
