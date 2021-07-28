import { Router } from "express";
import Block from "../../core/Block";
import Blockchain from "../../core/Blockchain";
import Transaction from "../../core/Transaction";
import { broadcastToNodes, getFromNodes } from "../utils";

const router = Router();
const blockchain = Blockchain.getInstance();

router.get("/", (req, res) => res.json(blockchain));

// Longest Chain rule
// https://medium.com/tendermint/a-to-z-of-blockchain-consensus-81e2406af5a3
// https://confluxnetwork.medium.com/advantages-and-disadvantages-of-the-longest-chain-rule-bc27225a2728
// https://courses.grainger.illinois.edu/ece598pv/sp2021/lectureslides2021/ECE_598_PV_course_notes3.pdf
router.get("/consensus", (req, res) => {
  getFromNodes<Blockchain>(blockchain.networkNodes, "blockchain").then((blockchainList) => {
    const chainLength = blockchain.chain.length;
    let maxChainLength = chainLength;
    let longestChain: Block[] | undefined;
    let pendingTransactions: Transaction[] = [];

    for (const blockchain of blockchainList) {
      if (blockchain.chain.length > maxChainLength) {
        maxChainLength = blockchain.chain.length;
        longestChain = blockchain.chain;
        pendingTransactions = blockchain.pendingTransactions;
      }
    }

    const shouldUpdateChain = longestChain && blockchain.isChainValid(longestChain);
    if (shouldUpdateChain) {
      blockchain.chain = longestChain as Block[];
      blockchain.pendingTransactions = pendingTransactions;

      res.json({
        message: "Chain is updated",
      });
    } else {
      res.json({
        message: "Chain is already synced",
      });
    }
  });
});

export default router;
