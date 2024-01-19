const User = require("../modal/User");
const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const { SECRETTOKEN } = require("../config/constants");
const {responseData} = require("../utiles/index")

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
      const response = responseData({
        success: false,
        message:"UnAuthorized",
        status: 401,
      });
      return res.status(401).json(response);
    }
  }

  if (!token) {
    const response = responseData({
      success: false,
      message:"UnAuthorized",
      status: 401,
    });
    return res.status(401).json(response);
  }
});

module.exports = auth;
