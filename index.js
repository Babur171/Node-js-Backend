const express = require("express");
const app = express();
const dataBase = require("./database/index");
const router = require("./routers/index");
const errorHandler = require("./errorHandler/index");
const passport = require("./social/passport");
const { PORT } = require("./config/index");
const session = require("express-session");
// const cookieParser = require("cookie-parser");
const cors = require("cors");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const port = PORT || 3000;

//dsadsad

app.use(cors());
app.use(morgan("tiny"));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(cookieParser());
app.use(express.json());

app.use(router);

dataBase();
app.use(
  session({
    cookie: {
      secure: true,
      maxAge: 60000,
    },
    store: new RedisStore(),
    secret: "SDSDASDASDSAKDLKJLASLKDJLASDJLASJD",
    saveUninitialized: true,
    resave: false,
  })
);

app.use(function (req, res, next) {
  if (!req.session) {
    return next(new Error("Oh no")); //handle error
  }
  next(); //otherwise continue
});

app.use("/storage", express.static("storage"));
app.use(errorHandler);

app.listen(port, () => {
  console.log("this app is running on " + port);
});
