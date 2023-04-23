const express = require("express");
const router = express.Router();
const note = require("../controllers/note.js");
const jwtCheck = require("../middlewares/token");

router.post("/api/notes/", [jwtCheck], note.create);
router.get("/api/notes/", [jwtCheck], note.list);
router.get("/api/notes/shared", [jwtCheck], note.listShared);

router.delete("/api/notes/:id", [jwtCheck], note.delete);
router.post("/api/notes/:id/collaborators", [jwtCheck], note.addCollaborator);
router.patch("/api/notes/:id/collaborators", [jwtCheck], note.updateCollaborator);
router.delete("/api/notes/:id/collaborators", [jwtCheck], note.deleteCollaborator);
router.get("/api/notes/:id/collaborators", [jwtCheck], note.listCollaborators);

module.exports = router;
