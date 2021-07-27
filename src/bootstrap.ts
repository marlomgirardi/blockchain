import node from "./api";

const port = process.argv[2] || 3000;
const nodeUrl = process.argv[3] || "http://localhost:3000";

node.listen(port, () => {
  // blockchain bootstrap
  console.log(`Node running on port ${port}!`);
});
