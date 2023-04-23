const Sequelize = require("sequelize");
const db = require("./database.js");

const users = db.define("users", {
  id: {
    primaryKey: true,
    type: Sequelize.INTEGER,
    autoIncrement: true,
  },
  username: {
    type: Sequelize.STRING(32),
    allowNull: false,
    unique: true,
    validate: {
      is: /^[a-z\-_0-9]{1,32}$/i,
    },
  },
  password: {
    type: Sequelize.STRING(43),
  },
});

const notes = db.define("notes", {
  id: {
    primaryKey: true,
    type: Sequelize.INTEGER,
    autoIncrement: true,
  },
  title: {
    type: Sequelize.STRING(200),
    allowNull: false,
    validate: {
      is: /^[a-z\-_ #0-9]{1,200}$/i,
    },
  },
  width: {
    type: Sequelize.INTEGER,
  },
  height: {
    type: Sequelize.INTEGER,
  },
});

users.hasMany(notes, {
  foreignKey: "ownerId",
});

notes.belongsTo(users, {
  as: "owner",
});

const collaborators = db.define("collaborators", {
  noteId: {
    type: Sequelize.INTEGER,
    references: {
      model: notes,
      key: "id",
    },
  },
  userId: {
    type: Sequelize.INTEGER,
    references: {
      model: users,
      key: "id",
    },
  },
  write: {
    type: Sequelize.BOOLEAN,
  },
});

users.belongsToMany(notes, { as: "SharedNotes", through: collaborators });
notes.belongsToMany(users, { as: "Collaborators", through: collaborators });

const strokes = db.define("strokes", {
  strokeId: {
    primaryKey: true,
    type: Sequelize.FLOAT,
  },
  noteId: {
    type: Sequelize.INTEGER,
    references: {
      model: notes,
      key: "id",
    },
  },
  color: {
    type: Sequelize.STRING(20),
    allowNull: false,
  },
  width: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  style: {
    type: Sequelize.STRING(20),
    allowNull: false,
  },
  points: {
    type: Sequelize.DataTypes.JSON,
    allowNull: false,
  },
});

notes.hasMany(strokes, {
  foreignKey: "noteId",
});

strokes.belongsTo(notes, {
  as: "owner",
});

module.exports = {
  users: users,
  notes: notes,
  collaborators: collaborators,
  strokes: strokes,
};
