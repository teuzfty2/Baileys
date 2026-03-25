/// <reference path="../types/index.d.ts" />

//Libs
import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';

//Config
import Config from './config';
import swaggerSpec from './swagger';
import { connectToMongo } from './services/mongo';

// Importar as rotas
import routes from './routes';

//Inicia o APP e passa suas propriedades
const app = express();
app.use(cors());
app.use(express.json({limit: '50mb'}));

// Rota de Documentação Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

//Cria a Rota base da API
app.use('/api', routes);

// Função de inicialização
const startServer = async () => {
  // Conecta ao Banco de Dados antes de ouvir a porta
  await connectToMongo();

  //Inicia o servidor
  app.listen(Config.PORT, () => {
    console.log(`Servidor rodando em: http://localhost:${Config.PORT}`);
    console.log(`Documentação disponível em: http://localhost:${Config.PORT}/api-docs`);
  });
};

startServer();