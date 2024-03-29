const express = require("express");
const app = express();
const connectDB = require("./config/db");
const router = require("./routers/index");

const errorHandler = require("./errorHandler/index");
const { PORT } = require("./config/constants");

const cors = require("cors");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const port = PORT || 3000;

//dsadsad

app.use(cors());
app.use(morgan("tiny"));
app.use(
  require("express-session")({
    secret: "SDSDASDASDSAKDLKJLASLKDJLASDJLASJDL",
    resave: true,
    saveUninitialized: true,
  })
);
app.use('/uploads', express.static('uploads')); 

app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(cookieParser());
app.use(express.json());

app.use(router);

connectDB();


app.use(errorHandler);

app.listen(port, () => {
  console.log("this app is running on " + port);
});
