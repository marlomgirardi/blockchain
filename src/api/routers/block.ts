import { Request, Router } from "express";
import Block from "../../core/Block";
import Blockchain from "../../core/Blockchain";
import { MINER_REWARD_FROM_ADDRESS } from "../../core/constants";
import { BlockData, generateUUID } from "../../core/utils";
import { broadcastToNodes, post } from "../utils";

const router = Router();
const blockchain = Blockchain.getInstance();
const nodeAddress = generateUUID();

router.get("/:hash", function (req, res) {
  const hash = req.params.hash;
  const block = blockchain.getBlock(hash);
  res.json({ block });
});

router.post("/mine", (req, res) => {
  const { hash: previousBlockHash, index: previousBlockIndex } = blockchain.getLastBlock();
  const currentBlockData: BlockData = {
    transactions: blockchain.pendingTransactions,
    index: previousBlockIndex + 1,
  };

  const nonce = blockchain.proofOfWork(previousBlockHash, currentBlockData);
  const hash = blockchain.hashBlock(previousBlockHash, currentBlockData, nonce);
  const newBlock = blockchain.createBlock(nonce, previousBlockHash, hash);

  broadcastToNodes<Block>(blockchain.networkNodes, "block/receive", newBlock)
    .then(() => {
      return post(`${blockchain.currentNodeUrl}/transaction/broadcast`, {
        amount: 12.5,
        from: MINER_REWARD_FROM_ADDRESS,
        to: nodeAddress,
      });
    })
    .then(() => {
      res.json({
        message: "Block mined.",
        block: newBlock,
      });
    });
});

router.post("/receive", (req: Request<{}, any, Block>, res) => {
  const block = req.body;
  const lastBlock = blockchain.getLastBlock();
  const correctHash = lastBlock.hash === block.previousBlockHash;
  const correctIndex = lastBlock.index + 1 === block.index;

  if (correctHash && correctIndex) {
    blockchain.chain.push(block);
    blockchain.pendingTransactions = [];
    res.json({
      message: "Block received and accepted.",
      block,
    });
  } else {
    res.status(400).json({
      message: "Block rejected",
      block,
    });
  }
});

export default router;
