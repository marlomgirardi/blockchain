import nodeApi from "./api";
import Blockchain from "./core/Blockchain";

const port = process.argv[2] || 3000;
const nodeUrl = process.argv[3];

nodeApi.listen(port, () => {
  Blockchain.bootstrap(nodeUrl);

  // blockchain bootstrap
  console.log(`Node running on port ${port}!`);
});
