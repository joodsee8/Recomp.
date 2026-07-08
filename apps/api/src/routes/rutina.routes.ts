import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { listarRutinas, obtenerRutina, obtenerDiaDeRutina } from '../controllers/rutina.controller';

const router = Router();

router.use(requireAuth);

router.get('/', listarRutinas);
router.get('/:rutinaId', obtenerRutina);
router.get('/:rutinaId/dias/:diaId', obtenerDiaDeRutina);

export default router;
