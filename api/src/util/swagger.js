const swaggerAutogen = require("swagger-autogen")();

const outputFile = "./swagger_output.json";
const endpointsFiles = ["src/routes/*.js"];
const { INSTANCE } = process.env;

const doc = {
  host: INSTANCE !== "dev" ? "two-notes.herokuapp.com" : "localhost:3000",
  basePath: "/",
  schemes: INSTANCE !== "dev" ? ["https"] : ["http"],
  securityDefinitions: {
    apiKeyAuth: {
      type: "apiKey",
      in: "header",
      name: "x-access-token",
      description: "Access token",
    },
  },
};

swaggerAutogen(outputFile, endpointsFiles, doc);
