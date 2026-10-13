import { Request, Response } from 'express';

const unavailable = (_req: Request, res: Response): void => {
  res.status(501).json({
    success: false,
    code: 'STORE_STOCK_NOT_IN_SCHEMA',
    message:
      'La structure MegaCaisse ne contient pas de quantité de stock disponible par article et par magasin.',
  });
};

export class StockMagasinController {
  static getAllStocks = unavailable;
  static getStockById = unavailable;
  static getStocksByMagasin = unavailable;
  static getStocksByArticle = unavailable;
  static getStockAlerts = unavailable;
  static createStock = unavailable;
  static updateStock = unavailable;
  static deleteStock = unavailable;
}
