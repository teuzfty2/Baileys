import { Request, Response, NextFunction } from 'express';
import { getCollection } from '../services/mongo';

/**
 * Middleware para validar e injetar a coleção do MongoDB na requisição.
 * Espera receber 'base' e 'collection' via Body, Query ou Headers.
 */
export const mongoMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    // Busca os parâmetros no Body, Query ou Headers (nesta ordem de prioridade)
    // Headers: x-base, x-collection
    const base = req.body.base || req.query.base || req.headers['x-base'];
    const collection = req.body.collection || req.query.collection || req.headers['x-collection'];

    // Validação
    if (!base || typeof base !== 'string') {
      res.status(400).json({ 
        error: 'Parâmetro obrigatório ausente ou inválido: base (Nome do Banco de Dados)' 
      });
      return;
    }

    if (!collection || typeof collection !== 'string') {
      res.status(400).json({ 
        error: 'Parâmetro obrigatório ausente ou inválido: collection (Nome da Coleção/Pasta)' 
      });
      return;
    }

    // Injeta os dados na requisição para uso nas rotas
    req.targetDb = base;
    req.targetCollection = collection;
    
    // Obtém a instância da coleção e anexa ao Request
    req.mongoCollection = getCollection(base, collection);

    next();
  } catch (error) {
    console.error('Erro no middleware do MongoDB:', error);
    res.status(500).json({ error: 'Erro interno ao conectar com o banco de dados especificado.' });
    return;
  }
};