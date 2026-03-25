import { MongoClient, Db, Collection } from 'mongodb';
import Config from '../config';

// Variável para armazenar a instância do cliente
let client: MongoClient | null = null;

/**
 * Inicia a conexão com o MongoDB
 */
export const connectToMongo = async (): Promise<MongoClient> => {
  if (client) return client;

  try {
    client = new MongoClient(Config.MONGODB_URL);
    await client.connect();
    console.log('Conectado ao MongoDB com sucesso!');
    return client;
  } catch (error) {
    console.error('Erro ao conectar ao MongoDB:', error);
    process.exit(1);
  }
};

/**
 * Retorna a instância do cliente conectado
 */
export const getClient = (): MongoClient => {
  if (!client) {
    throw new Error('MongoDB não está conectado. Chame connectToMongo() primeiro.');
  }
  return client;
};

/**
 * Helper para obter uma coleção específica dinamicamente
 */
export const getCollection = (dbName: string, collectionName: string): Collection => {
  const client = getClient();
  return client.db(dbName).collection(collectionName);
};