const app = require("../app");
const request = require("supertest");

//Pas besoin de commentaire, ce language est suffisament explicit.

describe("Login/Register", () => {
  let token;

  test("Try to login with an unregistered user", async () => {
    await request(app)
      .post("/api/users/login")
      .send({ username: "xX_DarkK3vinDu13_Xx", password: "wow" })
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(403);
  });

  test("Try to register a new user", async () => {
    await request(app)
      .post("/api/users/register")
      .send({ username: "xX_DarkK3vinDu13_Xx", password: "wow" })
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(201);
  });

  test("Try to register with a bad username", async () => {
    await request(app)
      .post("/api/users/register")
      .send({ username: "xX_DarkK3 vinDu13_Xx", password: "wow" })
      .set("Accept", "application/json")
      .expect(304);
  });

  test("Try to login a registered user", async () => {
    const response = await request(app)
      .post("/api/users/login")
      .send({ username: "xX_DarkK3vinDu13_Xx", password: "wow" })
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(200);
    token = response.body.token;
  });

  test("Who am i ?", async () => {
    await request(app)
      .get("/api/whoami")
      .set("x-access-token", token)
      .expect("Content-Type", /json/)
      .expect(200, {
        data: "xX_DarkK3vinDu13_Xx",
      });
  });

  test("Try to register an existing user", async () => {
    await request(app)
      .post("/api/users/register")
      .send({ username: "xX_DarkK3vinDu13_Xx", password: "wow" })
      .set("Accept", "application/json")
      .expect(304);
  });

  test("Try to login with a wrong password", async () => {
    await request(app)
      .post("/api/users/login")
      .send({ username: "xX_DarkK3vinDu13_Xx", password: "Uwu" })
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(403);
  });

  test("Try to login an unknown user", async () => {
    await request(app)
      .post("/api/users/login")
      .send({ username: "Uwu", password: "wow" })
      .set("Accept", "application/json")
      .expect("Content-Type", /json/)
      .expect(403);
  });
});
