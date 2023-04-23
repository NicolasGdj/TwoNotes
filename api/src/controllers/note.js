const status = require("http-status");
const userModel = require("../models/users.js");
const noteModel = require("../models/notes.js");
const collaboratorsModel = require("../models/collaborators.js");
const has = require("has-keys");

const CodeError = require("../util/CodeError.js");

async function getUser(username) {
  const user = await userModel.findOne({ where: { username: username } });
  if (user) {
    return user;
  } else {
    throw new CodeError("Unable to connect to database", status.INTERNAL_SERVER_ERROR);
  }
}

module.exports = {
  async create(req, res) {
    // #swagger.tags = ['Notes']
    // #swagger.summary = 'Create a new personal note'
    // #swagger.parameters['obj'] = { in: 'body', description:'Create a new personnal note', schema: { $title: 'My Note #1'}}
    /* #swagger.security = [{
        "apiKeyAuth": []
    }]
    */
    if (!has(req.body, ["title"]))
      throw new CodeError("You must specify an valid title ", status.BAD_REQUEST);
    const { title } = req.body;
    try {
      const user = await getUser(req.tokenDecoded);
      const response = await user.createNote({ title: title });
      res.status(201).json({ id: response.id, title: response.title });
    } catch (e) {
      res.status(500).json({ status: false, message: e.message });
      return;
    }
  },

  async delete(req, res) {
    // #swagger.tags = ['Notes']
    // #swagger.summary = 'Delete a personal note'
    /* #swagger.security = [{
        "apiKeyAuth": []
    }]
    */
    if (!has(req.params, ["id"]))
      throw new CodeError("You must specify an valid note id ", status.BAD_REQUEST);
    const id = parseInt(req.params.id);
    try {
      const user = await getUser(req.tokenDecoded);

      if (!(await user.hasNote(id))) {
        res.status(404).json({ status: false, message: "Note not found" });
        return;
      }
      noteModel.destroy({ where: { id: id } });
      res.status(200).json({});
    } catch (e) {
      res.status(500).json({ status: false, message: e.message });
      return;
    }
  },

  async list(req, res) {
    // #swagger.tags = ['Notes']
    // #swagger.summary = 'List all notes owned by the current user'
    /* #swagger.security = [{
        "apiKeyAuth": []
    }]
    */
    try {
      const user = await getUser(req.tokenDecoded);
      let notes = [];

      for (let note of await user.getNotes()) {
        notes.push({
          id: note.id,
          title: note.title,
          updatedAt: note.updatedAt,
        });
      }
      res.status(200).json({ notes: notes });
    } catch (e) {
      res.status(500).json({ status: false, message: e.message });
      return;
    }
  },

  async listShared(req, res) {
    // #swagger.tags = ['Notes']
    // #swagger.summary = 'List all notes shared to the current user'
    /* #swagger.security = [{
        "apiKeyAuth": []
    }] 
    */

    try {
      const user = await getUser(req.tokenDecoded);
      let notes = [];
      for (let note of await user.getSharedNotes()) {
        notes.push({
          id: note.id,
          title: note.title,
          owner: (await note.getOwner()).username,
          writable: note.collaborators.write,
          updatedAt: note.updatedAt,
        });
      }
      res.status(200).json({ notes: notes });
    } catch (e) {
      res.status(500).json({ status: false, message: e.message });
      return;
    }
  },

  async addCollaborator(req, res) {
    // #swagger.tags = ['Notes']
    // #swagger.summary = 'Add a collaborator to a note'
    // #swagger.parameters['obj'] = { in: 'body', description:'Add a collaborator to a note', schema: { $username: 'JohnDoe123', $writable: true}}
    /* #swagger.security = [{
        "apiKeyAuth": []
    }]
    */
    if (!has(req.params, ["id"]))
      throw new CodeError("You must specify a valid note id ", status.BAD_REQUEST);
    const id = parseInt(req.params.id);
    if (!has(req.body, ["username"]))
      throw new CodeError("You must specify a valid username for the target", status.BAD_REQUEST);
    if (!has(req.body, ["writable"]))
      throw new CodeError("You must specify a valid permission data", status.BAD_REQUEST);
    const { username, writable } = req.body;
    if (typeof writable !== "boolean") {
      throw new CodeError(
        "You must specify a valid permission data (true or false)",
        status.BAD_REQUEST
      );
    }

    try {
      const user = await getUser(req.tokenDecoded);
      if (!(await user.hasNote(id))) {
        res.status(404).json({ status: false, message: "Note not found" });
        return;
      }
      const target = await userModel.findOne({ where: { username: username } });
      if (!target || target.username === user.username) {
        res.status(404).json({ status: false, message: "Target not found" });
        return;
      }

      if (await collaboratorsModel.findOne({ where: { userId: target.id, noteId: id } })) {
        res
          .status(305)
          .json({ status: false, message: "Target is already a collaborator of this note" });
        return;
      }

      await collaboratorsModel.create({ userId: target.id, noteId: id, write: writable });
      res.status(201).json({});
    } catch (e) {
      res.status(500).json({ status: false, message: e.message });
      return;
    }
  },

  async updateCollaborator(req, res) {
    // #swagger.tags = ['Notes']
    // #swagger.summary = 'Edit the permissions of a collaborator on a specific note'
    // #swagger.parameters['obj'] = { in: 'body', description:'Edit the permissions a collaborator on a specific note', schema: { $username: 'JohnDoe123', $writable: true}}
    /* #swagger.security = [{
        "apiKeyAuth": []
    }]
    */
    if (!has(req.params, ["id"]))
      throw new CodeError("You must specify a valid note id ", status.BAD_REQUEST);
    const id = parseInt(req.params.id);
    if (!has(req.body, ["username"]))
      throw new CodeError("You must specify a valid username for the target", status.BAD_REQUEST);
    if (!has(req.body, ["writable"]))
      throw new CodeError("You must specify a valid permission data", status.BAD_REQUEST);
    const { username, writable } = req.body;
    if (typeof writable !== "boolean") {
      throw new CodeError(
        "You must specify a valid permission data (true or false)",
        status.BAD_REQUEST
      );
    }

    try {
      const user = await getUser(req.tokenDecoded);
      if (!(await user.hasNote(id))) {
        res.status(404).json({ status: false, message: "Note not found" });
        return;
      }
      const target = await userModel.findOne({ where: { username: username } });
      if (!target) {
        res.status(404).json({ status: false, message: "Target not found" });
        return;
      }

      const collaborator = await collaboratorsModel.findOne({
        where: { userId: target.id, noteId: id },
      });
      if (!collaborator) {
        res
          .status(305)
          .json({ status: false, message: "Target is not a collaborator of this note" });
        return;
      }
      collaborator.write = writable;
      await collaborator.save();
      res.status(200).json({});
    } catch (e) {
      res.status(500).json({ status: false, message: e.message });
      return;
    }
  },

  async listCollaborators(req, res) {
    // #swagger.tags = ['Notes']
    // #swagger.summary = 'List all collaborators of a specific note'
    /* #swagger.security = [{
        "apiKeyAuth": []
    }]
    */
    if (!has(req.params, ["id"]))
      throw new CodeError("You must specify a valid note id ", status.BAD_REQUEST);
    const id = parseInt(req.params.id);

    try {
      const user = await getUser(req.tokenDecoded);
      if (!(await user.hasNote(id))) {
        res.status(404).json({ status: false, message: "Note not found" });
        return;
      }
      const note = await noteModel.findOne({ where: { id: id } });

      let collaborators = [];
      for (let collaborator of await note.getCollaborators()) {
        collaborators.push({
          username: collaborator.username,
          writable: collaborator.collaborators.write,
        });
      }
      res.status(200).json({ collaborators: collaborators });
    } catch (e) {
      res.status(500).json({ status: false, message: e.message });
      return;
    }
  },

  async deleteCollaborator(req, res) {
    // #swagger.tags = ['Notes']
    // #swagger.summary = 'Delete a collaborator on a specific note'
    // #swagger.parameters['obj'] = { in: 'body', description:'Delete a collaborator on a specific note', schema: { $username: 'JohnDoe123'}}
    /* #swagger.security = [{
        "apiKeyAuth": []
    }]
    */
    if (!has(req.params, ["id"]))
      throw new CodeError("You must specify a valid note id ", status.BAD_REQUEST);
    const id = parseInt(req.params.id);
    if (!has(req.body, ["username"]))
      throw new CodeError("You must specify a valid username for the target", status.BAD_REQUEST);
    const { username } = req.body;

    try {
      const user = await getUser(req.tokenDecoded);
      if (!(await user.hasNote(id))) {
        res.status(404).json({ status: false, message: "Note not found" });
        return;
      }
      const target = await userModel.findOne({ where: { username: username } });
      if (!target) {
        res.status(404).json({ status: false, message: "Target not found" });
        return;
      }

      const collaborator = await collaboratorsModel.findOne({
        where: { userId: target.id, noteId: id },
      });
      if (!collaborator) {
        res
          .status(305)
          .json({ status: false, message: "Target is not a collaborator of this note" });
        return;
      }
      collaborator.destroy();
      res.status(200).json({});
    } catch (e) {
      res.status(500).json({ status: false, message: e.message });
      return;
    }
  },
};
