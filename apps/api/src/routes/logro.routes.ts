import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { listarLogros, generarLogros } from '../controllers/logro.controller';

const router = Router();

router.use(requireAuth);

router.get('/', listarLogros);
router.post('/generar', generarLogros);

export default router;
