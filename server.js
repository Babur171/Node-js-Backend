const express = require("express");
const app = express();
const dataBase = require("./database/index");
const { PORT } = require("./config/index");
const router = require("./routers/index");
const errorHandler = require("./errorHandler/index");
// const cookieParser = require("cookie-parser");
const cors = require("cors");
const bodyParser = require("body-parser");
const port = PORT;

app.use(cors());
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(cookieParser());
app.use(express.json());

app.use(router);

dataBase();

app.use("/storage", express.static("storage"));
app.use(errorHandler);
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
