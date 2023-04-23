// Load Enviroment Variables to process.env (if not present take variables defined in .env file)
const { createServer } = require("http");

require("mandatoryenv").load(["PORT"]);
const { PORT } = process.env;

const socketServer = require("./socket");
const app = require("./app");

const httpServer = createServer(app);
socketServer(httpServer);

// Instantiate an Express Application
// Open Server on selected Port
httpServer.listen(PORT, () => console.info("Server listening on port ", PORT));
