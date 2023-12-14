const express = require("express");
const app = express();
const connectDB = require("./config/db");
const router = require("./routers/index");
const errorHandler = require("./errorHandler/index");
// const passport = require("./social/passport");
const { PORT } = require("./config/constants");
// const cookieParser = require("cookie-parser");
const cors = require("cors");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const path = require('path');
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

// Initialize Passport
// app.use(passport.initialize());
// app.use(passport.session());

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(cookieParser());
app.use(express.json());

app.use(router);

connectDB();

app.use('/images', express.static(path.join(__dirname, 'storage', 'images')));

// Serve PDFs from the "storage/pdfs/" directory
app.use('/pdfs', express.static(path.join(__dirname, 'storage', 'pdfs')));
app.use(errorHandler);

app.listen(port, () => {
  console.log("this app is running on " + port);
});
