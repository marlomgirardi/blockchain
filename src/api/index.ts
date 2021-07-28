import bodyParser from "body-parser";
import express, { Request } from "express";
import { v1 as uuid } from "uuid";
import fetch from "node-fetch";
import Blockchain from "../core/Blockchain";
import { MINER_REWARD_FROM_ADDRESS } from "../core/constants";
import { BlockData } from "../core/utils";
import Transaction from "../core/Transaction";

const bestBlockchain = Blockchain.getInstance();
const nodeAddress = uuid().replace(/-/g, "");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/blockchain", (req, res) => {
  res.send(bestBlockchain);
});

app.post("/transaction", (req: Request<{}, any, Transaction>, res) => {
  const newTransaction = req.body;
  const blockIndex = bestBlockchain.addPendingTransaction(newTransaction);

  res.json({
    message: `Transaction added in block ${blockIndex}`,
    nextBlockIndex: blockIndex,
  });
});

app.post("/transaction/broadcast", function (req, res) {
  const newTransaction = bestBlockchain.createTransaction(req.body.amount, req.body.sender, req.body.recipient);
  bestBlockchain.addPendingTransaction(newTransaction);

  const promises = bestBlockchain.networkNodes.map((nodeUrl) => {
    return fetch(`${nodeUrl}/transaction`, {
      method: "POST",
      body: JSON.stringify(newTransaction),
      headers: {
        "Content-Type": "application/json",
      },
    });
  });

  Promise.all(promises).then(() => {
    res.json({ note: "Transaction created and broadcast successfully." });
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

  const newBlock = bestBlockchain.createBlock(nonce, previousBlockHash, hash);

  const promises = bestBlockchain.networkNodes.map((nodeUrl) => {
    return fetch(`${nodeUrl}/receive-new-block`, {
      method: "POST",
      body: JSON.stringify({
        block: newBlock,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
  });

  Promise.all(promises)
    .then(() => {
      return fetch(`${bestBlockchain.currentNodeUrl}/transaction/broadcast`, {
        method: "POST",
        body: JSON.stringify({
          amount: 12.5,
          from: MINER_REWARD_FROM_ADDRESS,
          to: nodeAddress,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
    })
    .then(() => {
      res.json({
        message: "Block mined.",
        block: newBlock,
      });
    });
});

app.post("/receive-new-block", (req, res) => {
  const newBlock = req.body.block;
  const lastBlock = bestBlockchain.getLastBlock();
  const correctHash = lastBlock.hash === newBlock.previousBlockHash;
  const correctIndex = lastBlock.index + 1 === newBlock.index;

  if (correctHash && correctIndex) {
    bestBlockchain.chain.push(newBlock);
    bestBlockchain.pendingTransactions = [];
    res.json({
      message: "Block received and accepted.",
      newBlock,
    });
  } else {
    res.status(400).json({
      message: "Block rejected",
      newBlock,
    });
  }
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
