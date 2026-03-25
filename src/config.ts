// Lib
import dotenv from 'dotenv';

// Tipagem
type ConfigType = {
  PORT: number;
  MONGODB_URL: string;
  META_SECRET_KEY: string;
  META_API_URL: string;
}

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

const Config: ConfigType = {
  PORT: parseInt(process.env.PORT as string) || 3000,
  MONGODB_URL: process.env.MONGODB_URL as string,
  META_SECRET_KEY: process.env.META_SECRET_KEY as string,
  META_API_URL: 'https://graph.facebook.com/',
};

export default Config;