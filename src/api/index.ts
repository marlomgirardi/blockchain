import bodyParser from "body-parser";
import express from "express";

// Routers
import blockchainRouter from "./routers/blockchain";
import transactionRouter from "./routers/transaction";
import blockRouter from "./routers/block";
import nodeRouter from "./routers/node";

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Not RESTful
app.use("/blockchain", blockchainRouter);
app.use("/transaction", transactionRouter);
app.use("/block", blockRouter);
app.use("/node", nodeRouter);

export default app;
