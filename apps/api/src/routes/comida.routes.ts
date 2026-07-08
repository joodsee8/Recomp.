import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { listarComidas, obtenerComida } from '../controllers/comida.controller';

const router = Router();

router.use(requireAuth);

router.get('/', listarComidas);
router.get('/:comidaId', obtenerComida);

export default router;
