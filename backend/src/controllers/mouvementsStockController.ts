import { Request, Response } from 'express';

const unavailable = (_req: Request, res: Response): void => {
  res.status(501).json({
    success: false,
    code: 'STOCK_MOVEMENTS_NOT_IN_SCHEMA',
    message:
      'La structure MegaCaisse ne contient pas de table d’historique des mouvements de stock.',
  });
};

export class MouvementsStockController {
  static sortieStock = unavailable;
  static getHistorique = unavailable;
  static getStatistiques = unavailable;
}
