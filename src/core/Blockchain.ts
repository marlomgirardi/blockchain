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

  getBlock(hash: Hash): Block | null {
    return this.chain.find((block) => block.hash === hash) ?? null;
  }

  createTransaction(from: Transaction["from"], to: Transaction["to"], amount: Transaction["amount"]): Transaction {
    const newTransaction: Transaction = { from, to, amount, id: generateUUID() };

    return newTransaction;
  }

  addPendingTransaction(transaction: Transaction) {
    this.pendingTransactions.push(transaction);
    return this.getLastBlock()["index"] + 1;
  }

  getTransaction(id: string): { transaction: Transaction; block: Block } | null {
    for (const block of this.chain) {
      const transaction = block.transactions.find((transaction) => transaction.id === id);
      if (transaction) {
        return {
          transaction,
          block,
        };
      }
    }

    return null;
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

  isChainValid = (blocks: Block[]): boolean => {
    const genesisBlock = blocks[0];
    const correctNonce = genesisBlock.nonce === 100;
    const correctPreviousHash = genesisBlock.previousBlockHash === "0";
    const correctHash = genesisBlock.hash === "0";
    const correctTransactions = genesisBlock.transactions.length === 0;
    const isCorrectGenesisBlock = correctNonce && correctPreviousHash && correctHash && correctTransactions;

    if (!isCorrectGenesisBlock) {
      return false;
    }

    for (let i = 1; i < blocks.length; i++) {
      const block = blocks[i];
      const previousBlock = blocks[i - 1];
      const blockHash = this.hashBlock(
        previousBlock.hash,
        { transactions: block.transactions, index: block.index },
        block.nonce
      );

      if (blockHash.substr(0, 4) !== "0000" || block.previousBlockHash !== previousBlock.hash) {
        return false;
      }
    }

    return true;
  };

  getAddressData(address: string): { transactions: Transaction[]; balance: number } {
    const transactions: Transaction[] = [];
    let balance = 0;

    this.chain.forEach((block) => {
      block.transactions.forEach((transaction) => {
        const isFrom = transaction.from === address;
        const isTo = transaction.to === address;
        if (isFrom || isTo) {
          transactions.push(transaction);

          if (isTo) balance += transaction.amount;
          if (isFrom) balance -= transaction.amount;
        }
      });
    });

    return { transactions, balance };
  }
}

export default Blockchain;
