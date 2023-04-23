const jws = require("jws");
const config = require("../util/config");
const userModel = require("../models/users.js");

module.exports = async (req, res, next) => {
  let token = req.headers["x-access-token"];
  if (!token) {
    return res.status(403).send({
      message: "No token provided!",
    });
  }
  try {
    if (!jws.verify(token, "HS256", config.secret)) {
      return res.status(401).send({
        message: "Unauthorized!",
      });
    }
  } catch (e) {
    return res.status(401).send({
      message: "Unauthorized!",
    });
  }

  req.tokenDecoded = jws.decode(token).payload;
  const user = await userModel.findOne({ where: { username: req.tokenDecoded } });
  if (!user) {
    return res.status(401).send({
      message: "Unauthorized!",
    });
  }
  next();
};
