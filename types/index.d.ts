import { Collection } from 'mongodb';

declare global {
  namespace Express {
    interface Request {
      // Adicionamos a coleção do mongo diretamente na requisição
      mongoCollection: Collection;
      targetDb: string;
      targetCollection: string;
    }
  }
}

export {};