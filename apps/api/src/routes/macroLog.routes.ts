import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import {
  obtenerResumenDelDia,
  agregarAlimentoConsumido,
  eliminarAlimentoConsumido
} from '../controllers/macroLog.controller';

const router = Router();

router.use(requireAuth);

router.get('/:fecha', obtenerResumenDelDia);
router.post('/:fecha/alimentos', agregarAlimentoConsumido);
router.delete('/:fecha/alimentos/:itemId', eliminarAlimentoConsumido);

export default router;
