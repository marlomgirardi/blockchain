import { Request, Router } from "express";
import Blockchain from "../../core/Blockchain";
import Transaction from "../../core/Transaction";
import { broadcastToNodes } from "../utils";

const router = Router();
const blockchain = Blockchain.getInstance();

router.get("/transaction/:id", function (req, res) {
  const id = req.params.id;
  const transaction = blockchain.getTransaction(id);

  res.json(transaction);
});

router.post("/", (req: Request<{}, any, Transaction>, res) => {
  const transaction = req.body;
  const blockIndex = blockchain.addPendingTransaction(transaction);

  res.json({
    message: `Transaction added in block ${blockIndex}`,
    nextBlockIndex: blockIndex,
  });
});

router.post("/broadcast", function (req, res) {
  const transaction = blockchain.createTransaction(req.body.amount, req.body.sender, req.body.recipient);
  blockchain.addPendingTransaction(transaction);

  broadcastToNodes<Transaction>(blockchain.networkNodes, "transaction", transaction).then(() => {
    res.json({ note: "Transaction created and broadcast successfully." });
  });
});

export default router;
