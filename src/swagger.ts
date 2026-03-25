import swaggerJsdoc from "swagger-jsdoc";
import Config from "./config";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "WaTools Baileys API",
      version: "1.0.0",
      description: "API robusta para gerenciamento de grupos e contatos WhatsApp.",
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
  // Escaneia arquivos em subpastas para capturar todas as anotações
  apis: ["./src/routes/**/*.ts", "./src/index.ts"],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;