import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { listarAlimentos, obtenerAlimento } from '../controllers/alimento.controller';

const router = Router();

router.use(requireAuth);

router.get('/', listarAlimentos);
router.get('/:alimentoId', obtenerAlimento);

export default router;
