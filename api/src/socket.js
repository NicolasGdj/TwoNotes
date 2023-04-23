const { Server } = require("socket.io");
const jws = require("jws");
const userModel = require("./models/users.js");
const noteModel = require("./models/notes.js");
const collaboratorModel = require("./models/collaborators.js");
const strokeModel = require("./models/strokes.js");

async function getUser(username) {
  const user = await userModel.findOne({ where: { username: username } });
  if (user) {
    return user;
  } else {
    throw new CodeError("Unable to connect to database", status.INTERNAL_SERVER_ERROR);
  }
}

async function getNote(noteID) {
  const note = await noteModel.findOne({ where: { id: noteID } });
  if (note) {
    return note;
  } else {
    throw new CodeError("Unable to connect to database", status.INTERNAL_SERVER_ERROR);
  }
}

function init(httpServer) {
  const io = new Server(httpServer, {});

  io.use(async (socket, next) => {
    const noteID = socket.handshake.query.noteID;
    const token = socket.handshake.auth.token;

    try {
      const user = await getUser(jws.decode(token).payload);
      const note = await getNote(noteID);

      if (note.ownerId === user.id) {
        console.log(`Auth request for noteID ${noteID} (token: ${token}) -> approved`);

        socket.data.note = note;
        socket.data.write = true;
        next();
      } else {
        const colab = await collaboratorModel.findOne({
          where: { userId: user.id, noteId: note.id },
        });
        if (colab) {
          console.log(`Auth request for noteID ${noteID} (token: ${token}) -> approved`);

          socket.data.note = note;
          socket.data.write = colab.write;
          next();
        } else next(new Error("User is not authorized !"));
      }
    } catch (err) {
      console.log(err);
      console.log(`Auth request for ${noteID} (token: ${token}) -> refused`);
      next(new Error("User is not authorized !"));
    }
  });

  io.on("connection", async (socket) => {
    const note = socket.data.note;
    const strokes = await note.getStrokes();
    const log = (...args) => console.log(`[${note.id}]`, ...args);
    socket.join(note.id);
    log(
      `Connection established.`,
      `Initial transport method: ${socket.conn.transport.name}.`,
      `\n     Rooms joined: ${Array.from(socket.rooms.values()).join(", ")}`
    );

    socket.conn.once("upgrade", () => {
      // Called when the transport is upgraded (i.e. from HTTP long-polling to WebSocket)
      log(`Upgraded transport to ${socket.conn.transport.name}`);
    });

    socket.conn.on("close", () => {
      log(`Connection closed!`);
    });

    const listStrokes = [];
    for (const stroke of strokes) {
      listStrokes.push({
        id: stroke.strokeId,
        points: {
          points: stroke.points,
          color: stroke.color,
          width: stroke.width,
          style: stroke.style,
        },
        finished: true,
      });
    }

    if (listStrokes.length > 0) {
      // add previous strokes
      socket.emit("draw[]", listStrokes);
    }

    if (socket.data.write) {
      socket.on("draw", async (id, curveData, finished) => {
        log(`Draw`);
        if (finished) {
          await strokeModel.create({
            noteId: note.id,
            strokeId: id,
            points: curveData.points,
            color: curveData.color,
            width: curveData.width,
            style: curveData.style,
          });
          console.log(strokeModel);
        }
        socket.to(note.id).emit("draw", id, curveData, finished);
      });

      socket.on("delete", (ids) => {
        log(`Delete`);
        strokeModel.destroy({
          where: { noteId: note.id, strokeId: ids },
        });
        socket.to(note.id).emit("delete", ids);
      });
    }
  });
}

module.exports = init;
