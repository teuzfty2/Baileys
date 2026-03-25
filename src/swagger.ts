import swaggerJsdoc from "swagger-jsdoc";
import Config from "./config";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "WaTools Baileys API",
      version: "1.0.0",
      description:
        "API para gerenciamento de grupos na waTools!",
      contact: {
        name: "WaTools Team",
        email: "watoolsbr@gmail.com",
      },
    },
    servers: [
      {
        url: `http://localhost:${Config.PORT}/api`,
        description: "Servidor Local",
      },
    ],

  },
  apis: ["./src/routes/**/*.ts", "./src/index.ts"],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
