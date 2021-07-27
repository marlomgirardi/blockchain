import bodyParser from "body-parser";
import express from "express";
import { v1 as uuid } from "uuid";
import Blockchain from "../core/Blockchain";
import { MINER_REWARD_FROM_ADDRESS } from "../core/constants";
import { BlockData } from "../core/utils";

const bestBlockchain = new Blockchain();
const nodeAddress = uuid().replace(/-/g, "");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/blockchain", (req, res) => {
  res.send(bestBlockchain);
});

app.post("/transaction", (req, res) => {
  const blockIndex = bestBlockchain.createTransaction(req.body.from, req.body.to, req.body.amount);
  res.json({
    message: "Transaction registered for the next block.",
    nextBlockIndex: blockIndex,
  });
});

app.get("/mine", (req, res) => {
  const { hash: previousBlockHash, index: previousBlockIndex } = bestBlockchain.getLastBlock();
  const currentBlockData: BlockData = {
    transactions: bestBlockchain.pendingTransactions,
    index: previousBlockIndex + 1,
  };

  const nonce = bestBlockchain.proofOfWork(previousBlockHash, currentBlockData);
  const hash = bestBlockchain.hashBlock(previousBlockHash, currentBlockData, nonce);

  bestBlockchain.createTransaction(MINER_REWARD_FROM_ADDRESS, nodeAddress, 12.5);

  const newBlock = bestBlockchain.createBlock(nonce, previousBlockHash, hash);

  res.json({
    message: "Block mined.",
    block: newBlock,
  });
});

export default app;
