import { Router } from "express";
import Blockchain from "../../core/Blockchain";

const router = Router();
const blockchain = Blockchain.getInstance();

router.get("/", (req, res) => res.json(blockchain));

export default router;
