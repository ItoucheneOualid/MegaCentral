import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { getRequiredEnvVar } from '../config/env';

/**
 * Authentifie les systèmes externes (ex: MegaCaisse) via une clé API dédiée,
 * transmise dans l'en-tête "x-api-key". Comparaison en temps constant pour
 * éviter les attaques par timing.
 */
export const authenticateMegaCaisse = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const providedKey = req.header('x-api-key');
  const expectedKey = getRequiredEnvVar('MEGACAISSE_API_KEY');

  if (!providedKey) {
    return res.status(401).json({
      status: 'error',
      message: 'Clé API manquante',
      code: 'API_KEY_MISSING',
    });
  }

  const providedBuffer = Buffer.from(providedKey);
  const expectedBuffer = Buffer.from(expectedKey);

  const isValid =
    providedBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(providedBuffer, expectedBuffer);

  if (!isValid) {
    return res.status(401).json({
      status: 'error',
      message: 'Clé API invalide',
      code: 'API_KEY_INVALID',
    });
  }

  next();
};
