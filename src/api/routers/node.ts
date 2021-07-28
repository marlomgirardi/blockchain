import { Router } from "express";
import Blockchain from "../../core/Blockchain";
import { broadcastToNodes, post } from "../utils";

const router = Router();
const blockchain = Blockchain.getInstance();

router.post("/", (req, res) => {
  const nodeUrl = req.body.nodeUrl;
  if (!blockchain.networkNodes.includes(nodeUrl)) {
    blockchain.networkNodes.push(nodeUrl);
  }
  res.json({
    message: `Node '${nodeUrl}' registered successfully.`,
  });
});

router.post("/add-to-network", (req, res) => {
  const nodeUrl = req.body.nodeUrl;
  if (!blockchain.networkNodes.includes(nodeUrl)) {
    blockchain.networkNodes.push(nodeUrl);
  }

  broadcastToNodes(blockchain.networkNodes, "node", { nodeUrl })
    .then(() => post(`${nodeUrl}/node/update-list`, [...blockchain.networkNodes, blockchain.currentNodeUrl]))
    .then(() => {
      res.json({
        message: `Node ${nodeUrl} registered successfully`,
      });
    });
});

router.post("/update-list", (req, res) => {
  const networkNodes: string[] = req.body;

  networkNodes.forEach((nodeUrl) => {
    if (!blockchain.networkNodes.includes(nodeUrl) && nodeUrl !== blockchain.currentNodeUrl) {
      blockchain.networkNodes.push(nodeUrl);
    }
  });

  res.json({
    message: `Nodes registered successfully.`,
  });
});

export default router;
