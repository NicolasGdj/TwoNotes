const status = require("http-status");
const userModel = require("../models/users.js");
const has = require("has-keys");
const config = require("../util/config.js");
const jws = require("jws");

const CodeError = require("../util/CodeError.js");
const argon2 = require("argon2");
const axios = require("axios").default;

const { INSTANCE } = process.env;

module.exports = {
  async login(req, res) {
    // #swagger.tags = ['Users']
    // #swagger.summary = 'Login'
    // #swagger.parameters['obj'] = { in: 'body', description:'Name', schema: { $username: 'JohnDoe123', $password: 'UnsafePassword', $captcha: 'CAPTCHA'}}
    if (!has(req.body, ["username", "password"]))
      throw new CodeError("You must specify a valid username and password ", status.BAD_REQUEST);

    const { username, password } = req.body;
    //CAPTCHA
    if (INSTANCE === "prod") {
      if (!has(req.body, ["captcha"]))
        throw new CodeError("You must specify a valid captcha answer (1)", status.BAD_REQUEST);

      const { captcha } = req.body;
      try {
        let res = await axios.post(
          "https://www.google.com/recaptcha/api/siteverify?secret=6Ldw4tofAAAAAGbGSrjzNc1912_kUQWmGabNlfka&response=" +
            captcha
        );
        console.log(res.data);
        if (res.data.success !== true) {
          throw new CodeError("You must specify a valid captcha answer (3)", status.BAD_REQUEST);
        }
      } catch (e) {
        console.log(e);
        throw new CodeError("You must specify a valid captcha answer (2)", status.BAD_REQUEST);
      }
    }

    const user = await userModel.findOne({ where: { username: username } });
    if (user) {
      try {
        if (await argon2.verify(user.password, password)) {
          const signature = jws.sign({
            header: { alg: "HS256" },
            payload: username,
            secret: config.secret,
          });
          res.status(200).json({ token: signature });
          return;
        }
      } catch (e) {
        res.status(500).json({});
        return;
      }
    }
    res.status(status.FORBIDDEN).json({ status: false, message: "Wrong username or password" });
  },

  async register(req, res) {
    // #swagger.tags = ['Users']
    // #swagger.summary = 'Register'
    // #swagger.parameters['obj'] = { in: 'body', description:'Name', schema: { $username: 'JohnDoe123', $password: 'UnsafePassword'}}
    if (!has(req.body, ["username", "password"]))
      throw new CodeError("You must specify an valid username and password ", status.BAD_REQUEST);

    const { username, password } = req.body;
    try {
      const hash = await argon2.hash(password);
      await userModel.create({ username: username, password: hash });
      res.status(201).json({ status: true, message: "User Added" });
    } catch (e) {
      res.status(304).json({ status: false, message: "User already exist" });
    }
  },
};
