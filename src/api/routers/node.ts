import { Router } from "express";
import Blockchain from "../../core/Blockchain";
import { isNodeInNetwork } from "../../core/utils";
import { broadcastToNodes, post } from "../utils";

const router = Router();
const blockchain = Blockchain.getInstance();

router.post("/", (req, res) => {
  const nodeUrl = req.body.nodeUrl;

  if (!isNodeInNetwork(blockchain, nodeUrl)) {
    blockchain.networkNodes.push(nodeUrl);
  }

  res.json({ message: "Node registered successfully." });
});

router.post("/add-to-network", (req, res) => {
  const nodeUrl = req.body.nodeUrl;

  if (!isNodeInNetwork(blockchain, nodeUrl)) {
    blockchain.networkNodes.push(nodeUrl);
  }

  broadcastToNodes(blockchain.networkNodes, "node", { nodeUrl })
    .then(() => post(`${nodeUrl}/node/update-list`, [...blockchain.networkNodes, blockchain.currentNodeUrl]))
    .then(() => {
      res.json({ message: "Node registered successfully in the network." });
    });
});

router.post("/update-list", (req, res) => {
  const networkNodes: string[] = req.body;

  networkNodes.forEach((nodeUrl) => {
    if (!isNodeInNetwork(blockchain, nodeUrl)) {
      blockchain.networkNodes.push(nodeUrl);
    }
  });

  res.json({ message: "Nodes registered successfully." });
});

export default router;
