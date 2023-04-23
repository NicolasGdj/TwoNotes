const app = require("../app");
const request = require("supertest");

//Pas besoin de commentaire, ce language est suffisament explicite.

describe("Notes management", () => {
  const USERNAME = "T3ST3R_NOTES";
  const PASSWORD = "1337";

  let token;

  test("Initialize test user", async () => {
    await request(app)
      .post("/api/users/register")
      .send({ username: USERNAME, password: PASSWORD })
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(201);

    const response = await request(app)
      .post("/api/users/login")
      .send({ username: USERNAME, password: PASSWORD })
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200);
    token = response.body.token;
  });

  test("[LIST] Empty personal notes", async () => {
    await request(app).get("/api/notes").set("x-access-token", token).expect(200, {
      notes: [],
    });
  });

  test("[LIST-SHARED] Empty shared notes", async () => {
    await request(app).get("/api/notes/shared").set("x-access-token", token).expect(200, {
      notes: [],
    });
  });

  test("[DELETE] Remove a unknown note", async () => {
    await request(app).delete("/api/notes/1").set("x-access-token", token).expect(404);
  });

  test("[CREATE] Add a new note", async () => {
    await request(app)
      .post("/api/notes")
      .send({ title: "My Note #1" })
      .set("x-access-token", token)
      .expect(201);
  });

  test("[LIST] List one note", async () => {
    await request(app)
      .get("/api/notes")
      .set("x-access-token", token)
      .expect(function (res) {
        //Delete an incomparable return parameter for all notes
        res.body.notes.forEach((note) => {
          delete note.updatedAt;
          delete note.id;
        });
      })
      .expect(200, {
        notes: [
          {
            title: "My Note #1",
          },
        ],
      });
  });

  test("[LIST-SHARED] List shared notes after adding a personal note", async () => {
    await request(app).get("/api/notes/shared").set("x-access-token", token).expect(200, {
      notes: [],
    });
  });

  test("[DELETE] Remove a existing note", async () => {
    await request(app).delete("/api/notes/2").set("x-access-token", token).expect(200);
  });

  test("[CREATE] Add two notes", async () => {
    await request(app)
      .post("/api/notes")
      .send({ title: "My Note #2" })
      .set("x-access-token", token)
      .expect(201);
    await request(app)
      .post("/api/notes")
      .send({ title: "My Note #3" })
      .set("x-access-token", token)
      .expect(201);
  });

  test("Initialize a new test user with some notes", async () => {
    let token;
    const USERNAME2 = USERNAME + "_2";
    await request(app)
      .post("/api/users/register")
      .send({ username: USERNAME2, password: PASSWORD })
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(201);

    const response = await request(app)
      .post("/api/users/login")
      .send({ username: USERNAME2, password: PASSWORD })
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200);
    token = response.body.token;

    await request(app)
      .post("/api/notes")
      .send({ title: "My personal note #1" })
      .set("x-access-token", token)
      .expect(201);

    await request(app)
      .get("/api/notes")
      .set("x-access-token", token)
      .expect(function (res) {
        //Delete an incomparable return parameter for all notes
        res.body.notes.forEach((note) => {
          delete note.updatedAt;
          delete note.id;
        });
      })
      .expect(200, {
        notes: [
          {
            title: "My personal note #1",
          },
        ],
      });
  });

  test("[LIST] List only my two personal notes", async () => {
    await request(app)
      .get("/api/notes")
      .set("x-access-token", token)
      .expect(function (res) {
        //Delete an incomparable return parameter for all notes
        res.body.notes.forEach((note) => {
          delete note.updatedAt;
          delete note.id;
        });
      })
      .expect(200, {
        notes: [
          {
            title: "My Note #2",
          },
          {
            title: "My Note #3",
          },
        ],
      });
  });
});

describe("Shared notes management", () => {
  let user1 = {
    username: "T3ST3R_SHARED_NOTES",
    password: "1337",
    token: null,
    noteId: null,
  };

  let user2 = {
    username: "T3ST3R_SHARED_NOTES2",
    password: "1337",
    token: null,
    noteId: null,
  };

  test("Initialize test users with a personal note each", async () => {
    await request(app)
      .post("/api/users/register")
      .send({ username: user1.username, password: user1.password })
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(201);

    let response = await request(app)
      .post("/api/users/login")
      .send({ username: user1.username, password: user1.password })
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200);
    user1.token = response.body.token;

    await request(app)
      .post("/api/notes")
      .send({ title: "First user note #1" })
      .set("x-access-token", user1.token)
      .expect(201);

    await request(app)
      .get("/api/notes")
      .set("x-access-token", user1.token)
      .expect(200)
      .expect(function (res) {
        user1.noteId = res.body.notes[0].id;
      });

    await request(app)
      .post("/api/users/register")
      .send({ username: user2.username, password: user2.password })
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(201);

    response = await request(app)
      .post("/api/users/login")
      .send({ username: user2.username, password: user2.password })
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200);
    user2.token = response.body.token;

    await request(app)
      .post("/api/notes")
      .send({ title: "Second user note #1" })
      .set("x-access-token", user2.token)
      .expect(201);

    await request(app)
      .get("/api/notes")
      .set("x-access-token", user2.token)
      .expect(200)
      .expect(function (res) {
        user2.noteId = res.body.notes[0].id;
      });
  });

  test("[SHARED-LIST] Both has an empty shared list", async () => {
    await request(app).get("/api/notes/shared").set("x-access-token", user1.token).expect(200, {
      notes: [],
    });

    await request(app).get("/api/notes/shared").set("x-access-token", user2.token).expect(200, {
      notes: [],
    });
  });

  test("[SHARE-LIST] List empty collaborators list for the first user note", async () => {
    await request(app)
      .get("/api/notes/" + user1.noteId + "/collaborators")
      .set("x-access-token", user1.token)
      .expect(200, {
        collaborators: [],
      });
  });

  test("[SHARE-LIST] List empty collaborators list for the second user note", async () => {
    await request(app)
      .get("/api/notes/" + user2.noteId + "/collaborators")
      .set("x-access-token", user2.token)
      .expect(200, {
        collaborators: [],
      });
  });

  test("[SHARE-ADD] Add the second user as a collaborator for first user note", async () => {
    await request(app)
      .post("/api/notes/" + user1.noteId + "/collaborators")
      .set("x-access-token", user1.token)
      .send({ username: user2.username, writable: true })
      .expect(201);
  });

  test("[SHARE-LIST] List collaborators of the first user note", async () => {
    await request(app)
      .get("/api/notes/" + user1.noteId + "/collaborators")
      .set("x-access-token", user1.token)
      .expect(200, {
        collaborators: [
          {
            username: user2.username,
            writable: true,
          },
        ],
      });
  });

  test("[SHARED-LIST] User2 can see user1's note", async () => {
    await request(app)
      .get("/api/notes/shared")
      .set("x-access-token", user2.token)
      .expect(function (res) {
        //Delete an incomparable return parameter for all notes
        res.body.notes.forEach((note) => {
          delete note.updatedAt;
          delete note.id;
        });
      })
      .expect(200, {
        notes: [
          {
            title: "First user note #1",
            owner: user1.username,
            writable: true,
          },
        ],
      });
  });

  test("[SHARED-LIST] User1 has a empty shared list", async () => {
    await request(app).get("/api/notes/shared").set("x-access-token", user1.token).expect(200, {
      notes: [],
    });
  });

  test("[SHARE-ADD] Adding a collaborator to a note not owned ", async () => {
    await request(app)
      .post("/api/notes/" + user1.noteId + "/collaborators")
      .set("x-access-token", user2.token)
      .send({ username: user2.username, writable: true })
      .expect(404);
  });

  test("[SHARE-ADD] Adding the user himself as a collaborator ", async () => {
    await request(app)
      .post("/api/notes/" + user1.noteId + "/collaborators")
      .set("x-access-token", user1.token)
      .send({ username: user1.username, writable: true })
      .expect(404);
  });

  test("[SHARE-ADD] Adding an unknown user as a collaborator ", async () => {
    await request(app)
      .post("/api/notes/" + user1.noteId + "/collaborators")
      .set("x-access-token", user1.token)
      .send({ username: "UNKNOWN", writable: true })
      .expect(404);
  });

  test("[SHARE-DELETE] Delete the second user as a collaborator of first user note", async () => {
    await request(app)
      .delete("/api/notes/" + user1.noteId + "/collaborators")
      .set("x-access-token", user1.token)
      .send({ username: user2.username })
      .expect(200);
  });

  test("[SHARE-DELETE] Delete an unknown user", async () => {
    await request(app)
      .delete("/api/notes/" + user1.noteId + "/collaborators")
      .set("x-access-token", user1.token)
      .send({ username: "UKNOWN" })
      .expect(404);
  });

  test("[SHARE-DELETE] Deleting a user who is not a collaborator", async () => {
    await request(app)
      .delete("/api/notes/" + user1.noteId + "/collaborators")
      .set("x-access-token", user1.token)
      .send({ username: user2.username })
      .expect(305);
  });

  test("[SHARE-ADD] Add the first user as a collaborator of the second user note", async () => {
    await request(app)
      .post("/api/notes/" + user2.noteId + "/collaborators")
      .set("x-access-token", user2.token)
      .send({ username: user1.username, writable: false })
      .expect(201);
  });

  test("[SHARED-LIST] User1 can see user2's note", async () => {
    await request(app)
      .get("/api/notes/shared")
      .set("x-access-token", user1.token)
      .expect(function (res) {
        //Delete an incomparable return parameter for all notes
        res.body.notes.forEach((note) => {
          delete note.updatedAt;
        });
      })
      .expect(200, {
        notes: [
          {
            id: user2.noteId,
            title: "Second user note #1",
            owner: user2.username,
            writable: false,
          },
        ],
      });
  });

  test("[SHARED-LIST] User2 has a empty shared list", async () => {
    await request(app).get("/api/notes/shared").set("x-access-token", user2.token).expect(200, {
      notes: [],
    });
  });
});
