import SHA from "sha.js";
import { Nonce, Hash } from "./utils";
import Block from "./Block";
import Transaction from "./Transaction";

class Blockchain {
  chain: Block[] = [];
  pendingTransactions: Transaction[] = [];

  constructor() {
    // Create genesis block
    // https://tecracoin.medium.com/what-is-genesis-block-and-why-genesis-block-is-needed-1b37d4b75e43
    this.createBlock(100, "0", "0");
  }

  createBlock(nonce: Nonce, previousBlockHash: Hash, hash: Hash): Block {
    const newBlock: Block = {
      index: this.chain.length + 1,
      timestamp: Date.now(),
      transactions: this.pendingTransactions,
      nonce,
      hash,
      previousBlockHash,
    };

    this.pendingTransactions = [];
    this.chain.push(newBlock);

    return newBlock;
  }

  getLastBlock(): Block {
    return this.chain[this.chain.length - 1];
  }

  createTransaction(amount: Transaction["amount"], sender: Transaction["sender"], recipient: Transaction["recipient"]) {
    const newTransaction: Transaction = {
      amount,
      sender,
      recipient,
    };

    this.pendingTransactions.push(newTransaction);

    return this.getLastBlock()["index"] + 1;
  }

  hashBlock(previousBlockHash: Hash, currentBlockData: Block["transactions"], nonce: Nonce) {
    const Sha256 = SHA("sha256");
    const dataAsString = previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData);
    return Sha256.update(dataAsString).digest("hex");
  }
}

export default Blockchain;
