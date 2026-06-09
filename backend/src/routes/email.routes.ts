import { Router } from 'express';
import { sendEmail } from '../controllers/emailController';

const router = Router();

// Gestion explicite des requêtes OPTIONS (CORS preflight)
router.options('/', (req, res) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3001');
  res.header('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.status(200).send();
});

// Route principale pour envoyer des emails avec pièces jointes
router.post('/', sendEmail);

export default router;
