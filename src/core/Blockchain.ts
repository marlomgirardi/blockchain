import SHA from "sha.js";
import { Nonce, Hash, BlockData, generateUUID } from "./utils";
import Block from "./Block";
import Transaction from "./Transaction";

let blockchain: Blockchain;

class Blockchain {
  chain: Block[] = [];
  pendingTransactions: Transaction[] = [];
  networkNodes: string[] = [];
  currentNodeUrl: string = "";

  private constructor() {
    // Create genesis block
    // https://tecracoin.medium.com/what-is-genesis-block-and-why-genesis-block-is-needed-1b37d4b75e43
    this.createBlock(100, "0", "0");
  }

  static getInstance() {
    blockchain = blockchain ?? new Blockchain();
    return blockchain;
  }

  static bootstrap(nodeUrl: string) {
    if (!nodeUrl) {
      throw new Error("Node URL not provided.");
    }

    const instance = Blockchain.getInstance();
    instance.currentNodeUrl = nodeUrl;
  }

  // TODO: Extract block to its own class
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

  getLastBlock = (): Block => this.chain[this.chain.length - 1];

  createTransaction(from: Transaction["from"], to: Transaction["to"], amount: Transaction["amount"]): Transaction {
    const newTransaction: Transaction = { from, to, amount, id: generateUUID() };

    return newTransaction;
  }

  addPendingTransaction(transaction: Transaction) {
    this.pendingTransactions.push(transaction);
    return this.getLastBlock()["index"] + 1;
  }

  hashBlock(previousBlockHash: Hash, currentBlockData: BlockData, nonce: Nonce) {
    const Sha256 = SHA("sha256");
    const dataAsString = previousBlockHash + nonce.toString() + JSON.stringify(currentBlockData);
    return Sha256.update(dataAsString).digest("hex");
  }

  /**
   * @external https://en.bitcoin.it/wiki/Proof_of_work
   */
  proofOfWork(previousBlockHash: Hash, currentBlockData: BlockData) {
    let nonce = -1;
    let hash;

    do {
      nonce += 1;
      hash = this.hashBlock(previousBlockHash, currentBlockData, nonce);
    } while (!hash.startsWith("0000"));

    return nonce;
  }
}

export default Blockchain;
