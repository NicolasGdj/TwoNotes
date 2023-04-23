const argon2 = require("argon2");

const all = require("../models/all.js");

async function init() {
  for (let db in all) {
    await all[db].sync({ force: true });
  }

  // Create a test user
  const [username, password] = ["test", await argon2.hash("test")];
  const user = await all.users.create({ username, password });

  // Create a note
  const note = await user.createNote({ title: "My first note" });

  // Add test as collaborator, with write permissions
  await all.collaborators.create({ userId: user.id, noteId: note.id, write: true });
}

init();
