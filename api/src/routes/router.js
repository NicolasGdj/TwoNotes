const router = require("express").Router();

router.use(require("./user"));
router.use(require("./note"));
router.use(require("./jwt"));
module.exports = router;
