import bodyParser from "body-parser";
import express, { request } from "express";
import { v1 as uuid } from "uuid";
import fetch from "node-fetch";
import Blockchain from "../core/Blockchain";
import { MINER_REWARD_FROM_ADDRESS } from "../core/constants";
import { BlockData } from "../core/utils";

const bestBlockchain = Blockchain.getInstance();
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

app.post("/register-and-broadcast-node", (req, res) => {
  const newNodeUrl = req.body.newNodeUrl;
  if (!bestBlockchain.networkNodes.includes(newNodeUrl)) {
    bestBlockchain.networkNodes.push(newNodeUrl);
  }

  // This is not scalable but this is just a test, so not a problem.
  const promises = bestBlockchain.networkNodes.map((nodeUrl) => {
    return fetch(`${nodeUrl}/register-node`, {
      method: "post",
      body: JSON.stringify({ newNodeUrl }),
      headers: { "Content-Type": "application/json" },
    });
  });

  Promise.all(promises)
    .then((data) => {
      return fetch(`${newNodeUrl}/register-nodes-bulk`, {
        method: "post",
        body: JSON.stringify({ allNetworkNodes: [...bestBlockchain.networkNodes, bestBlockchain.currentNodeUrl] }),
        headers: { "Content-Type": "application/json" },
      });
    })
    .then(() => {
      res.json({
        message: `Node ${newNodeUrl} registered successfully`,
      });
    });
});

app.post("/register-node", (req, res) => {
  const newNodeUrl = req.body.newNodeUrl;
  if (!bestBlockchain.networkNodes.includes(newNodeUrl)) {
    bestBlockchain.networkNodes.push(newNodeUrl);
  }
  res.json({
    message: `Node '${newNodeUrl}' registered successfully.`,
  });
});

app.post("/register-nodes-bulk", (req, res) => {
  const allNetworkNodes: string[] = req.body.allNetworkNodes;

  allNetworkNodes.forEach((nodeUrl) => {
    if (!bestBlockchain.networkNodes.includes(nodeUrl) && nodeUrl !== bestBlockchain.currentNodeUrl) {
      bestBlockchain.networkNodes.push(nodeUrl);
    }
  });

  res.json({
    message: `Nodes registered successfully.`,
  });
});

export default app;
