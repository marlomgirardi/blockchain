import bodyParser from "body-parser";
import express from "express";

// Routers
import blockchainRouter from "./routers/blockchain";
import transactionRouter from "./routers/transaction";
import blockRouter from "./routers/block";
import nodeRouter from "./routers/node";
import addressRouter from "./routers/address";

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Not RESTful
app.use("/blockchain", blockchainRouter);
app.use("/transaction", transactionRouter);
app.use("/block", blockRouter);
app.use("/node", nodeRouter);
app.use("/address", addressRouter);

app.get("/explorer", (req, res) => {
  // TODO: Create a Front-end
  res.send("NOP!");
});

export default app;
