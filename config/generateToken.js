const jwt = require("jsonwebtoken");
const { SECRETTOKEN } = require("./constants");

const generateToken = (id) => {
  return jwt.sign({ id }, SECRETTOKEN, {
    expiresIn: "24h",
  });
};

module.exports = generateToken;
