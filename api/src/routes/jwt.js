const express = require("express");
const router = express.Router();
const jwt = require("../controllers/jwt.js");

const jwtCheck = require("../middlewares/token");

router.get("/api/whoami", [jwtCheck], jwt.whoami);

module.exports = router;
