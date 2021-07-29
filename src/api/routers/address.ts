import { Router } from "express";
import Blockchain from "../../core/Blockchain";

const router = Router();
const blockchain = Blockchain.getInstance();

router.get("/:address", (req, res) => {
  const address = req.params.address;
  const addressData = blockchain.getAddressData(address);

  res.json({
    addressData: addressData,
  });
});

export default router;
