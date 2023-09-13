const User = require("../modal/User");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const { SECRETTOKEN } = require("../config/constants");

const auth = asyncHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Token")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, SECRETTOKEN);

      req.user = await User.findOne({ _id: decoded.id });

      next();
    } catch (err) {
      const error = {
        status: 401,
        message: "UnAuthorized",
      };
      return next(error);
    }
  }

  if (!token) {
    const error = {
      status: 401,
      message: "UnAuthorized",
    };
    return next(error);
  }
});

module.exports = auth;
