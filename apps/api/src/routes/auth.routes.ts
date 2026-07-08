import { Router } from 'express';
import { registrar, iniciarSesion, obtenerPerfil } from '../controllers/auth.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.post('/registro', registrar);
router.post('/login', iniciarSesion);
router.get('/perfil', requireAuth, obtenerPerfil);

export default router;
