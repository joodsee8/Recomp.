import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.middleware';
import { enviarMensaje } from '../controllers/chat.controller';

const router = Router();

router.use(requireAuth);

router.post('/', enviarMensaje);

export default router;
