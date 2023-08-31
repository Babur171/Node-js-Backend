const http = require("http");
const app = require("./app");
const { PORT } = require("./config/index");

const port = PORT || 3000;

const server = http.createServer(app);
server.listen(port, () => {
  console.log("this app is running on " + port);
});
