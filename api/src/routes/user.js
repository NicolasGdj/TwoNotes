const express = require("express");
const router = express.Router();
const user = require("../controllers/user.js");

router.post("/api/users/register", user.register);
router.post("/api/users/login", user.login);

module.exports = router;
